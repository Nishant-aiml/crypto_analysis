
import React from 'react';
import { Waves } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CoinData } from '@/types/crypto';

export interface WhaleActivityCoin extends CoinData {
  volume_to_market_cap_ratio: number;
}

interface WhaleWatchProps {
  potentialWhaleActivity: WhaleActivityCoin[];
  isLoading: boolean; // This isLoading refers to the data processing in Analytics.tsx and its source (marketData)
  error?: Error | null; // This error refers to issues fetching/processing the source marketData
}

const WhaleWatch: React.FC<WhaleWatchProps> = ({ potentialWhaleActivity, isLoading, error }) => {
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
        {error && (
          <p className="text-red-500">
            Error loading data for Whale Watch: {error.message}. This might be due to issues fetching underlying market data.
          </p>
        )}
        {!isLoading && !error && (!potentialWhaleActivity || potentialWhaleActivity.length === 0) && (
          <p className="text-muted-foreground">No significant unusual volume activity detected based on current criteria, or source data is unavailable.</p>
        )}
        {!isLoading && !error && potentialWhaleActivity && potentialWhaleActivity.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Coins with high 24h volume relative to their market cap. This might indicate increased interest or large trades.
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
                    <TableCell className="text-right">
                      {coin.volume_to_market_cap_ratio.toFixed(2)}%
                    </TableCell>
                    <TableCell className={`text-right ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {coin.price_change_percentage_24h?.toFixed(2) ?? '0.00'}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
         <p className="text-xs text-muted-foreground mt-4">
            Disclaimer: This is a simplified indicator and not financial advice. Large volume doesn't always mean "whale" activity.
          </p>
      </CardContent>
    </Card>
  );
};

export default WhaleWatch;

