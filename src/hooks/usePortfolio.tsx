
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface PortfolioItem {
  id: string;
  coinId: string;
  symbol: string;
  name: string;
  amount: number;
  buyPrice: number;
  image: string;
}

const fetchCoinPrices = async (coinIds: string[]) => {
  if (coinIds.length === 0) return {};
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true&include_7d_change=true`
  );
  return response.json();
};

const fetchTopCoins = async () => {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1'
  );
  return response.json();
};

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

  const { data: topCoins = [] } = useQuery({
    queryKey: ['topCoins'],
    queryFn: fetchTopCoins,
  });

  const coinIds = portfolio.map(item => item.coinId);
  const { data: currentPrices = {} } = useQuery({
    queryKey: ['coinPrices', coinIds],
    queryFn: () => fetchCoinPrices(coinIds),
    enabled: coinIds.length > 0,
    refetchInterval: 30000,
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
    if (!coin) return;

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
  };

  const removeFromPortfolio = (id: string) => {
    setPortfolio(portfolio.filter(item => item.id !== id));
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

      const sharpeRatio = volatility > 0 ? (avgReturn - 2) / volatility : 0;

      const allocations = itemsWithData.map(item => item.currentValue / totalValue);
      const herfindahlIndex = allocations.reduce((sum, allocation) => sum + Math.pow(allocation, 2), 0);
      const diversificationScore = Math.max(0, 100 * (1 - herfindahlIndex));

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
