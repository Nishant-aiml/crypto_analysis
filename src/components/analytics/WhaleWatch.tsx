
import React from 'react';
import { Waves, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CoinData } from '@/types/crypto';

export interface WhaleActivityCoin extends CoinData {
  volume_to_market_cap_ratio: number;
}

interface WhaleWatchProps {
  potentialWhaleActivity: WhaleActivityCoin[];
  isLoading: boolean;
  error?: Error | null;
}

const WhaleWatch: React.FC<WhaleWatchProps> = ({ potentialWhaleActivity, isLoading, error }) => {
  if (error) {
    // Log for debugging, but don't show component or error message in UI as per request
    console.warn(`Whale Watch: Not rendering due to source data error: ${error.message}`);
    // Optionally, show a very minimal placeholder if needed, or just null
    // return (
    //   <Card className="glass-card opacity-50">
    //     <CardHeader>
    //       <CardTitle className="flex items-center text-muted-foreground">
    //         <Waves className="w-6 h-6 mr-2" />
    //         Whale Watch (Data Unavailable)
    //       </CardTitle>
    //     </CardHeader>
    //     <CardContent>
    //       <p className="text-xs text-muted-foreground text-center py-4">Temporarily unavailable due to data source issues.</p>
    //     </CardContent>
    //   </Card>
    // );
    return null; // "Remove" component if there's an error with its data source
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Waves className="w-6 h-6 mr-2 text-blue-400" />
          Whale Watch (Simplified)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-center py-4">Loading whale watch data...</p>}
        
        {!isLoading && (!potentialWhaleActivity || potentialWhaleActivity.length === 0) && (
          <p className="text-muted-foreground text-center py-4">No significant unusual volume activity detected based on current criteria.</p>
        )}
        {!isLoading && potentialWhaleActivity && potentialWhaleActivity.length > 0 && (
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
         <p className="text-xs text-muted-foreground mt-4 text-center">
            Disclaimer: This is a simplified indicator and not financial advice. Large volume doesn't always mean "whale" activity.
          </p>
      </CardContent>
    </Card>
  );
};

export default WhaleWatch;
