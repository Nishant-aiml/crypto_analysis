import { useQuery, QueryKey } from '@tanstack/react-query'; // Added QueryKey
import { CoinData } from '@/types/crypto';
import { toast } from 'sonner';
import { fetchAdvancedMarketData, fetchTrendingCoins, fetchExchanges } from '@/services/coingeckoService';

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
    const errorText = await response.text().catch(() => `Failed to read error response body (status ${response.status})`);
    console.error('Failed to fetch advanced market data', response.status, errorText);
    throw new Error(`Failed to fetch advanced market data. Status: ${response.status}. Message: ${errorText}`);
  }
  return response.json();
};

const fetchTrendingCoins = async (): Promise<TrendingData> => {
  const response = await fetch('https://api.coingecko.com/api/v3/search/trending');
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Failed to read error response body (status ${response.status})`);
    console.error('Failed to fetch trending data', response.status, errorText);
    throw new Error(`Failed to fetch trending data. Status: ${response.status}. Message: ${errorText}`);
  }
  return response.json();
};

const fetchExchanges = async (): Promise<Exchange[]> => {
  const response = await fetch('https://api.coingecko.com/api/v3/exchanges?per_page=10');
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Failed to read error response body (status ${response.status})`);
    console.error('Failed to fetch exchange data', response.status, errorText);
    throw new Error(`Failed to fetch exchange data. Status: ${response.status}. Message: ${errorText}`);
  }
  return response.json();
};

export const useAnalyticsData = () => {
  const retryConfig = {
    retry: (failureCount: number, err: Error) => {
      if (err.message.includes("429")) {
        if (failureCount === 0) toast.warning(`API rate limit hit. Retrying...`);
        return failureCount < 3;
      }
      if (err.message.includes("404")) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex: number, err: Error) => {
      if (err.message.includes("429")) {
        return Math.min(1000 * 2 ** attemptIndex, 30000) + Math.random() * 200;
      }
      return 1000 * (attemptIndex + 1);
    },
  };

  const { 
    data: marketData, 
    isLoading: isLoadingMarketData, 
    error: marketDataErrorRaw 
  } = useQuery<CoinData[], Error, CoinData[], QueryKey>({ // Explicitly type QueryKey
    queryKey: ['advancedMarketData'],
    queryFn: fetchAdvancedMarketData,
    staleTime: 1000 * 60 * 5, // 5 minutes stale time
    refetchInterval: 1000 * 60 * 10, // 10 minutes refetch interval
    ...retryConfig,
    meta: {
      onError: (err: Error) => {
        toast.error(`Market Data Error: ${err.message}`);
      }
    }
  });

  const { 
    data: trendingData, 
    isLoading: isLoadingTrendingCoins, 
    error: trendingCoinsErrorRaw 
  } = useQuery<TrendingData, Error, TrendingData, QueryKey>({ // Explicitly type QueryKey
    queryKey: ['trendingCoinsAnalytics'],
    queryFn: fetchTrendingCoins,
    staleTime: 1000 * 60 * 30, // 30 minutes stale time
    refetchInterval: 1000 * 60 * 45, // 45 minutes refetch interval
    ...retryConfig,
    meta: {
      onError: (err: Error) => {
        toast.error(`Trending Coins Error: ${err.message}`);
      }
    }
  });

  const { 
    data: exchanges, 
    isLoading: isLoadingExchanges, 
    error: exchangesErrorRaw 
  } = useQuery<Exchange[], Error, Exchange[], QueryKey>({ // Explicitly type QueryKey
    queryKey: ['exchangesAnalytics'],
    queryFn: fetchExchanges,
    staleTime: 1000 * 60 * 60, // 1 hour stale time
    refetchInterval: 1000 * 60 * 90, // 1.5 hours refetch interval
    ...retryConfig,
    meta: {
      onError: (err: Error) => {
        toast.error(`Exchanges Data Error: ${err.message}`);
      }
    }
  });

  const isLoading = isLoadingMarketData || isLoadingTrendingCoins || isLoadingExchanges;
  
  const errors: AnalyticsDataError = {};
  if (marketDataErrorRaw) errors.marketDataError = marketDataErrorRaw;
  if (trendingCoinsErrorRaw) errors.trendingCoinsError = trendingCoinsErrorRaw;
  if (exchangesErrorRaw) errors.exchangesError = exchangesErrorRaw;
  
  const overallError = marketDataErrorRaw || trendingCoinsErrorRaw || exchangesErrorRaw;

  return {
    data: {
      marketData,
      trendingCoins: trendingData?.coins,
      exchanges,
    } as AnalyticsPageData,
    isLoading,
    error: overallError, // This top-level error can be used for a general page error
    errors, // This object with specific errors should be used by components
  };
};
