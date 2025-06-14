import React from 'react';
import MarketCapVolumeRatio from '@/components/analytics/MarketCapVolumeRatio';
// CoinDetailStats and CoinLiquidity removed as per request
import SocialMediaMomentum from '@/components/analytics/SocialMediaMomentum'; // Read-only
import ErrorBoundary from '@/components/ErrorBoundary';
import { CoinData } from '@/types/crypto';

interface AnalyticsDataError {
  marketDataError?: Error | null;
  // No specific errors for CoinDetailStats/CoinLiquidity as they handle their own, but marketDataError affects this section
}

interface DeepCoinAnalysisSectionProps {
  marketData?: CoinData[];
  isLoadingGlobal: boolean;
  errors: AnalyticsDataError; // Expecting the specific errors object
  marketDataUnavailable: boolean;
}

const DeepCoinAnalysisSection: React.FC<DeepCoinAnalysisSectionProps> = ({
  marketData,
  isLoadingGlobal,
  errors, // Use the specific errors object
  marketDataUnavailable,
}) => {
  // If marketData (source for topCoinsForDetails) failed, this section is heavily impacted.
  if (marketDataUnavailable && !isLoadingGlobal) {
    return (
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Deep Coin Analysis</h2>
        <div className="glass-card p-6 rounded-lg text-yellow-500 text-center">
          Deep Coin Analysis data is currently unavailable. {errors.marketDataError?.message || "Market data could not be loaded."}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Deep Coin Analysis</h2>
      <div className="space-y-8">
        <ErrorBoundary fallbackMessage="Could not load Market Cap/Volume Ratio.">
          {/* MarketCapVolumeRatio depends on marketData. If marketDataError, it will show limited info or an error. */}
          <MarketCapVolumeRatio marketData={marketData || []} />
        </ErrorBoundary>
        
        {/* CoinDetailStats for top coins has been removed as per request. */}
        
        {/* CoinLiquidity for Bitcoin has been removed as per request. */}

        <ErrorBoundary fallbackMessage="Could not load Social Media Momentum. (This component is read-only)">
          <SocialMediaMomentum />
        </ErrorBoundary>
      </div>
    </section>
  );
};

export default DeepCoinAnalysisSection;
