import React from 'react';
import TopPerformers from '@/components/analytics/TopPerformers';
import CorrelationVolatility from '@/components/analytics/CorrelationVolatility';
import RiskAssessment from '@/components/analytics/RiskAssessment';
import MarketCycleIndicator from '@/components/analytics/MarketCycleIndicator'; // Read-only
import FutureOutlook from '@/components/analytics/FutureOutlook'; // Read-only
import ErrorBoundary from '@/components/ErrorBoundary';
import { CoinData } from '@/types/crypto';
import ArbitrageOpportunities from '@/components/analytics/ArbitrageOpportunities';

// Types for props, derived from Analytics.tsx calculations
interface CorrelationData { name: string; symbol: string; correlation: number; }
interface VolatilityData { name: string; volatility: number; price: number; }
interface RiskAssessmentItem {
  id: string;
  image: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  riskLevel: string;
  riskColor: string;
}
interface AnalyticsDataError { marketDataError?: Error | null; }


interface AdvancedMetricsSectionProps {
  marketData?: CoinData[];
  correlationData: CorrelationData[];
  volatilityData: VolatilityData[];
  topGainers: CoinData[];
  topLosers: CoinData[];
  riskAssessmentData: RiskAssessmentItem[];
  isLoadingGlobal: boolean;
  errors: AnalyticsDataError; // Expecting the specific errors object
  marketDataUnavailable: boolean;
}

const AdvancedMetricsSection: React.FC<AdvancedMetricsSectionProps> = ({
  // marketData, // marketData is used to derive other props, direct use might be minimal
  correlationData,
  volatilityData,
  topGainers,
  topLosers,
  riskAssessmentData,
  isLoadingGlobal,
  errors, // Use the specific errors object
  marketDataUnavailable,
}) => {
  // This section heavily relies on derivations from marketData.
  // If marketData failed, most components here will show empty/error states.
  if (marketDataUnavailable && !isLoadingGlobal) {
    return (
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Advanced Metrics & Predictive Insights</h2>
        <div className="glass-card p-6 rounded-lg text-yellow-500 text-center">
          Advanced Metrics & Predictive Insights data is currently unavailable. {errors.marketDataError?.message || "Market data could not be loaded."}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Advanced Metrics & Predictive Insights</h2>
      <div className="space-y-8">
        <ErrorBoundary fallbackMessage="Could not load Top Performers.">
          {/* TopPerformers relies on topGainers/topLosers derived from marketData.
              If marketDataError, these arrays will be empty. */}
          <TopPerformers topGainers={topGainers} topLosers={topLosers} />
        </ErrorBoundary>
        <ErrorBoundary fallbackMessage="Could not load Correlation & Volatility.">
          {/* Similar to TopPerformers, relies on derived data. */}
          <CorrelationVolatility correlationData={correlationData} volatilityData={volatilityData} />
        </ErrorBoundary>
        <ErrorBoundary fallbackMessage="Could not load Risk Assessment.">
          <RiskAssessment riskData={riskAssessmentData} />
        </ErrorBoundary>
        <ErrorBoundary fallbackMessage="Could not load Arbitrage Opportunities.">
          <ArbitrageOpportunities />
        </ErrorBoundary>
        <ErrorBoundary fallbackMessage="Could not load Market Cycle Indicator. (This component is read-only)">
          <MarketCycleIndicator />
        </ErrorBoundary>
        <ErrorBoundary fallbackMessage="Could not load Future Outlook. (This component is read-only)">
          <FutureOutlook />
        </ErrorBoundary>
      </div>
    </section>
  );
};

export default AdvancedMetricsSection;
