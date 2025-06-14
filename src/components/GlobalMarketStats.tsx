import { ArrowUpIcon, TrendingUpIcon, ActivityIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const fetchGlobalData = async () => {
  const url = 'https://api.coingecko.com/api/v3/global';
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Failed to read error response body (status ${response.status})`);
    console.error(`Failed to fetch global data from ${url} with status ${response.status}: ${errorText}`, response);
    throw new Error(`Failed to fetch global market data. Status: ${response.status}. Message: ${errorText}`);
  }
  return response.json();
};

const GlobalMarketStats = () => {
  const { data: globalDataResponse, isLoading, error } = useQuery({
    queryKey: ['globalMarketStatsData'],
    queryFn: fetchGlobalData,
    refetchInterval: 60000,
    staleTime: 30000,
    meta: {
      onError: (err: Error) => {
        toast.error(`Global Stats Error: ${err.message}`);
      }
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-6 rounded-lg animate-pulse">
            <div className="w-full h-16 bg-secondary/20 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-6 rounded-lg text-center">
            <ActivityIcon className="w-6 h-6 text-destructive mx-auto mb-2" />
            <p className="text-xs text-destructive">Error loading stat</p>
          </div>
        ))}
      </div>
    );
  }

  const data = globalDataResponse?.data;
  const marketCap = data?.total_market_cap?.usd;
  const volume = data?.total_volume?.usd;
  const btcDominance = data?.market_cap_percentage?.btc;
  const ethDominance = data?.market_cap_percentage?.eth;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in">
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Global Market Cap</h3>
          <TrendingUpIcon className="w-4 h-4 text-primary" />
        </div>
        <p className="text-2xl font-semibold mt-2">
          ${marketCap ? (marketCap / 1e12).toFixed(2) : 'N/A'}T
        </p>
        <span className={`text-sm ${data?.market_cap_change_percentage_24h_usd >= 0 ? 'text-success' : 'text-destructive'} flex items-center gap-1`}>
          {data?.market_cap_change_percentage_24h_usd >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowUpIcon className="w-3 h-3 transform rotate-180" />}
          {data?.market_cap_change_percentage_24h_usd?.toFixed(1) || '0.0'}%
        </span>
      </div>
      
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">24h Volume</h3>
          <ActivityIcon className="w-4 h-4 text-primary" />
        </div>
        <p className="text-2xl font-semibold mt-2">
          ${volume ? (volume / 1e9).toFixed(1) : 'N/A'}B
        </p>
        <span className="text-sm text-muted-foreground">
          Active markets: {data?.active_cryptocurrencies?.toLocaleString() || 'N/A'}
        </span>
      </div>
      
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">BTC Dominance</h3>
          <TrendingUpIcon className="w-4 h-4 text-warning" />
        </div>
        <p className="text-2xl font-semibold mt-2">{btcDominance?.toFixed(1) || 'N/A'}%</p>
        <span className="text-sm text-muted-foreground">
          ETH: {ethDominance?.toFixed(1) || 'N/A'}%
        </span>
      </div>
      
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Market Status</h3>
          <div className={`w-2 h-2 ${data ? 'bg-success' : 'bg-gray-400'} rounded-full ${data ? 'animate-pulse' : ''}`}></div>
        </div>
        <p className="text-lg font-semibold mt-2">{data ? 'Live' : 'Unknown'}</p>
        <span className="text-sm text-muted-foreground">
          {data?.markets?.toLocaleString() || 'N/A'} exchanges
        </span>
      </div>
    </div>
  );
};

export default GlobalMarketStats;
