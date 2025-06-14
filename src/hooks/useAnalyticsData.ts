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

export interface TrendingData { // Exporting for use in other files if needed, and for clarity
  coins: TrendingCoinItem[];
  exchanges: any[]; // Add a more specific type if known
}

export interface Exchange { // Exporting for use in other files if needed
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

// The local fetch functions were removed as they are now imported from coingeckoService.

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
  } = useQuery<CoinData[], Error>({ // Simplified types, QueryKey is inferred
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
  } = useQuery<TrendingData, Error>({ // Simplified types
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
  } = useQuery<Exchange[], Error>({ // Simplified types
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
