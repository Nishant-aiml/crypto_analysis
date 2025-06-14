import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, Brain, BarChartHorizontal, Users, GitFork, Star, Droplets, Ratio as RatioIcon, Code2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import TrendingCoins from '@/components/analytics/TrendingCoins';
import ExchangeAnalysis from '@/components/analytics/ExchangeAnalysis';
import MarketDominance from '@/components/analytics/MarketDominance';
import VolumeAnalysis from '@/components/analytics/VolumeAnalysis';
import CoinDetailStats from '@/components/analytics/CoinDetailStats';
import CoinLiquidity from '@/components/analytics/CoinLiquidity';
import MarketCapVolumeRatio from '@/components/analytics/MarketCapVolumeRatio';

const fetchAdvancedMarketData = async () => {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=1h%2C24h%2C7d'
  );
  return response.json();
};

const Analytics = () => {
  const { data: marketData, isLoading } = useQuery({
    queryKey: ['advancedMarketData'],
    queryFn: fetchAdvancedMarketData,
    refetchInterval: 60000,
  });

  if (isLoading || !marketData) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <Navigation />
          <div className="text-center py-10">Loading advanced analytics...</div>
        </div>
      </div>
    );
  }

  // Calculate correlation between Bitcoin and other coins
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

  // Calculate volatility (standard deviation of 7-day prices)
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

  // Top gainers and losers
  const sortedByChange = [...marketData].sort((a: any, b: any) => (b.price_change_percentage_24h ?? -Infinity) - (a.price_change_percentage_24h ?? -Infinity));
  const topGainers = sortedByChange.slice(0, 5);
  const topLosers = sortedByChange.slice(-5).reverse();

  const topCoinsForDetails = marketData.slice(0, 2); // e.g., Bitcoin and Ethereum

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Navigation />
        
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Brain className="w-8 h-8 mr-3 text-primary" />
            Advanced Crypto Analytics
          </h1>
          <p className="text-muted-foreground">In-depth market intelligence, coin analysis, and predictive insights.</p>
        </header>

        {/* Phase 1 Features */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Market Overview</h2>
          <div className="space-y-8">
            <TrendingCoins />
            <MarketDominance marketData={marketData} />
            <ExchangeAnalysis />
            <VolumeAnalysis marketData={marketData} />
          </div>
        </section>

        {/* Phase 2: Deep Coin Analysis */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Deep Coin Analysis</h2>
          <div className="space-y-8">
            <MarketCapVolumeRatio marketData={marketData} />
            
            {/* Coin Detail Stats for Top Coins */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {topCoinsForDetails.map(coin => (
                <CoinDetailStats 
                  key={coin.id}
                  coinId={coin.id} 
                  coinName={coin.name}
                  coinSymbol={coin.symbol}
                  coinImage={coin.image}
                />
              ))}
            </div>
            
            {/* Coin Liquidity for Bitcoin */}
            {marketData.find(c => c.id === 'bitcoin') && (
              <CoinLiquidity 
                coinId="bitcoin" 
                coinName="Bitcoin"
                coinSymbol="BTC"
              />
            )}
          </div>
        </section>
        
        {/* Top Gainers and Losers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="glass-card p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              Top Gainers (24h)
            </h2>
            <div className="space-y-3">
              {topGainers.map((coin: any) => (
                <div key={coin.id} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img src={coin.image} alt={coin.name} className="w-8 h-8" />
                    <div>
                      <span className="font-medium">{coin.symbol.toUpperCase()}</span>
                      <div className="text-sm text-muted-foreground">{coin.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: coin.current_price > 1 ? 2 : 6 })}</div>
                    <div className="text-green-400">{(coin.price_change_percentage_24h ?? 0).toFixed(2)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingDown className="w-5 h-5 mr-2 text-red-400" />
              Top Losers (24h)
            </h2>
            <div className="space-y-3">
              {topLosers.map((coin: any) => (
                <div key={coin.id} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img src={coin.image} alt={coin.name} className="w-8 h-8" />
                    <div>
                      <span className="font-medium">{coin.symbol.toUpperCase()}</span>
                      <div className="text-sm text-muted-foreground">{coin.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: coin.current_price > 1 ? 2 : 6 })}</div>
                    <div className="text-red-400">{(coin.price_change_percentage_24h ?? 0).toFixed(2)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Correlation Analysis & Volatility */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="glass-card p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Bitcoin Correlation Analysis</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={correlationData}>
                  <XAxis dataKey="symbol" stroke="#E6E4DD" fontSize={12} />
                  <YAxis stroke="#E6E4DD" fontSize={12} domain={[-1, 1]} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#3A3935',
                      border: '1px solid #605F5B',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#E6E4DD' }}
                  />
                  <Bar dataKey="correlation" fill="#8989DE" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Correlation with Bitcoin (1 = perfect positive, -1 = perfect negative)
            </p>
          </div>

          <div className="glass-card p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Volatility Index (7-day)
            </h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volatilityData}>
                  <XAxis dataKey="name" stroke="#E6E4DD" fontSize={12} />
                  <YAxis stroke="#E6E4DD" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#3A3935',
                      border: '1px solid #605F5B',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#E6E4DD' }}
                    formatter={(value: number) => [`${value.toFixed(2)}%`, 'Volatility']}
                  />
                  <Bar dataKey="volatility" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Higher values indicate more price volatility
            </p>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="glass-card p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
            Risk Assessment Matrix
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {marketData?.slice(0, 9).map((coin: any) => {
              const volatility = calculateVolatility(coin.sparkline_in_7d?.price || []);
              const riskLevel = volatility > 15 ? 'High' : volatility > 8 ? 'Medium' : 'Low';
              const riskColor = riskLevel === 'High' ? 'text-red-400' : riskLevel === 'Medium' ? 'text-yellow-400' : 'text-green-400';
              
              return (
                <div key={coin.id} className="p-4 bg-secondary/20 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <img src={coin.image} alt={coin.name} className="w-6 h-6" />
                    <span className="font-medium">{coin.symbol.toUpperCase()}</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div>Price: ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: coin.current_price > 1 ? 2 : 6 })}</div>
                    <div>24h Change: <span className={(coin.price_change_percentage_24h ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
                    </span></div>
                    <div>Risk Level: <span className={riskColor}>{riskLevel}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
