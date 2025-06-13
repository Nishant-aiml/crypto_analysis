
import { useQuery } from "@tanstack/react-query";
import { TrendingUpIcon, TrendingDownIcon, AlertTriangleIcon } from "lucide-react";

const fetchFearGreedData = async () => {
  const response = await fetch('https://api.alternative.me/fng/');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const FearGreedIndex = () => {
  const { data: fearGreedData, isLoading } = useQuery({
    queryKey: ['fearGreedIndex'],
    queryFn: fetchFearGreedData,
    refetchInterval: 300000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-lg animate-pulse">
        <div className="w-full h-32 bg-secondary/20 rounded"></div>
      </div>
    );
  }

  const currentData = fearGreedData?.data?.[0];
  const value = parseInt(currentData?.value || '0');
  const classification = currentData?.value_classification || 'Neutral';
  
  const getColorByValue = (val: number) => {
    if (val <= 25) return 'text-warning';
    if (val <= 45) return 'text-orange-400';
    if (val <= 55) return 'text-yellow-400';
    if (val <= 75) return 'text-success';
    return 'text-green-400';
  };

  const getIcon = (val: number) => {
    if (val <= 25) return <TrendingDownIcon className="w-5 h-5 text-warning" />;
    if (val <= 75) return <AlertTriangleIcon className="w-5 h-5 text-yellow-400" />;
    return <TrendingUpIcon className="w-5 h-5 text-success" />;
  };

  return (
    <div className="glass-card p-6 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Fear & Greed Index</h3>
        {getIcon(value)}
      </div>
      
      <div className="text-center">
        <div className={`text-4xl font-bold ${getColorByValue(value)} mb-2`}>
          {value}
        </div>
        <div className="text-lg font-medium mb-4">{classification}</div>
        
        <div className="w-full bg-secondary rounded-full h-3 mb-4">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              value <= 25 ? 'bg-warning' :
              value <= 45 ? 'bg-orange-400' :
              value <= 55 ? 'bg-yellow-400' :
              value <= 75 ? 'bg-success' : 'bg-green-400'
            }`}
            style={{ width: `${value}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Extreme Fear</span>
          <span>Neutral</span>
          <span>Extreme Greed</span>
        </div>
        
        <div className="text-xs text-muted-foreground mt-3">
          Last updated: {new Date(currentData?.timestamp * 1000).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default FearGreedIndex;
