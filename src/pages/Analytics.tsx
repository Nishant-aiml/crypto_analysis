
import React from 'react';
import Navigation from '@/components/Navigation';
import TrendingCoins from '@/components/analytics/TrendingCoins';
import ExchangeAnalysis from '@/components/analytics/ExchangeAnalysis';
import MarketDominance from '@/components/analytics/MarketDominance';
import VolumeAnalysis from '@/components/analytics/VolumeAnalysis';
import CoinDetailStats from '@/components/analytics/CoinDetailStats';
import CoinLiquidity from '@/components/analytics/CoinLiquidity';
import MarketCapVolumeRatio from '@/components/analytics/MarketCapVolumeRatio';
import AnalyticsHeader from '@/components/analytics/AnalyticsHeader';
import TopPerformers from '@/components/analytics/TopPerformers';
import CorrelationVolatility from '@/components/analytics/CorrelationVolatility';
import RiskAssessment from '@/components/analytics/RiskAssessment';
import FutureOutlook from '@/components/analytics/FutureOutlook';
import CoinComparisonTool from '@/components/analytics/CoinComparisonTool';
import WhaleWatch from '@/components/analytics/WhaleWatch';
import ArbitrageOpportunities from '@/components/analytics/ArbitrageOpportunities';
import MarketCycleIndicator from '@/components/analytics/MarketCycleIndicator';
import SocialMediaMomentum from '@/components/analytics/SocialMediaMomentum';
import ErrorBoundary from '@/components/ErrorBoundary';

import { useAnalyticsData } from '@/hooks/useAnalyticsData'; // Import the new hook
import { calculateCorrelation, calculateVolatility } from '@/utils/analyticsUtils';
import { CoinData } from '@/types/crypto';


