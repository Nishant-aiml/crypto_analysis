
import { TrendingUp, Search } from 'lucide-react'; // Removed Users as it's not used

// Define type for individual trending coin item, consistent with useAnalyticsData
interface TrendingCoinItem {
  item: {
    id: string;
    coin_id: number; // Keep if needed, otherwise remove
    name: string;
    symbol: string;
    market_cap_rank: number;
    thumb: string;
    score: number; // Keep if needed
  };
}

interface TrendingCoinsProps {
  trendingCoins?: TrendingCoinItem[];
  isLoading: boolean;
  error?: Error | null;
}

const TrendingCoins: React.FC<TrendingCoinsProps> = ({ trendingCoins, isLoading, error }) => {
  if (isLoading) {
    return <div className="glass-card p-6 rounded-lg animate-pulse">Loading trending coins...</div>;
  }

  if (error) {
    return <div className="glass-card p-6 rounded-lg text-red-400">Error loading trending coins: {error.message}</div>;
  }
  
  if (!trendingCoins || trendingCoins.length === 0) {
    return <div className="glass-card p-6 rounded-lg text-muted-foreground">No trending coins data available.</div>;
  }

  return (
    <div className="glass-card p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Search className="w-5 h-5 mr-2 text-orange-400" />
        Trending Coins
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trendingCoins.slice(0, 6).map((item: TrendingCoinItem, index: number) => (
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

