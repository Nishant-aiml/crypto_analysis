import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Search, Users } from 'lucide-react';

const fetchTrendingCoins = async () => {
  const response = await fetch('https://api.coingecko.com/api/v3/search/trending');
  if (!response.ok) throw new Error('Failed to fetch trending data');
  return response.json();
};

const TrendingCoins = () => {
  const { data: trendingData, isLoading } = useQuery({
    queryKey: ['trending'],
    queryFn: fetchTrendingCoins,
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchInterval: 1000 * 60 * 90, // 1.5 hours
  });

  if (isLoading) {
    return <div className="glass-card p-6 rounded-lg animate-pulse">Loading trending coins...</div>;
  }

  const trendingCoins = trendingData?.coins || [];

  return (
    <div className="glass-card p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Search className="w-5 h-5 mr-2 text-orange-400" />
        Trending Coins (Real-time)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trendingCoins.slice(0, 6).map((item: any, index: number) => (
          <div key={item.item.id} className="p-4 bg-secondary/20 rounded-lg border border-orange-400/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-orange-400 font-bold">#{index + 1}</span>
                <img src={item.item.thumb} alt={item.item.name} className="w-6 h-6" />
              </div>
              <TrendingUp className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <div className="font-medium">{item.item.symbol.toUpperCase()}</div>
              <div className="text-sm text-muted-foreground">{item.item.name}</div>
              <div className="text-xs text-orange-400 mt-1">Rank #{item.item.market_cap_rank}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingCoins;
