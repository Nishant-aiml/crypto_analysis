import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Smile, Meh, Frown, Activity, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GlobalData {
  data: {
    total_market_cap: { usd: number };
    market_cap_percentage: { btc: number; eth: number };
    market_cap_change_percentage_24h_usd: number;
  };
}

interface MarketCoin {
  price_change_percentage_24h: number | null;
}

const fetchGlobalMarketData = async (): Promise<GlobalData> => {
  const response = await fetch('https://api.coingecko.com/api/v3/global');
  if (!response.ok) throw new Error('Failed to fetch global market data');
  return response.json();
};

const fetchTopCoinsMarketData = async (): Promise<MarketCoin[]> => {
  const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h');
  if (!response.ok) throw new Error('Failed to fetch top coins market data');
  return response.json();
};

const calculateMoodScore = (globalData?: GlobalData, topCoinsData?: MarketCoin[]): number => {
  if (!globalData || !topCoinsData) return 50; // Neutral if data is missing

  let score = 50; // Start with neutral

  // Factor 1: Overall market cap change
  const marketCapChange = globalData.data.market_cap_change_percentage_24h_usd;
  if (marketCapChange > 1) score += 20; // Strong positive
  else if (marketCapChange > 0) score += 10; // Mild positive
  else if (marketCapChange < -1) score -= 20; // Strong negative
  else if (marketCapChange < 0) score -= 10; // Mild negative

  // Factor 2: Percentage of top 50 coins that are up
  const positiveCoins = topCoinsData.filter(coin => coin.price_change_percentage_24h !== null && coin.price_change_percentage_24h > 0).length;
  const positivePercentage = (positiveCoins / topCoinsData.length) * 100;
  if (positivePercentage > 70) score += 20; // Very bullish
  else if (positivePercentage > 50) score += 10; // Bullish
  else if (positivePercentage < 30) score -= 20; // Very bearish
  else if (positivePercentage < 50) score -= 10; // Bearish
  
  // Factor 3: BTC Dominance (simple: stability is neutral, big changes are less certain)
  // This is a very naive interpretation. A more robust mood ring would use more sophisticated sentiment analysis.
  // For now, we'll keep it simple. If BTC dominance changes sharply, could indicate volatility.
  // This part can be expanded later with btc_dominance_24h_percentage_change if available or calculated.

  return Math.max(0, Math.min(100, score)); // Clamp score between 0 and 100
};

const MarketMoodRing: React.FC = () => {
  const { data: globalData, isLoading: isLoadingGlobal, error: errorGlobal } = useQuery<GlobalData>({
    queryKey: ['globalMarketDataForMood'],
    queryFn: fetchGlobalMarketData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const { data: topCoinsData, isLoading: isLoadingCoins, error: errorCoins } = useQuery<MarketCoin[]>({
    queryKey: ['topCoinsMarketDataForMood'],
    queryFn: fetchTopCoinsMarketData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
  
  const moodScore = calculateMoodScore(globalData, topCoinsData);

  let mood, Icon, color, description;

  if (moodScore > 70) {
    mood = 'Very Positive'; Icon = Smile; color = 'text-green-400'; description = 'Market shows strong bullish signals. Overall sentiment is highly optimistic.';
  } else if (moodScore > 55) {
    mood = 'Positive'; Icon = Smile; color = 'text-green-300'; description = 'Market sentiment is generally positive. Indicators lean bullish.';
  } else if (moodScore < 30) {
    mood = 'Very Negative'; Icon = Frown; color = 'text-red-400'; description = 'Market shows strong bearish signals. Caution advised.';
  } else if (moodScore < 45) {
    mood = 'Negative'; Icon = Frown; color = 'text-red-300'; description = 'Market sentiment is generally negative. Indicators lean bearish.';
  } else {
    mood = 'Neutral'; Icon = Meh; color = 'text-yellow-400'; description = 'Market sentiment is mixed. Indicators show a balance of bullish and bearish signs.';
  }

  if (isLoadingGlobal || isLoadingCoins) {
    mood = 'Calculating...'; Icon = Activity; color = 'text-gray-400'; description = 'Fetching latest market data to determine mood.';
  }
  
  if (errorGlobal || errorCoins) {
     mood = 'Error'; Icon = Activity; color = 'text-red-500'; description = 'Could not determine market mood due to data error.';
  }
  
  const marketCapChange = globalData?.data?.market_cap_change_percentage_24h_usd;
  const positiveCoins = topCoinsData?.filter(coin => coin.price_change_percentage_24h !== null && coin.price_change_percentage_24h > 0).length;
  const totalCoinsConsidered = topCoinsData?.length;


  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="w-6 h-6 mr-2 text-pink-400" />
          Market Mood Ring
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <Icon size={64} className={`mx-auto mb-4 ${color}`} />
        <h3 className={`text-2xl font-semibold mb-2 ${color}`}>{mood}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
        
        {!isLoadingGlobal && !isLoadingCoins && !errorGlobal && !errorCoins && globalData && topCoinsData && (
          <div className="mt-4 space-y-2 text-xs text-muted-foreground border-t border-border/50 pt-3">
            <div className="flex justify-center items-center">
              {marketCapChange && marketCapChange >= 0 ? <TrendingUp className="w-4 h-4 mr-1 text-green-500" /> : <TrendingDown className="w-4 h-4 mr-1 text-red-500" />}
              Total Market Cap 24h: <span className={marketCapChange && marketCapChange >=0 ? 'text-green-500' : 'text-red-500'}> {marketCapChange?.toFixed(2)}%</span>
            </div>
             <div className="flex justify-center items-center">
                <DollarSign className="w-4 h-4 mr-1 text-yellow-500" />
                Top 50 Coins Up: {positiveCoins}/{totalCoinsConsidered} ({totalCoinsConsidered ? ((positiveCoins ?? 0)/totalCoinsConsidered*100).toFixed(0) : 'N/A'}%)
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-4">(Based on simplified market indicators)</p>
      </CardContent>
    </Card>
  );
};

export default MarketMoodRing;