const Analytics = () => {
  const { data: analyticsPageData, isLoading, error, errors } = useAnalyticsData();
  const { marketData, trendingCoins, exchanges } = analyticsPageData || {};

  if (isLoading && !analyticsPageData?.marketData && !analyticsPageData?.trendingCoins && !analyticsPageData?.exchanges) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Navigation />
          <AnalyticsHeader />
          <div className="text-center py-10">Loading advanced analytics...</div>
        </div>
      </div>
    );
  }
  
  // Overall error for the whole page if marketData is crucial and missing
  if (error && !marketData) {
     return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Navigation />
          <AnalyticsHeader />
          <div className="text-center py-10 text-red-500">Error loading critical analytics data: {(error as Error).message}. Please try again later.</div>
        </div>
      </div>
    );
  }
  
  // Handle case where marketData specifically failed but other data might be available
  // This is a more granular error handling approach
  const marketDataUnavailable = !marketData && errors?.marketDataError;

  // Data transformations (can be memoized with useMemo if needed)
  // Ensure marketData is available before trying to use it
  const bitcoinPrices = marketData?.find((coin: CoinData) => coin.id === 'bitcoin')?.sparkline_in_7d?.price;
  
  const correlationData = marketData ? marketData.slice(1, 6).map((coin: CoinData) => ({
    name: coin.name,
    symbol: coin.symbol.toUpperCase(),
    correlation: calculateCorrelation(bitcoinPrices, coin.sparkline_in_7d?.price),
  })) : [];

  const volatilityData = marketData ? marketData.slice(0, 10).map((coin: CoinData) => ({
    name: coin.symbol.toUpperCase(),
    volatility: calculateVolatility(coin.sparkline_in_7d?.price),
    price: coin.current_price,
  })) : [];
  
  const sortedByChange = marketData ? [...marketData].sort((a: CoinData, b: CoinData) => (b.price_change_percentage_24h ?? -Infinity) - (a.price_change_percentage_24h ?? -Infinity)) : [];
  const topGainers = sortedByChange.slice(0, 5);
  const topLosers = sortedByChange.slice(-5).reverse();

  const topCoinsForDetails = marketData ? marketData.slice(0, 2) : [];

  const riskAssessmentData = marketData ? marketData.slice(0, 9).map((coin: CoinData) => {
    const volatility = calculateVolatility(coin.sparkline_in_7d?.price);
    const riskLevel = volatility > 15 ? 'High' : volatility > 8 ? 'Medium' : 'Low';
    const riskColor = riskLevel === 'High' ? 'text-red-400' : riskLevel === 'Medium' ? 'text-yellow-400' : 'text-green-400';
    
    return {
      id: coin.id,
      image: coin.image,
      symbol: coin.symbol.toUpperCase(),
      current_price: coin.current_price,
      price_change_percentage_24h: coin.price_change_percentage_24h ?? 0,
      riskLevel,
      riskColor,
    };
  }) : [];
  
  const potentialWhaleActivity = marketData
    ?.filter(coin => coin.market_cap > 0 ? (coin.total_volume / coin.market_cap) * 100 > 20 && coin.total_volume > 1000000 : false)
    .sort((a, b) => (b.total_volume / b.market_cap) - (a.total_volume / a.market_cap))
    .slice(0, 10);


  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Navigation />
        <AnalyticsHeader />
        
        {/* Phase 1 Features */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Market Overview</h2>
          <div className="space-y-8">
            <ErrorBoundary fallbackMessage="Could not load Trending Coins.">
              <TrendingCoins trendingCoins={trendingCoins} isLoading={isLoading && !trendingCoins} error={errors?.trendingCoinsError} />
            </ErrorBoundary>
            <ErrorBoundary fallbackMessage="Could not load Market Dominance.">
              <MarketDominance /> {/* This component is read-only and fetches its own data */}
            </ErrorBoundary>
            <ErrorBoundary fallbackMessage="Could not load Exchange Analysis.">
              <ExchangeAnalysis exchanges={exchanges} isLoading={isLoading && !exchanges} error={errors?.exchangesError} />
            </ErrorBoundary>
             {marketDataUnavailable && !isLoading ? (
                <div className="glass-card p-6 rounded-lg text-yellow-500 text-center">Volume Analysis data is currently unavailable. {errors?.marketDataError?.message}</div>
              ) : (
                <ErrorBoundary fallbackMessage="Could not load Volume Analysis.">
                  <VolumeAnalysis marketData={marketData || []} isLoading={isLoading && !marketData} />
                </ErrorBoundary>
              )}
          </div>
        </section>

        {/* Phase 2: Deep Coin Analysis */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Deep Coin Analysis</h2>
            {marketDataUnavailable && !isLoading ? (
              <div className="glass-card p-6 rounded-lg text-yellow-500 text-center mb-8">Deep Coin Analysis data is currently unavailable. {errors?.marketDataError?.message}</div>
            ) : (
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
                 {topCoinsForDetails.length === 0 && !isLoading && marketData && <p className="text-muted-foreground lg:col-span-2 text-center">No coin details to display.</p>}
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
                <SocialMediaMomentum />
              </ErrorBoundary>
            </div>
            )}
        </section>
        
        {/* Phase 3: Advanced Metrics & Predictive Insights */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Advanced Metrics & Predictive Insights</h2>
          {marketDataUnavailable && !isLoading ? (
              <div className="glass-card p-6 rounded-lg text-yellow-500 text-center mb-8">Advanced Metrics & Predictive Insights data is currently unavailable. {errors?.marketDataError?.message}</div>
            ) : (
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
                <WhaleWatch potentialWhaleActivity={potentialWhaleActivity || []} isLoading={isLoading && !potentialWhaleActivity} error={errors?.marketDataError} />
              </ErrorBoundary>
              <ErrorBoundary fallbackMessage="Could not load Arbitrage Opportunities.">
                <ArbitrageOpportunities />
              </ErrorBoundary>
              <ErrorBoundary fallbackMessage="Could not load Market Cycle Indicator.">
                <MarketCycleIndicator />
              </ErrorBoundary>
              <ErrorBoundary fallbackMessage="Could not load Future Outlook.">
                <FutureOutlook />
              </ErrorBoundary>
            </div>
          )}
        </section>

        {/* Phase 5: Community & Gamification */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Community & Tools</h2>
          <div className="space-y-8">
            <ErrorBoundary fallbackMessage="Could not load Coin Comparison Tool.">
              <CoinComparisonTool />
            </ErrorBoundary>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Analytics;

