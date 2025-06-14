import { useQuery } from '@tanstack/react-query';
import { Github, Twitter, Users, GitFork, Star, MessageSquare, GitPullRequest, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface CoinDetailStatsProps {
  coinId: string;
  coinName: string;
  coinSymbol: string;
  coinImage: string;
}

const fetchCoinDetails = async (coinId: string) => {
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=false&community_data=true&developer_data=true&sparkline=false`;
  const errorMessagePrefix = `fetch details for ${coinId}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      let errorText = `Failed to ${errorMessagePrefix}. Status: ${response.status}.`;
      if (response.status === 429) {
        errorText = `API rate limit (429) for ${errorMessagePrefix}. Data temporarily unavailable.`;
      } else {
         try {
          const responseBody = await response.text();
          errorText += ` Message: ${responseBody.substring(0,100) || '(empty body)' }`;
        } catch (e) {
          errorText += ` (${response.statusText || 'Failed to parse error body'})`;
        }
      }
      console.error(`Error in fetchCoinDetails for ${url}: ${errorText}`, response);
      throw new Error(errorText);
    }
    return response.json();
  } catch (error) {
    console.error(`Network or other error in fetchCoinDetails for ${url}:`, error);
    if (error instanceof Error && error.message.includes(errorMessagePrefix.split(" (")[0].replace("fetch ", ""))) {
        throw error;
    }
    throw new Error(`Network error during ${errorMessagePrefix}: ${error instanceof Error ? error.message : String(error)}`);
  }
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
  const { data: coinDetails, isLoading, error } = useQuery<any, Error>({
    queryKey: ['coinDetails', coinId],
    queryFn: () => fetchCoinDetails(coinId),
    staleTime: 1000 * 60 * 60, 
    refetchInterval: 1000 * 60 * 90,
    retry: (failureCount, err: Error) => {
      if (err.message.includes("429") || err.message.includes("404")) {
        return false;
      }
      return failureCount < 2;
    },
    meta: {
      onError: (err: Error) => {
        toast.error(`Error fetching ${coinName} details: ${err.message}`);
      }
    }
  });

  if (isLoading) {
    return <div className="p-3 bg-secondary/20 rounded-lg animate-pulse">Loading {coinName} details...</div>;
  }
  if (error) {
    console.warn(`CoinDetailStats for ${coinName}: Not rendering due to data fetching error: ${error.message}`);
    return null; // "Remove" error message by not rendering the component
  }

  const devData = coinDetails?.developer_data;
  const communityData = coinDetails?.community_data;

  if (!devData && !communityData) {
     return (
        <div className="p-4 bg-secondary/20 rounded-lg border border-primary/20">
         <div className="flex items-center space-x-3 mb-4">
            <img src={coinImage} alt={coinName} className="w-8 h-8" />
            <div>
              <h3 className="text-lg font-semibold">{coinName} ({coinSymbol.toUpperCase()})</h3>
              <p className="text-xs text-muted-foreground">Developer & Social Activity</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center py-2">No detailed developer or social data available for {coinName}.</p>
        </div>
     );
  }

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
        <StatCard icon={MessageSquare} label="Reddit Subs" value={communityData?.reddit_subscribers} />
      </div>
    </div>
  );
};

export default CoinDetailStats;
