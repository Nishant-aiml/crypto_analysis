
import React from 'react';
import TrendingCoins from '@/components/analytics/TrendingCoins';
import MarketDominance from '@/components/analytics/MarketDominance'; // Read-only
import ExchangeAnalysis from '@/components/analytics/ExchangeAnalysis';
import VolumeAnalysis from '@/components/analytics/VolumeAnalysis';
import ErrorBoundary from '@/components/ErrorBoundary';
import { CoinData } from '@/types/crypto';
import { AnalyticsPageData, useAnalyticsData } from '@/hooks/useAnalyticsData'; // For types like TrendingCoinItem, Exchange

// Re-define types from useAnalyticsData if not easily importable or to keep component self-contained with props
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

interface Exchange {
  id: string;
  name: string;
  image: string;
  trust_score: number;
  trade_volume_24h_btc: number;
}

interface AnalyticsDataError { 
  marketDataError?: Error | null;
  trendingCoinsError?: Error | null;
  exchangesError?: Error | null;
}


interface MarketOverviewSectionProps {
  trendingCoins?: TrendingCoinItem[];
  exchanges?: Exchange[];
  marketData?: CoinData[];
  isLoadingGlobal: boolean;
  errors: AnalyticsDataError; // Expecting the specific errors object
  marketDataUnavailable: boolean;
}

const MarketOverviewSection: React.FC<MarketOverviewSectionProps> = ({
  trendingCoins,
  exchanges,
  marketData,
  isLoadingGlobal,
  errors, // Use the specific errors object
  marketDataUnavailable,
}) => {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Market Overview</h2>
      <div className="space-y-8">
        <ErrorBoundary fallbackMessage="Could not load Trending Coins.">
          <TrendingCoins 
            trendingCoins={trendingCoins} 
            isLoading={isLoadingGlobal && !trendingCoins && !errors.trendingCoinsError} // Loading if global is loading AND no data AND no specific error yet
            error={errors.trendingCoinsError} // Pass specific error for trending coins
          />
        </ErrorBoundary>
        <ErrorBoundary fallbackMessage="Could not load Market Dominance. (This component is read-only and fetches its own data)">
          <MarketDominance /> 
        </ErrorBoundary>
        <ErrorBoundary fallbackMessage="Could not load Exchange Analysis.">
          <ExchangeAnalysis 
            exchanges={exchanges} 
            isLoading={isLoadingGlobal && !exchanges && !errors.exchangesError}
            error={errors.exchangesError} // Pass specific error for exchanges
          />
        </ErrorBoundary>
        {/* For VolumeAnalysis, rely on marketDataError from the 'errors' object */}
        {marketDataUnavailable && !isLoadingGlobal ? (
          <div className="glass-card p-6 rounded-lg text-yellow-500 text-center">
            Volume Analysis data is currently unavailable. {errors.marketDataError?.message || "Market data could not be loaded."}
          </div>
        ) : (
          <ErrorBoundary fallbackMessage="Could not load Volume Analysis.">
            <VolumeAnalysis 
              marketData={marketData || []} 
              isLoading={isLoadingGlobal && !marketData && !errors.marketDataError}
              // VolumeAnalysis doesn't have its own error prop, it handles errors based on marketData availability
            />
          </ErrorBoundary>
        )}
      </div>
    </section>
  );
};

export default MarketOverviewSection;

