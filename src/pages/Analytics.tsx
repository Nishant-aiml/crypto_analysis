
import React from 'react';
import Navigation from '@/components/Navigation';
import AnalyticsHeader from '@/components/analytics/AnalyticsHeader';
// Import new section components
import MarketOverviewSection from '@/components/analytics/sections/MarketOverviewSection';
import DeepCoinAnalysisSection from '@/components/analytics/sections/DeepCoinAnalysisSection';
import AdvancedMetricsSection from '@/components/analytics/sections/AdvancedMetricsSection';
import CommunityToolsSection from '@/components/analytics/sections/CommunityToolsSection';

import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { calculateCorrelation, calculateVolatility } from '@/utils/analyticsUtils';
import { CoinData } from '@/types/crypto';
// Types for derived data to be passed as props
import { WhaleActivityCoin } from '@/components/analytics/WhaleWatch'; // Import if needed for type hint

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
  
  if (error && !marketData) { // If critical marketData fails, show prominent error
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
  
  const marketDataUnavailable = !!(errors?.marketDataError && !marketData);

  // Data transformations (can be memoized with useMemo if performance becomes an issue)
  const bitcoinPrices = marketData?.find((coin: CoinData) => coin.id === 'bitcoin')?.sparkline_in_7d?.price;
  
  const correlationData: CorrelationData[] = marketData && bitcoinPrices ? marketData.slice(1, 6).map((coin: CoinData) => ({
    name: coin.name,
    symbol: coin.symbol.toUpperCase(),
    correlation: calculateCorrelation(bitcoinPrices, coin.sparkline_in_7d?.price),
  })) : [];

  const volatilityData: VolatilityData[] = marketData ? marketData.slice(0, 10).map((coin: CoinData) => ({
    name: coin.symbol.toUpperCase(),
    volatility: calculateVolatility(coin.sparkline_in_7d?.price),
    price: coin.current_price,
  })) : [];
  
  const sortedByChange = marketData ? [...marketData].sort((a: CoinData, b: CoinData) => (b.price_change_percentage_24h ?? -Infinity) - (a.price_change_percentage_24h ?? -Infinity)) : [];
  const topGainers: CoinData[] = sortedByChange.slice(0, 5);
  const topLosers: CoinData[] = sortedByChange.slice(-5).reverse();

  const topCoinsForDetails: CoinData[] = marketData ? marketData.slice(0, 2) : [];

  const riskAssessmentData: RiskAssessmentItem[] = marketData ? marketData.slice(0, 9).map((coin: CoinData) => {
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
  
  const potentialWhaleActivity: WhaleActivityCoin[] | undefined = marketData
    ?.filter(coin => coin.market_cap > 0 ? (coin.total_volume / coin.market_cap) * 100 > 20 && coin.total_volume > 1000000 : false)
    .map(coin => ({...coin, volume_to_market_cap_ratio: coin.market_cap > 0 ? (coin.total_volume / coin.market_cap) * 100 : 0})) // Add ratio for type consistency
    .sort((a, b) => (b.volume_to_market_cap_ratio) - (a.volume_to_market_cap_ratio))
    .slice(0, 10);


  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Navigation />
        <AnalyticsHeader />
        
        <MarketOverviewSection
          trendingCoins={trendingCoins}
          exchanges={exchanges}
          marketData={marketData}
          isLoadingGlobal={isLoading}
          errors={errors}
          marketDataUnavailable={marketDataUnavailable}
        />
        
        <DeepCoinAnalysisSection
          marketData={marketData}
          topCoinsForDetails={topCoinsForDetails}
          isLoadingGlobal={isLoading}
          errors={errors}
          marketDataUnavailable={marketDataUnavailable}
        />
        
        <AdvancedMetricsSection
          marketData={marketData}
          correlationData={correlationData}
          volatilityData={volatilityData}
          topGainers={topGainers}
          topLosers={topLosers}
          riskAssessmentData={riskAssessmentData}
          potentialWhaleActivity={potentialWhaleActivity}
          isLoadingGlobal={isLoading}
          errors={errors}
          marketDataUnavailable={marketDataUnavailable}
        />
        
        <CommunityToolsSection />

      </div>
    </div>
  );
};

export default Analytics;
