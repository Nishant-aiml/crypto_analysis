import React, { lazy, Suspense } from 'react';
import Navigation from '@/components/Navigation';
import AnalyticsHeader from '@/components/analytics/AnalyticsHeader';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { calculateCorrelation, calculateVolatility } from '@/utils/analyticsUtils';
import { CoinData } from '@/types/crypto';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load section components
const MarketOverviewSection = lazy(() => import('@/components/analytics/sections/MarketOverviewSection'));
const DeepCoinAnalysisSection = lazy(() => import('@/components/analytics/sections/DeepCoinAnalysisSection'));
const AdvancedMetricsSection = lazy(() => import('@/components/analytics/sections/AdvancedMetricsSection'));
const CommunityToolsSection = lazy(() => import('@/components/analytics/sections/CommunityToolsSection'));

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

const SectionFallback = ({ title }: { title: string }) => (
  <div className="mb-10">
    <Skeleton className="h-8 w-1/3 mb-6" />
    <div className="space-y-8">
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-32 w-full rounded-lg" />
    </div>
    <p className="text-center py-4 text-muted-foreground">Loading {title}...</p>
  </div>
);


const Analytics = () => {
  const queryClient = useQueryClient();
  const { data: analyticsPageData, isLoading, errors } = useAnalyticsData(); // Use specific 'errors' object
  const { marketData, trendingCoins, exchanges } = analyticsPageData || {};

  const handleRefresh = () => {
    toast.info("Refreshing analytics data...", { id: "analytics-refresh" });
    // Invalidate all queries managed by useAnalyticsData
    queryClient.invalidateQueries({ queryKey: ['advancedMarketData'] });
    queryClient.invalidateQueries({ queryKey: ['trendingCoinsAnalytics'] });
    queryClient.invalidateQueries({ queryKey: ['exchangesAnalytics'] });
    // Add any other relevant query keys here if new ones are added to useAnalyticsData
  };
  
  // Check for critical marketData error specifically for the main page structure
  const criticalMarketDataError = errors?.marketDataError && !marketData;

  if (isLoading && !analyticsPageData?.marketData && !analyticsPageData?.trendingCoins && !analyticsPageData?.exchanges) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Navigation />
          <AnalyticsHeader />
          <div className="flex justify-end my-4">
            <Button onClick={handleRefresh} variant="outline" disabled>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </Button>
          </div>
          <div className="text-center py-10">Loading advanced analytics...</div>
        </div>
      </div>
    );
  }
  
  if (criticalMarketDataError) { 
     return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Navigation />
          <AnalyticsHeader />
           <div className="flex justify-end my-4">
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
          </div>
          <div className="text-center py-10 text-red-500">
            Error loading critical market data: {(errors.marketDataError as Error).message}. 
            Some features might be unavailable. Please try refreshing.
            Individual component errors may also appear below or as toasts.
          </div>
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
  
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Navigation />
        <AnalyticsHeader />
        <div className="flex justify-end my-4">
          <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
            {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
        
        {/* Pass the specific errors object to sections */}
        <Suspense fallback={<SectionFallback title="Market Overview" />}>
          <MarketOverviewSection
            trendingCoins={trendingCoins}
            exchanges={exchanges}
            marketData={marketData}
            isLoadingGlobal={isLoading}
            errors={errors} // Pass the whole errors object
            marketDataUnavailable={marketDataUnavailable}
          />
        </Suspense>
        
        <Suspense fallback={<SectionFallback title="Deep Coin Analysis" />}>
          <DeepCoinAnalysisSection
            marketData={marketData}
            isLoadingGlobal={isLoading}
            errors={errors} // Pass the whole errors object
            marketDataUnavailable={marketDataUnavailable}
          />
        </Suspense>
        
        <Suspense fallback={<SectionFallback title="Advanced Metrics & Predictive Insights" />}>
          <AdvancedMetricsSection
            marketData={marketData} // Pass if needed by sub-components, though most props are derived
            correlationData={correlationData}
            volatilityData={volatilityData}
            topGainers={topGainers}
            topLosers={topLosers}
            riskAssessmentData={riskAssessmentData}
            isLoadingGlobal={isLoading}
            errors={errors} // Pass the whole errors object
            marketDataUnavailable={marketDataUnavailable}
          />
        </Suspense>
        
        <Suspense fallback={<SectionFallback title="Community & Tools" />}>
          <CommunityToolsSection />
        </Suspense>

      </div>
    </div>
  );
};

export default Analytics;
