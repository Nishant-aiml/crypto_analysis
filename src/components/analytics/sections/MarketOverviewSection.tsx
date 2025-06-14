import React from 'react';
import TrendingCoins from '@/components/analytics/TrendingCoins';
import MarketDominance from '@/components/analytics/MarketDominance';
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
  // Add other fields if used by ExchangeAnalysis from the original type in useAnalyticsData
}

interface AnalyticsDataError { // Simplified from useAnalyticsData hook's error structure
  marketDataError?: Error | null;
  trendingCoinsError?: Error | null;
  exchangesError?: Error | null;
}

interface MarketOverviewSectionProps {
  trendingCoins?: TrendingCoinItem[];
  exchanges?: Exchange[];
  marketData?: CoinData[];
  isLoadingGlobal: boolean; // Overall loading state for the analytics page
  errors: AnalyticsDataError;
  marketDataUnavailable: boolean;
}

const MarketOverviewSection: React.FC<MarketOverviewSectionProps> = ({
  trendingCoins,
  exchanges,
  marketData,
  isLoadingGlobal,
  errors,
  marketDataUnavailable,
}) => {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Market Overview</h2>
      <div className="space-y-8">
        <ErrorBoundary fallbackMessage="Could not load Trending Coins.">
          <TrendingCoins 
            trendingCoins={trendingCoins} 
            isLoading={isLoadingGlobal && !trendingCoins} // Pass loading state specific to this component's data
            error={errors.trendingCoinsError} 
          />
        </ErrorBoundary>
        <ErrorBoundary fallbackMessage="Could not load Market Dominance.">
          {/* MarketDominance fetches its own data and is read-only */}
          <MarketDominance /> 
        </ErrorBoundary>
        <ErrorBoundary fallbackMessage="Could not load Exchange Analysis.">
          <ExchangeAnalysis 
            exchanges={exchanges} 
            isLoading={isLoadingGlobal && !exchanges} 
            error={errors.exchangesError} 
          />
        </ErrorBoundary>
        {marketDataUnavailable && !isLoadingGlobal ? (
          <div className="glass-card p-6 rounded-lg text-yellow-500 text-center">
            Volume Analysis data is currently unavailable. {errors.marketDataError?.message}
          </div>
        ) : (
          <ErrorBoundary fallbackMessage="Could not load Volume Analysis.">
            <VolumeAnalysis 
              marketData={marketData || []} 
              isLoading={isLoadingGlobal && !marketData} // Pass loading specific to marketData
            />
          </ErrorBoundary>
        )}
      </div>
    </section>
  );
};

export default MarketOverviewSection;
