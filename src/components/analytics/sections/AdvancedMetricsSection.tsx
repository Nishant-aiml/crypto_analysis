
import React from 'react';
import TopPerformers from '@/components/analytics/TopPerformers';
import CorrelationVolatility from '@/components/analytics/CorrelationVolatility';
import RiskAssessment from '@/components/analytics/RiskAssessment';
import WhaleWatch, { WhaleActivityCoin } from '@/components/analytics/WhaleWatch';
import ArbitrageOpportunities from '@/components/analytics/ArbitrageOpportunities';
import MarketCycleIndicator from '@/components/analytics/MarketCycleIndicator';
import FutureOutlook from '@/components/analytics/FutureOutlook';
import ErrorBoundary from '@/components/ErrorBoundary';
import { CoinData } from '@/types/crypto';

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
  marketData?: CoinData[]; // For components that might still need raw market data
  correlationData: CorrelationData[];
  volatilityData: VolatilityData[];
  topGainers: CoinData[];
  topLosers: CoinData[];
  riskAssessmentData: RiskAssessmentItem[];
  potentialWhaleActivity?: WhaleActivityCoin[];
  isLoadingGlobal: boolean;
  errors: AnalyticsDataError;
  marketDataUnavailable: boolean;
}

const AdvancedMetricsSection: React.FC<AdvancedMetricsSectionProps> = ({
  correlationData,
  volatilityData,
  topGainers,
  topLosers,
  riskAssessmentData,
  potentialWhaleActivity,
  isLoadingGlobal,
  errors,
  marketDataUnavailable,
}) => {
  if (marketDataUnavailable && !isLoadingGlobal) {
    return (
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Advanced Metrics & Predictive Insights</h2>
        <div className="glass-card p-6 rounded-lg text-yellow-500 text-center">
          Advanced Metrics & Predictive Insights data is currently unavailable. {errors.marketDataError?.message}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Advanced Metrics & Predictive Insights</h2>
      <div className="space-y-8">
        <ErrorBoundary fallbackMessage="Could not load Top Performers.">
          <TopPerformers topGainers={topGainers} topLosers={topLosers} />
        </ErrorBoundary>
        <ErrorBoundary fallbackMessage="Could not load Correlation & Volatility.">
          <CorrelationVolatility correlationData={correlationData} volatilityData={volatilityData} />
        </ErrorBoundary>
        <ErrorBoundary fallbackMessage="Could not load Risk Assessment.">
          <RiskAssessment riskData={riskAssessmentData} />
        </ErrorBoundary>
        <ErrorBoundary fallbackMessage="Could not load Whale Watch.">
          <WhaleWatch 
            potentialWhaleActivity={potentialWhaleActivity || []} 
            isLoading={isLoadingGlobal && !potentialWhaleActivity} // Loading if global load is on AND this specific data isn't there
            error={errors.marketDataError} // WhaleWatch relies on marketData
          />
        </ErrorBoundary>
        <ErrorBoundary fallbackMessage="Could not load Arbitrage Opportunities.">
          {/* ArbitrageOpportunities fetches its own data and is read-only */}
          <ArbitrageOpportunities />
        </ErrorBoundary>
        <ErrorBoundary fallbackMessage="Could not load Market Cycle Indicator.">
          {/* MarketCycleIndicator is conceptual / read-only */}
          <MarketCycleIndicator />
        </ErrorBoundary>
        <ErrorBoundary fallbackMessage="Could not load Future Outlook.">
          {/* FutureOutlook is conceptual / read-only */}
          <FutureOutlook />
        </ErrorBoundary>
      </div>
    </section>
  );
};

export default AdvancedMetricsSection;
