
import React from 'react';
import MarketCapVolumeRatio from '@/components/analytics/MarketCapVolumeRatio';
import CoinDetailStats from '@/components/analytics/CoinDetailStats';
import CoinLiquidity from '@/components/analytics/CoinLiquidity';
import SocialMediaMomentum from '@/components/analytics/SocialMediaMomentum';
import ErrorBoundary from '@/components/ErrorBoundary';
import { CoinData } from '@/types/crypto';

interface AnalyticsDataError {
  marketDataError?: Error | null;
  // Add other specific errors if needed by components in this section
}

interface DeepCoinAnalysisSectionProps {
  marketData?: CoinData[];
  topCoinsForDetails: CoinData[]; // Derived in Analytics.tsx
  isLoadingGlobal: boolean;
  errors: AnalyticsDataError;
  marketDataUnavailable: boolean;
}

const DeepCoinAnalysisSection: React.FC<DeepCoinAnalysisSectionProps> = ({
  marketData,
  topCoinsForDetails,
  isLoadingGlobal,
  errors,
  marketDataUnavailable,
}) => {
  if (marketDataUnavailable && !isLoadingGlobal) {
    return (
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Deep Coin Analysis</h2>
        <div className="glass-card p-6 rounded-lg text-yellow-500 text-center">
          Deep Coin Analysis data is currently unavailable. {errors.marketDataError?.message}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Deep Coin Analysis</h2>
      <div className="space-y-8">
        <ErrorBoundary fallbackMessage="Could not load Market Cap/Volume Ratio.">
          <MarketCapVolumeRatio marketData={marketData || []} />
        </ErrorBoundary>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {topCoinsForDetails.map((coin: CoinData) => (
            <ErrorBoundary key={coin.id} fallbackMessage={`Could not load details for ${coin.name}.`}>
              <CoinDetailStats 
                coinId={coin.id} 
                coinName={coin.name}
                coinSymbol={coin.symbol}
                coinImage={coin.image}
              />
            </ErrorBoundary>
          ))}
          {topCoinsForDetails.length === 0 && !isLoadingGlobal && marketData && (
            <p className="text-muted-foreground lg:col-span-2 text-center">No coin details to display.</p>
          )}
        </div>
        
        {marketData?.find((c: CoinData) => c.id === 'bitcoin') && (
          <ErrorBoundary fallbackMessage="Could not load Bitcoin Liquidity.">
            <CoinLiquidity 
              coinId="bitcoin" 
              coinName="Bitcoin"
              coinSymbol="BTC"
            />
          </ErrorBoundary>
        )}
        <ErrorBoundary fallbackMessage="Could not load Social Media Momentum.">
          {/* SocialMediaMomentum is read-only, fetches its own data */}
          <SocialMediaMomentum />
        </ErrorBoundary>
      </div>
    </section>
  );
};

export default DeepCoinAnalysisSection;
