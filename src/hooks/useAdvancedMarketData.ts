
import { useQuery } from '@tanstack/react-query';
import { CoinData } from '@/types/crypto';

const fetchAdvancedMarketData = async (): Promise<CoinData[]> => {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=1h%2C24h%2C7d'
  );
  if (!response.ok) {
    throw new Error('Failed to fetch advanced market data');
  }
  return response.json();
};

export const useAdvancedMarketData = () => {
  return useQuery<CoinData[], Error>({
    queryKey: ['advancedMarketData'],
    queryFn: fetchAdvancedMarketData,
    staleTime: 1000 * 60 * 60 * 3, // 3 hours stale time
    refetchInterval: 1000 * 60 * 60 * 4, // 4 hours refetch interval
  });
};

