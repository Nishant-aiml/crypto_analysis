import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Crown, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'; // Added AlertTriangle

const fetchGlobalData = async () => {
  const url = 'https://api.coingecko.com/api/v3/global';
  try {
    const response = await fetch(url);
    if (!response.ok) {
      let errorText = `Failed to fetch global data (MarketDominance) with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorText += `: ${JSON.stringify(errorData)}`;
      } catch (e) {
        errorText += ` and failed to parse error response body.`;
      }
      console.error(errorText, response);
      throw new Error(errorText);
    }
    return response.json();
  } catch (error) {
    console.error(`Network or other error fetching global data (MarketDominance) from ${url}:`, error);
    if (error instanceof Error) {
      throw new Error(`Network error fetching global data (MarketDominance): ${error.message}`);
    }
    throw new Error(`Network error fetching global data (MarketDominance): ${String(error)}`);
  }
};

const fetchTopCoinsForDominance = async () => {
  const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1';
  try {
    const response = await fetch(url);
    if (!response.ok) {
      let errorText = `Failed to fetch top coins for dominance with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorText += `: ${JSON.stringify(errorData)}`;
      } catch (e) {
        errorText += ` and failed to parse error response body.`;
      }
      console.error(errorText, response);
      throw new Error(errorText);
    }
    return response.json();
  } catch (error) {
    console.error(`Network or other error fetching top coins for dominance from ${url}:`, error);
    if (error instanceof Error) {
      throw new Error(`Network error fetching top coins for dominance: ${error.message}`);
    }
    throw new Error(`Network error fetching top coins for dominance: ${String(error)}`);
  }
};

const COLORS = ['#F59E0B', '#8B5CF6', '#10B981', '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#8989DE'];

const MarketDominance = () => {
  const { data: globalData, isLoading: globalLoading, error: globalError } = useQuery({
    queryKey: ['globalMarketDataDominance'], // Changed key to avoid conflict if another component uses 'globalMarketData'
    queryFn: fetchGlobalData,
    staleTime: 1000 * 60 * 60, 
    refetchInterval: 1000 * 60 * 90, 
  });

  const { data: topCoins, isLoading: coinsLoading, error: coinsError } = useQuery({
    queryKey: ['topCoinsForDominance'],
    queryFn: fetchTopCoinsForDominance,
    staleTime: 1000 * 60 * 60, 
    refetchInterval: 1000 * 60 * 90, 
  });

  if (globalLoading || coinsLoading) {
    return <div className="glass-card p-6 rounded-lg animate-pulse">Loading market dominance...</div>;
  }

  if (globalError || coinsError) {
    return (
      <div className="glass-card p-6 rounded-lg text-center text-destructive">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
        <p>Error loading market dominance data.</p>
        {globalError && <p className="text-xs mt-1">Global data: {(globalError as Error).message}</p>}
        {coinsError && <p className="text-xs mt-1">Top coins: {(coinsError as Error).message}</p>}
      </div>
    );
  }

  const btcDominance = globalData?.data?.market_cap_percentage?.btc || 0;
  const ethDominance = globalData?.data?.market_cap_percentage?.eth || 0;
  const otherDominance = Math.max(0, 100 - btcDominance - ethDominance); // Ensure others is not negative

  const dominanceData = [
    { name: 'Bitcoin', value: btcDominance, symbol: 'BTC' },
    { name: 'Ethereum', value: ethDominance, symbol: 'ETH' },
    { name: 'Others', value: otherDominance, symbol: 'ALT' },
  ].filter(d => d.value > 0); // Filter out zero values for cleaner chart

  const topCoinsDominance = topCoins?.slice(0, 5).map((coin: any, index: number) => {
    const totalMarketCap = globalData?.data?.total_market_cap?.usd || 1; // Avoid division by zero
    const dominancePercentage = totalMarketCap > 0 ? (coin.market_cap / totalMarketCap) * 100 : 0;
    
    return {
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      dominance: dominancePercentage,
      change24h: coin.price_change_percentage_24h,
      image: coin.image,
    };
  }) || [];

  return (
    <div className="glass-card p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Crown className="w-5 h-5 mr-2 text-yellow-400" />
        Market Dominance Analysis
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div>
          <h3 className="text-lg font-medium mb-3">Overall Dominance</h3>
          {dominanceData.length > 0 ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dominanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dominanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value.toFixed(2)}%`, 'Dominance']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">No dominance data to display.</div>
          )}
        </div>

        {/* Top Coins Dominance */}
        <div>
          <h3 className="text-lg font-medium mb-3">Top Coins Breakdown</h3>
          {topCoinsDominance.length > 0 ? (
            <div className="space-y-3">
              {topCoinsDominance.map((coin) => (
                <div key={coin.symbol} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img src={coin.image} alt={coin.name} className="w-6 h-6" />
                    <div>
                      <div className="font-medium">{coin.symbol}</div>
                      <div className="text-sm text-muted-foreground">{coin.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{coin.dominance.toFixed(2)}%</div>
                    <div className={`flex items-center justify-end text-sm ${coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {coin.change24h >= 0 ? 
                        <TrendingUp className="w-3 h-3 mr-1" /> : 
                        <TrendingDown className="w-3 h-3 mr-1" />
                      }
                      {Math.abs(coin.change24h ?? 0).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="h-full flex items-center justify-center text-muted-foreground">No top coins data to display.</div>
          )}
        </div>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="p-3 bg-secondary/20 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-400">{btcDominance.toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">BTC Dominance</div>
        </div>
        <div className="p-3 bg-secondary/20 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-400">{ethDominance.toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">ETH Dominance</div>
        </div>
        <div className="p-3 bg-secondary/20 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-400">
            {globalData?.data?.active_cryptocurrencies?.toLocaleString() || 'N/A'}
          </div>
          <div className="text-sm text-muted-foreground">Active Coins</div>
        </div>
        <div className="p-3 bg-secondary/20 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-400">
            ${(globalData?.data?.total_market_cap?.usd && globalData.data.total_market_cap.usd > 0 ? (globalData.data.total_market_cap.usd / 1e12).toFixed(2) : 'N/A')}T
          </div>
          <div className="text-sm text-muted-foreground">Total Market Cap</div>
        </div>
      </div>
    </div>
  );
};

export default MarketDominance;
