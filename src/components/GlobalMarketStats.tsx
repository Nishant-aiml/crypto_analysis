import { ArrowUpIcon, TrendingUpIcon, ActivityIcon, AlertTriangleIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchGlobalData } from "@/services/coingeckoService";

const GlobalMarketStats = () => {
  const { data: globalDataResponse, isLoading, error } = useQuery({
    queryKey: ['globalData'],
    queryFn: fetchGlobalData,
    refetchInterval: 120000,
    staleTime: 90000,
    retry: (failureCount, err: Error) => {
      if (err.message.includes("429")) {
        if (failureCount === 0) toast.warning(`API rate limit hit. Retrying...`);
        return failureCount < 3; // Retry up to 3 times
      }
      if (err.message.includes("404")) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex, err: Error) => {
      if (err.message.includes("429")) {
        return Math.min(1000 * 2 ** attemptIndex, 30000) + Math.random() * 200;
      }
      return 1000 * (attemptIndex + 1);
    },
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
    const isRateLimitError = error.message.includes("429");
    const generalErrorMessage = "Data temporarily unavailable.";
    const specificErrorMessage = error.message.length > 100 ? error.message.substring(0, 100) + "..." : error.message;

    // The toast will show the detailed error. For the UI, keep it concise.
    const displayMessage = isRateLimitError ? "API rate limit reached. Stats will update soon." : generalErrorMessage;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-6 rounded-lg text-center">
            <AlertTriangleIcon className="w-6 h-6 text-warning mx-auto mb-2" />
            <p className="text-xs text-muted-foreground px-2">
              {i === 0 ? displayMessage : (isRateLimitError ? "Unavailable" : "Error")}
            </p>
            {i === 0 && !isRateLimitError && <p className="text-xs text-muted-foreground/70 mt-1 truncate px-1" title={specificErrorMessage}>{specificErrorMessage}</p>}
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
