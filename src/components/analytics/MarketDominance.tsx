
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Crown, TrendingUp, TrendingDown } from 'lucide-react';
import { fetchGlobalData, fetchTopCoinsForDominance } from '@/services/coingeckoService';
import { toast } from 'sonner';

const COLORS = ['#F59E0B', '#8B5CF6', '#10B981', '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#8989DE'];

const MarketDominance = () => {
    const retryConfig = {
    retry: (failureCount: number, err: Error) => {
      if (err.message.includes("429")) {
        if (failureCount === 0) toast.warning(`API rate limit hit. Retrying...`);
        return failureCount < 3;
      }
      if (err.message.includes("404")) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex: number, err: Error) => {
      if (err.message.includes("429")) {
        return Math.min(1000 * 2 ** attemptIndex, 30000) + Math.random() * 200;
      }
      return 1000 * (attemptIndex + 1);
    },
  };

  const { data: globalData, isLoading: globalLoading } = useQuery({
    queryKey: ['globalData'],
    queryFn: fetchGlobalData,
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchInterval: 1000 * 60 * 90, // 1.5 hours
    ...retryConfig,
    meta: {
        onError: (err: Error) => {
          toast.error(`Market Dominance (Global) Error: ${err.message}`);
        }
    }
  });

  const { data: topCoins, isLoading: coinsLoading } = useQuery({
    queryKey: ['topCoinsForDominance'],
    queryFn: fetchTopCoinsForDominance,
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchInterval: 1000 * 60 * 90, // 1.5 hours
    ...retryConfig,
    meta: {
        onError: (err: Error) => {
          toast.error(`Market Dominance (Top Coins) Error: ${err.message}`);
        }
    }
  });

  if (globalLoading || coinsLoading) {
    return <div className="glass-card p-6 rounded-lg animate-pulse">Loading market dominance...</div>;
  }

  const btcDominance = globalData?.data?.market_cap_percentage?.btc || 0;
  const ethDominance = globalData?.data?.market_cap_percentage?.eth || 0;
  const otherDominance = 100 - btcDominance - ethDominance;

  const dominanceData = [
    { name: 'Bitcoin', value: btcDominance, symbol: 'BTC' },
    { name: 'Ethereum', value: ethDominance, symbol: 'ETH' },
    { name: 'Others', value: otherDominance, symbol: 'ALT' },
  ];

  const topCoinsDominance = topCoins?.slice(0, 5).map((coin: any, index: number) => {
    const totalMarketCap = globalData?.data?.total_market_cap?.usd || 1;
    const dominancePercentage = (coin.market_cap / totalMarketCap) * 100;
    
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
        </div>

        {/* Top Coins Dominance */}
        <div>
          <h3 className="text-lg font-medium mb-3">Top Coins Breakdown</h3>
          <div className="space-y-3">
            {topCoinsDominance.map((coin, index) => (
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
                  <div className={`flex items-center text-sm ${coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {coin.change24h >= 0 ? 
                      <TrendingUp className="w-3 h-3 mr-1" /> : 
                      <TrendingDown className="w-3 h-3 mr-1" />
                    }
                    {Math.abs(coin.change24h).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            ${(globalData?.data?.total_market_cap?.usd / 1e12).toFixed(2) || 0}T
          </div>
          <div className="text-sm text-muted-foreground">Total Market Cap</div>
        </div>
      </div>
    </div>
  );
};

export default MarketDominance;
