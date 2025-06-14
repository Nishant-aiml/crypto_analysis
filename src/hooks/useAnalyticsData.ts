import { useQuery } from '@tanstack/react-query';
import { CoinData } from '@/types/crypto';
import { toast } from 'sonner';

// Define types for the data we'll fetch
interface TrendingCoinItem {
  item: {
    id: string;
    coin_id: number;
    name: string;
    symbol: string;
    market_cap_rank: number;
    thumb: string;
    score: number;
  };
}

interface TrendingData {
  coins: TrendingCoinItem[];
  exchanges: any[]; // Add a more specific type if known
}

interface Exchange {
  id: string;
  name: string;
  year_established: number;
  country: string;
  description: string;
  url: string;
  image: string;
  has_trading_incentive: boolean;
  trust_score: number;
  trust_score_rank: number;
  trade_volume_24h_btc: number;
  trade_volume_24h_btc_normalized: number;
}

export interface AnalyticsPageData {
  marketData?: CoinData[];
  trendingCoins?: TrendingCoinItem[];
  exchanges?: Exchange[];
}

interface AnalyticsDataError {
  marketDataError?: Error | null;
  trendingCoinsError?: Error | null;
  exchangesError?: Error | null;
}

const fetchAdvancedMarketData = async (): Promise<CoinData[]> => {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=1h%2C24h%2C7d'
  );
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Failed to read error response');
    console.error('Failed to fetch advanced market data', response.status, errorText);
    throw new Error(`Failed to fetch advanced market data (status ${response.status})`);
  }
  return response.json();
};

const fetchTrendingCoins = async (): Promise<TrendingData> => {
  const response = await fetch('https://api.coingecko.com/api/v3/search/trending');
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Failed to read error response');
    console.error('Failed to fetch trending data', response.status, errorText);
    throw new Error(`Failed to fetch trending data (status ${response.status})`);
  }
  return response.json();
};

const fetchExchanges = async (): Promise<Exchange[]> => {
  const response = await fetch('https://api.coingecko.com/api/v3/exchanges?per_page=10');
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Failed to read error response');
    console.error('Failed to fetch exchange data', response.status, errorText);
    throw new Error(`Failed to fetch exchange data (status ${response.status})`);
  }
  return response.json();
};

export const useAnalyticsData = () => {
  const { 
    data: marketData, 
    isLoading: isLoadingMarketData, 
    error: marketDataErrorRaw 
  } = useQuery<CoinData[], Error>({
    queryKey: ['advancedMarketData'], // Keep key consistent if data structure is the same
    queryFn: fetchAdvancedMarketData,
    staleTime: 1000 * 60 * 5, // 5 minutes stale time
    refetchInterval: 1000 * 60 * 10, // 10 minutes refetch interval
    onError: (err: Error) => {
      toast.error(`Market Data Error: ${err.message}`);
    }
  });

  const { 
    data: trendingData, 
    isLoading: isLoadingTrendingCoins, 
    error: trendingCoinsErrorRaw 
  } = useQuery<TrendingData, Error>({
    queryKey: ['trendingCoinsAnalytics'], // Use a distinct key
    queryFn: fetchTrendingCoins,
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchInterval: 1000 * 60 * 90, // 1.5 hours
    onError: (err: Error) => {
      toast.error(`Trending Coins Error: ${err.message}`);
    }
  });

  const { 
    data: exchanges, 
    isLoading: isLoadingExchanges, 
    error: exchangesErrorRaw 
  } = useQuery<Exchange[], Error>({
    queryKey: ['exchangesAnalytics'], // Use a distinct key
    queryFn: fetchExchanges,
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchInterval: 1000 * 60 * 90, // 1.5 hours
    onError: (err: Error) => {
      toast.error(`Exchanges Data Error: ${err.message}`);
    }
  });

  const isLoading = isLoadingMarketData || isLoadingTrendingCoins || isLoadingExchanges;
  
  const errors: AnalyticsDataError = {};
  if (marketDataErrorRaw) errors.marketDataError = marketDataErrorRaw;
  if (trendingCoinsErrorRaw) errors.trendingCoinsError = trendingCoinsErrorRaw;
  if (exchangesErrorRaw) errors.exchangesError = exchangesErrorRaw;
  
  // Consolidate overall error for the page, prioritizing market data error
  const overallError = marketDataErrorRaw || trendingCoinsErrorRaw || exchangesErrorRaw;

  return {
    data: {
      marketData,
      trendingCoins: trendingData?.coins,
      exchanges,
    } as AnalyticsPageData,
    isLoading,
    error: overallError, // This provides a general error status
    errors, // This provides specific errors for partial data rendering
  };
};
