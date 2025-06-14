
import React from 'react';
import MarketCapVolumeRatio from '@/components/analytics/MarketCapVolumeRatio';
import CoinDetailStats from '@/components/analytics/CoinDetailStats';
import CoinLiquidity from '@/components/analytics/CoinLiquidity';
import SocialMediaMomentum from '@/components/analytics/SocialMediaMomentum'; // Read-only
import ErrorBoundary from '@/components/ErrorBoundary';
import { CoinData } from '@/types/crypto';

interface AnalyticsDataError {
  marketDataError?: Error | null;
  // No specific errors for CoinDetailStats/CoinLiquidity as they handle their own, but marketDataError affects this section
}

interface DeepCoinAnalysisSectionProps {
  marketData?: CoinData[];
  topCoinsForDetails: CoinData[];
  isLoadingGlobal: boolean;
  errors: AnalyticsDataError; // Expecting the specific errors object
  marketDataUnavailable: boolean;
}

const DeepCoinAnalysisSection: React.FC<DeepCoinAnalysisSectionProps> = ({
  marketData,
  topCoinsForDetails,
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* If topCoinsForDetails is empty due to marketData error, this loop won't run.
              Individual CoinDetailStats components handle their own fetch errors (now with toasts). */}
          {topCoinsForDetails.map((coin: CoinData) => (
            <ErrorBoundary key={coin.id} fallbackMessage={`Could not load details for ${coin.name}. Check toast notifications.`}>
              <CoinDetailStats 
                coinId={coin.id} 
                coinName={coin.name}
                coinSymbol={coin.symbol}
                coinImage={coin.image}
              />
            </ErrorBoundary>
          ))}
          {topCoinsForDetails.length === 0 && !isLoadingGlobal && marketData && (
            <p className="text-muted-foreground lg:col-span-2 text-center">No coin details to display (market data might be limited or empty).</p>
          )}
           {topCoinsForDetails.length === 0 && errors.marketDataError && (
            <p className="text-red-400 lg:col-span-2 text-center">Could not load coin details due to market data error: {errors.marketDataError.message}</p>
          )}
        </div>
        
        {/* CoinLiquidity for Bitcoin. It handles its own fetch errors (now with toasts). */}
        {marketData?.find((c: CoinData) => c.id === 'bitcoin') ? ( // Only render if Bitcoin is in marketData
          <ErrorBoundary fallbackMessage="Could not load Bitcoin Liquidity. Check toast notifications.">
            <CoinLiquidity 
              coinId="bitcoin" 
              coinName="Bitcoin"
              coinSymbol="BTC"
            />
          </ErrorBoundary>
        ) : (
          errors.marketDataError && <div className="text-sm text-muted-foreground">Bitcoin liquidity check skipped due to market data error.</div>
        )}

        <ErrorBoundary fallbackMessage="Could not load Social Media Momentum. (This component is read-only)">
          <SocialMediaMomentum />
        </ErrorBoundary>
      </div>
    </section>
  );
};

export default DeepCoinAnalysisSection;

