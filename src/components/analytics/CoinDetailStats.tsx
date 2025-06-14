import { useQuery } from '@tanstack/react-query';
import { Github, Twitter, Users, GitFork, Star, MessageSquare, GitPullRequest } from 'lucide-react'; // Removed Reddit, MessageSquare is already here

interface CoinDetailStatsProps {
  coinId: string;
  coinName: string;
  coinSymbol: string;
  coinImage: string;
}

const fetchCoinDetails = async (coinId: string) => {
  const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=false&community_data=true&developer_data=true&sparkline=false`);
  if (!response.ok) {
    throw new Error(`Failed to fetch details for ${coinId}`);
  }
  return response.json();
};

const StatCard: React.FC<{ icon: React.ElementType; label: string; value: string | number | undefined; unit?: string }> = ({ icon: Icon, label, value, unit }) => (
  <div className="flex items-center space-x-2 p-2 bg-secondary/30 rounded">
    <Icon className="w-5 h-5 text-primary" />
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">
        {value !== undefined && value !== null ? `${value}${unit || ''}` : 'N/A'}
      </div>
    </div>
  </div>
);

const CoinDetailStats: React.FC<CoinDetailStatsProps> = ({ coinId, coinName, coinSymbol, coinImage }) => {
  const { data: coinDetails, isLoading, error } = useQuery({
    queryKey: ['coinDetails', coinId],
    queryFn: () => fetchCoinDetails(coinId),
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchInterval: 1000 * 60 * 90, // 1.5 hours
  });

  if (isLoading) {
    return <div className="p-3 bg-secondary/20 rounded-lg animate-pulse">Loading {coinName} details...</div>;
  }
  if (error) {
    return <div className="p-3 bg-secondary/20 rounded-lg text-red-400">Error loading {coinName} details.</div>;
  }

  const devData = coinDetails?.developer_data;
  const communityData = coinDetails?.community_data;

  return (
    <div className="p-4 bg-secondary/20 rounded-lg border border-primary/20">
      <div className="flex items-center space-x-3 mb-4">
        <img src={coinImage} alt={coinName} className="w-8 h-8" />
        <div>
          <h3 className="text-lg font-semibold">{coinName} ({coinSymbol.toUpperCase()})</h3>
          <p className="text-xs text-muted-foreground">Developer & Social Activity</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* Developer Stats */}
        <StatCard icon={Star} label="GitHub Stars" value={devData?.stars} />
        <StatCard icon={GitFork} label="GitHub Forks" value={devData?.forks} />
        <StatCard icon={Users} label="GitHub Subs" value={devData?.subscribers} />
        <StatCard icon={GitPullRequest} label="Merged PRs" value={devData?.pull_requests_merged} />
        
        {/* Community Stats */}
        <StatCard icon={Twitter} label="Twitter Followers" value={communityData?.twitter_followers} />
        <StatCard icon={MessageSquare} label="Reddit Subs" value={communityData?.reddit_subscribers} /> {/* Changed icon to MessageSquare */}
      </div>
    </div>
  );
};

export default CoinDetailStats;
