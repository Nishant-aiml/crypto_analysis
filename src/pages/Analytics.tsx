import { useQuery } from '@tanstack/react-query';
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
import MarketMoodRing from '@/components/analytics/MarketMoodRing';
import WhaleWatch from '@/components/analytics/WhaleWatch';
import ArbitrageOpportunities from '@/components/analytics/ArbitrageOpportunities';
import MarketCycleIndicator from '@/components/analytics/MarketCycleIndicator';
import SeasonalPatterns from '@/components/analytics/SeasonalPatterns';
import SocialMediaMomentum from '@/components/analytics/SocialMediaMomentum';

const fetchAdvancedMarketData = async () => {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=1h%2C24h%2C7d'
  );
  if (!response.ok) {
    throw new Error('Failed to fetch advanced market data');
  }
  return response.json();
};

const Analytics = () => {
  const { data: marketData, isLoading, error } = useQuery({
    queryKey: ['advancedMarketData'],
    queryFn: fetchAdvancedMarketData,
    refetchInterval: 60000,
  });

  if (isLoading || !marketData) {
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
  if (error) {
     return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Navigation />
          <AnalyticsHeader />
          <div className="text-center py-10 text-red-500">Error loading analytics data. Please try again later.</div>
        </div>
      </div>
    );
  }

  const calculateCorrelation = (coin1Prices: number[], coin2Prices: number[]) => {
    if (!coin1Prices || !coin2Prices || coin1Prices.length !== coin2Prices.length || coin1Prices.length === 0) return 0;
    
    const n = coin1Prices.length;
    const sum1 = coin1Prices.reduce((a, b) => a + b, 0);
    const sum2 = coin2Prices.reduce((a, b) => a + b, 0);
    const sum1Sq = coin1Prices.reduce((a, b) => a + b * b, 0);
    const sum2Sq = coin2Prices.reduce((a, b) => a + b * b, 0);
    const pSum = coin1Prices.reduce((a, b, i) => a + b * coin2Prices[i], 0);
    
    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));
    
    return den === 0 ? 0 : num / den;
  };

  const bitcoinPrices = marketData?.find((coin: any) => coin.id === 'bitcoin')?.sparkline_in_7d?.price || [];
  
  const correlationData = marketData?.slice(1, 6).map((coin: any) => ({
    name: coin.name,
    symbol: coin.symbol.toUpperCase(),
    correlation: calculateCorrelation(bitcoinPrices, coin.sparkline_in_7d?.price || []),
  })) || [];

  const calculateVolatility = (prices: number[]) => {
    if (!prices || prices.length === 0) return 0;
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
    return Math.sqrt(variance) / mean * 100; // Coefficient of variation as percentage
  };

  const volatilityData = marketData?.slice(0, 10).map((coin: any) => ({
    name: coin.symbol.toUpperCase(),
    volatility: calculateVolatility(coin.sparkline_in_7d?.price || []),
    price: coin.current_price,
  })) || [];

  const sortedByChange = [...marketData].sort((a: any, b: any) => (b.price_change_percentage_24h ?? -Infinity) - (a.price_change_percentage_24h ?? -Infinity));
  const topGainers = sortedByChange.slice(0, 5);
  const topLosers = sortedByChange.slice(-5).reverse();

  const topCoinsForDetails = marketData.slice(0, 2);

  const riskAssessmentData = marketData?.slice(0, 9).map((coin: any) => {
    const volatility = calculateVolatility(coin.sparkline_in_7d?.price || []);
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
  }) || [];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Navigation />
        <AnalyticsHeader />
        
        {/* Phase 1 Features */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Market Overview</h2>
          <div className="space-y-8">
            <TrendingCoins />
            <MarketDominance />
            <ExchangeAnalysis />
            <VolumeAnalysis />
          </div>
        </section>

        {/* Phase 2: Deep Coin Analysis */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Deep Coin Analysis</h2>
          <div className="space-y-8">
            <MarketCapVolumeRatio marketData={marketData} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {topCoinsForDetails.map((coin: any) => (
                <CoinDetailStats 
                  key={coin.id}
                  coinId={coin.id} 
                  coinName={coin.name}
                  coinSymbol={coin.symbol}
                  coinImage={coin.image}
                />
              ))}
            </div>
            
            {marketData.find((c: any) => c.id === 'bitcoin') && (
              <CoinLiquidity 
                coinId="bitcoin" 
                coinName="Bitcoin"
                coinSymbol="BTC"
              />
            )}
            <SocialMediaMomentum />
          </div>
        </section>
        
        {/* Phase 3: Advanced Metrics & Predictive Insights */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Advanced Metrics & Predictive Insights</h2>
          <div className="space-y-8">
            <TopPerformers topGainers={topGainers} topLosers={topLosers} />
            <CorrelationVolatility correlationData={correlationData} volatilityData={volatilityData} />
            <RiskAssessment riskData={riskAssessmentData} />
            <WhaleWatch />
            <ArbitrageOpportunities />
            <MarketCycleIndicator />
            <SeasonalPatterns />
            <FutureOutlook /> {/* Moved here as it's also a predictive outlook */}
          </div>
        </section>

        {/* Phase 4: Portfolio Intelligence - SKIPPED as per plan */}
        {/* Original Phase 4 was: Predictive Insights & Future Outlook, content moved to Phase 3 */}

        {/* Phase 5: Community & Gamification */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Community & Tools</h2> {/* Renamed for clarity */}
          <div className="space-y-8">
            <CoinComparisonTool />
            <MarketMoodRing />
          </div>
        </section>

      </div>
    </div>
  );
};

export default Analytics;
