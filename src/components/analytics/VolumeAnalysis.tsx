
import { useQuery } from '@tanstack/react-query';
import { Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from 'recharts';

const fetchMarketData = async () => {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d'
  );
  if (!response.ok) throw new Error('Failed to fetch market data');
  return response.json();
};

const VolumeAnalysis = () => {
  const { data: marketData, isLoading } = useQuery({
    queryKey: ['volumeAnalysis'],
    queryFn: fetchMarketData,
    refetchInterval: 300000, // 5 minutes
  });

  if (isLoading) {
    return <div className="glass-card p-6 rounded-lg animate-pulse">Loading volume analysis...</div>;
  }

  // Calculate volume-to-market-cap ratio and detect anomalies
  const volumeAnalysisData = marketData?.map((coin: any) => {
    const volumeToMcapRatio = coin.total_volume / coin.market_cap;
    const priceChange24h = coin.price_change_percentage_24h;
    
    return {
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      volume: coin.total_volume,
      marketCap: coin.market_cap,
      volumeToMcapRatio: volumeToMcapRatio * 100, // Convert to percentage
      priceChange24h,
      isAnomaly: volumeToMcapRatio > 0.15, // Flag high volume relative to market cap
      currentPrice: coin.current_price,
      image: coin.image,
    };
  }).slice(0, 15) || [];

  // Sort by volume for chart
  const topVolumeCoins = [...volumeAnalysisData]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 10);

  // Detect volume vs price divergence
  const divergenceCoins = volumeAnalysisData.filter(coin => 
    (coin.priceChange24h < -5 && coin.volumeToMcapRatio > 10) || // Price down but high volume
    (coin.priceChange24h > 5 && coin.volumeToMcapRatio > 15)     // Price up with very high volume
  );

  return (
    <div className="space-y-6">
      {/* Volume vs Market Cap Chart */}
      <div className="glass-card p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-400" />
          Volume Analysis Dashboard
        </h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topVolumeCoins}>
              <XAxis dataKey="symbol" stroke="#E6E4DD" fontSize={12} />
              <YAxis stroke="#E6E4DD" fontSize={12} tickFormatter={(value) => `$${(value / 1e9).toFixed(1)}B`} />
              <Tooltip 
                contentStyle={{ 
                  background: '#3A3935',
                  border: '1px solid #605F5B',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`$${(value / 1e9).toFixed(2)}B`, '24h Volume']}
              />
              <Bar dataKey="volume" fill="#60A5FA" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Volume Anomalies */}
      {divergenceCoins.length > 0 && (
        <div className="glass-card p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
            Volume vs Price Divergence Alerts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {divergenceCoins.slice(0, 6).map((coin) => (
              <div key={coin.symbol} className="p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <img src={coin.image} alt={coin.name} className="w-8 h-8" />
                  <div>
                    <div className="font-medium">{coin.symbol}</div>
                    <div className="text-sm text-muted-foreground">{coin.name}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Price Change: <span className={coin.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {coin.priceChange24h.toFixed(2)}%
                  </span></div>
                  <div>Volume/MCap: <span className="text-yellow-400">{coin.volumeToMcapRatio.toFixed(1)}%</span></div>
                </div>
                <div className="text-xs text-yellow-400 mt-1">
                  {coin.priceChange24h < -5 ? 'High volume despite price drop' : 'Unusual volume spike with price rise'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Volume to Market Cap Ratio Analysis */}
      <div className="glass-card p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
          Volume/Market Cap Efficiency
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {volumeAnalysisData
            .sort((a, b) => b.volumeToMcapRatio - a.volumeToMcapRatio)
            .slice(0, 9)
            .map((coin) => (
              <div key={coin.symbol} className={`p-4 rounded-lg ${coin.isAnomaly ? 'bg-orange-500/10 border border-orange-400/30' : 'bg-secondary/20'}`}>
                <div className="flex items-center space-x-3 mb-2">
                  <img src={coin.image} alt={coin.name} className="w-6 h-6" />
                  <div className="flex-1">
                    <div className="font-medium">{coin.symbol}</div>
                    <div className="text-sm text-muted-foreground">${coin.currentPrice.toFixed(2)}</div>
                  </div>
                  {coin.isAnomaly && <AlertTriangle className="w-4 h-4 text-orange-400" />}
                </div>
                <div className="space-y-1 text-sm">
                  <div>Volume: ${(coin.volume / 1e9).toFixed(2)}B</div>
                  <div>Vol/MCap: <span className={coin.volumeToMcapRatio > 15 ? 'text-orange-400' : 'text-muted-foreground'}>
                    {coin.volumeToMcapRatio.toFixed(1)}%
                  </span></div>
                  <div>24h: <span className={coin.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {coin.priceChange24h.toFixed(2)}%
                  </span></div>
                </div>
              </div>
            ))}
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span>High volume/market cap ratio may indicate increased interest or manipulation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolumeAnalysis;
