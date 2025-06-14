import { useState, useEffect } from 'react';
import { useQuery, QueryKey } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface PortfolioItem {
  id: string;
  coinId: string;
  symbol: string;
  name: string;
  amount: number;
  buyPrice: number;
  image: string;
}

const genericFetchCoinGecko = async (url: string, errorMessagePrefix: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      let errorText = `${errorMessagePrefix}, status: ${response.status}`;
      if (response.status === 429) {
        errorText = `API rate limit (429) for ${errorMessagePrefix}. Please try again later.`;
      } else {
        try {
          const errorData = await response.json();
          errorText += ` - Details: ${JSON.stringify(errorData).substring(0, 100)}`;
        } catch (e) {
          try {
            const textData = await response.text();
            errorText += ` - Response: ${textData.substring(0, 100) || '(empty body)'}`;
          } catch (textE) {
            errorText += ` (${response.statusText || 'Failed to parse error response body'})`;
          }
        }
      }
      console.error(`Error in genericFetchCoinGecko for ${url}: ${errorText}`);
      throw new Error(errorText);
    }
    return response.json();
  } catch (error) {
    console.error(`Network or other error in genericFetchCoinGecko for ${url}:`, error);
    if (error instanceof Error && error.message.includes(errorMessagePrefix.split(" (")[0])) { // if already custom error
        throw error;
    }
    throw new Error(`Network error during ${errorMessagePrefix}: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const fetchCoinPrices = async (coinIds: string[]) => {
  if (coinIds.length === 0) return {};
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true&include_7d_change=true`;
  return genericFetchCoinGecko(url, "fetching portfolio coin prices");
};

const fetchTopCoins = async () => {
  const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1';
  return genericFetchCoinGecko(url, "fetching top coins for portfolio");
};

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

  const { data: topCoins = [] } = useQuery<any[], Error, any[], QueryKey>({ // Use QueryKey type
    queryKey: ['topCoinsPortfolio'], // Changed key to avoid conflict if 'topCoins' is used elsewhere with different settings
    queryFn: fetchTopCoins,
    staleTime: 1000 * 60 * 30, // 30 minutes stale time
    refetchInterval: 1000 * 60 * 45, // 45 minutes refetch interval
    meta: {
      onError: (err: Error) => {
        toast.error(`Failed to load top coins for portfolio: ${err.message}`);
      }
    }
  });

  const coinIds = portfolio.map(item => item.coinId);
  const { data: currentPrices = {} } = useQuery<Record<string, { usd: number; usd_24h_change?: number; usd_7d_change?: number }>, Error, Record<string, { usd: number; usd_24h_change?: number; usd_7d_change?: number }>, QueryKey>({ // Use QueryKey type
    queryKey: ['portfolioCoinPrices', coinIds], // Changed key
    queryFn: () => fetchCoinPrices(coinIds),
    enabled: coinIds.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes stale time
    refetchInterval: 1000 * 60 * 5, // 5 minutes refetch interval
    meta: {
      onError: (err: Error) => {
        toast.error(`Failed to load portfolio prices: ${err.message}`);
      }
    }
  });

  useEffect(() => {
    const savedPortfolio = localStorage.getItem('cryptoPortfolio');
    if (savedPortfolio) {
      try {
        setPortfolio(JSON.parse(savedPortfolio));
      } catch (error) {
        console.error('Error parsing portfolio from localStorage:', error);
        setPortfolio([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cryptoPortfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  const addToPortfolio = (coinId: string, amount: number, buyPrice: number) => {
    const coin = topCoins.find((c: any) => c.id === coinId);
    if (!coin) {
      toast.error(`Could not find coin with ID: ${coinId} in the top coins list.`);
      return;
    }

    const newItem: PortfolioItem = {
      id: Date.now().toString(),
      coinId: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      amount: amount,
      buyPrice: buyPrice,
      image: coin.image,
    };

    setPortfolio([...portfolio, newItem]);
    toast.success(`${coin.name} added to portfolio.`);
  };

  const removeFromPortfolio = (id: string) => {
    const itemToRemove = portfolio.find(item => item.id === id);
    setPortfolio(portfolio.filter(item => item.id !== id));
    if (itemToRemove) {
      toast.info(`${itemToRemove.name} removed from portfolio.`);
    }
  };

  const calculatePortfolioStats = () => {
    let totalValue = 0;
    let totalCost = 0;
    let totalPnL = 0;

    const itemsWithData = portfolio.map(item => {
      const priceData = currentPrices[item.coinId];
      const currentPrice = priceData?.usd || 0;
      const currentValue = item.amount * currentPrice;
      const cost = item.amount * item.buyPrice;
      const pnl = currentValue - cost;
      const pnlPercentage = cost > 0 ? (pnl / cost) * 100 : 0;

      totalValue += currentValue;
      totalCost += cost;
      totalPnL += pnl;

      return {
        ...item,
        currentPrice,
        currentValue,
        cost,
        pnl,
        pnlPercentage,
        change24h: priceData?.usd_24h_change || 0,
        change7d: priceData?.usd_7d_change || 0,
      };
    });

    const totalPnLPercentage = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

    const calculateRiskMetrics = () => {
      if (itemsWithData.length === 0) return { sharpeRatio: 0, volatility: 0, diversificationScore: 0 };

      const returns = itemsWithData.map(item => item.change24h || 0);
      const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
      const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
      const volatility = Math.sqrt(variance);

      // Simplified Sharpe Ratio, assuming risk-free rate of 0 for simplicity in this context
      const sharpeRatio = volatility > 0 ? avgReturn / volatility : 0; 

      const allocations = itemsWithData.map(item => item.currentValue / totalValue);
      const herfindahlIndex = allocations.reduce((sum, allocation) => sum + Math.pow(allocation, 2), 0);
      // Ensure diversificationScore is not negative and scaled to 100
      let diversificationScore = 0;
      if (allocations.length > 1) { // HHI is 1 for single asset, leading to 0 diversification
         diversificationScore = Math.max(0, 100 * (1 - herfindahlIndex));
      } else if (allocations.length === 1 && totalValue > 0) {
         diversificationScore = 0; // Single asset means no diversification
      }

      return { sharpeRatio, volatility, diversificationScore };
    };

    const riskMetrics = calculateRiskMetrics();

    return {
      items: itemsWithData,
      totalValue,
      totalCost,
      totalPnL,
      totalPnLPercentage,
      ...riskMetrics,
    };
  };

  return {
    portfolio,
    topCoins,
    addToPortfolio,
    removeFromPortfolio,
    calculatePortfolioStats,
  };
};
