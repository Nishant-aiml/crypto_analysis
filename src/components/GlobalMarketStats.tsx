
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, ActivityIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const fetchGlobalData = async () => {
  const response = await fetch('https://api.coingecko.com/api/v3/global');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const GlobalMarketStats = () => {
  const { data: globalData, isLoading } = useQuery({
    queryKey: ['globalMarketData'],
    queryFn: fetchGlobalData,
    refetchInterval: 60000,
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

  const data = globalData?.data;
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
          ${marketCap ? (marketCap / 1e12).toFixed(2) : '0'}T
        </p>
        <span className="text-sm text-success flex items-center gap-1">
          <ArrowUpIcon className="w-3 h-3" />
          {data?.market_cap_change_percentage_24h_usd?.toFixed(1) || '0.0'}%
        </span>
      </div>
      
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">24h Volume</h3>
          <ActivityIcon className="w-4 h-4 text-primary" />
        </div>
        <p className="text-2xl font-semibold mt-2">
          ${volume ? (volume / 1e9).toFixed(1) : '0'}B
        </p>
        <span className="text-sm text-muted-foreground">
          Active markets: {data?.active_cryptocurrencies?.toLocaleString() || '0'}
        </span>
      </div>
      
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">BTC Dominance</h3>
          <TrendingUpIcon className="w-4 h-4 text-warning" />
        </div>
        <p className="text-2xl font-semibold mt-2">{btcDominance?.toFixed(1) || '0'}%</p>
        <span className="text-sm text-muted-foreground">
          ETH: {ethDominance?.toFixed(1) || '0'}%
        </span>
      </div>
      
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Market Status</h3>
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
        </div>
        <p className="text-lg font-semibold mt-2">Live</p>
        <span className="text-sm text-muted-foreground">
          {data?.markets?.toLocaleString() || '0'} exchanges
        </span>
      </div>
    </div>
  );
};

export default GlobalMarketStats;
