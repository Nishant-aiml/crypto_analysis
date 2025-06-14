import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Waves, TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface WhaleCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  total_volume: number;
  market_cap: number;
  price_change_percentage_24h: number;
  volume_to_market_cap_ratio: number;
}

const fetchMarketDataForWhaleWatch = async (): Promise<WhaleCoin[]> => {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false'
  );
  if (!response.ok) {
    throw new Error('Failed to fetch market data for Whale Watch');
  }
  const data = await response.json();
  return data.map((coin: any) => ({
    ...coin,
    volume_to_market_cap_ratio: coin.market_cap > 0 ? (coin.total_volume / coin.market_cap) * 100 : 0, // As percentage
  }));
};

const WhaleWatch: React.FC = () => {
  const { data: marketData, isLoading, error } = useQuery<WhaleCoin[]>({
    queryKey: ['whaleWatchData'],
    queryFn: fetchMarketDataForWhaleWatch,
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchInterval: 1000 * 60 * 90, // 1.5 hours
  });

  // Simplified logic: coins with high volume to market cap ratio (e.g., > 20%)
  // And significant 24h volume (e.g. > $1M)
  const potentialWhaleActivity = marketData
    ?.filter(coin => coin.volume_to_market_cap_ratio > 20 && coin.total_volume > 1000000)
    .sort((a, b) => b.volume_to_market_cap_ratio - a.volume_to_market_cap_ratio)
    .slice(0, 10); // Show top 10

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Waves className="w-6 h-6 mr-2 text-blue-400" />
          Whale Watch (Simplified)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Loading whale watch data...</p>}
        {error && <p className="text-red-500">Error loading data: {(error as Error).message}</p>}
        {!isLoading && !error && (!potentialWhaleActivity || potentialWhaleActivity.length === 0) && (
          <p className="text-muted-foreground">No significant unusual volume activity detected among top 50 coins based on current criteria.</p>
        )}
        {!isLoading && !error && potentialWhaleActivity && potentialWhaleActivity.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Coins with high 24h volume relative to their market cap. This might indicate increased interest or large trades. (Top 50 coins considered)
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Coin</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">24h Volume</TableHead>
                  <TableHead className="text-right">Vol/MCap Ratio</TableHead>
                  <TableHead className="text-right">24h Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {potentialWhaleActivity.map(coin => (
                  <TableRow key={coin.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <img src={coin.image} alt={coin.name} className="w-5 h-5 mr-2" />
                        {coin.name} ({coin.symbol.toUpperCase()})
                      </div>
                    </TableCell>
                    <TableCell className="text-right">${coin.current_price.toLocaleString()}</TableCell>
                    <TableCell className="text-right">${coin.total_volume.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{coin.volume_to_market_cap_ratio.toFixed(2)}%</TableCell>
                    <TableCell className={`text-right ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {coin.price_change_percentage_24h.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
         <p className="text-xs text-muted-foreground mt-4">
            Disclaimer: This is a simplified indicator and not financial advice. Large volume doesn't always mean "whale" activity in the traditional sense.
          </p>
      </CardContent>
    </Card>
  );
};

export default WhaleWatch;
