
import { useState, useEffect } from 'react';
import { useQuery, QueryKey } from '@tanstack/react-query';
import { toast } from 'sonner';

import { fetchTopCoinsForPortfolio, fetchCoinPrices } from '@/services/coingeckoService';
import { calculatePortfolioStats as calculatePortfolioStatsUtil } from '@/utils/portfolioUtils';
import type { PortfolioItem } from '@/types/portfolio';

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

  const { data: topCoins = [] } = useQuery<any[], Error, any[], QueryKey>({
    queryKey: ['topCoinsPortfolio'],
    queryFn: fetchTopCoinsForPortfolio,
    staleTime: 1000 * 60 * 30, // 30 minutes stale time
    refetchInterval: 1000 * 60 * 45, // 45 minutes refetch interval
    meta: {
      onError: (err: Error) => {
        toast.error(`Failed to load top coins for portfolio: ${err.message}`);
      }
    }
  });

  const coinIds = portfolio.map(item => item.coinId);
  const { data: currentPrices = {} } = useQuery<Record<string, { usd: number; usd_24h_change?: number; usd_7d_change?: number }>, Error, Record<string, { usd: number; usd_24h_change?: number; usd_7d_change?: number }>, QueryKey>({
    queryKey: ['portfolioCoinPrices', coinIds],
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
    return calculatePortfolioStatsUtil(portfolio, currentPrices || {});
  };

  return {
    portfolio,
    topCoins,
    addToPortfolio,
    removeFromPortfolio,
    calculatePortfolioStats,
  };
};
