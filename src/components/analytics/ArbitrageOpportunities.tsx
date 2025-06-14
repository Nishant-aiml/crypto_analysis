import React from 'react';
import { useQuery, QueryKey } from '@tanstack/react-query';
import { GitCompareArrows, TrendingUp, Info, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from 'sonner';

const TARGET_COIN_ID = 'bitcoin';

interface Ticker {
  market: { name: string; identifier: string; };
  last: number;
  volume: number;
  trade_url?: string;
  trust_score: 'green' | 'yellow' | 'red' | null;
}

interface ArbitrageData {
  coinId: string;
  tickers: Ticker[];
}

const fetchArbitrageData = async (coinId: string): Promise<ArbitrageData> => {
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/tickers?page=1&order=volume_desc`;
  const errorMessagePrefix = `fetching arbitrage data for ${coinId}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      let errorText = `Failed ${errorMessagePrefix}. Status: ${response.status}`;
      if (response.status === 429) {
        errorText = `API rate limit (429) for ${errorMessagePrefix}. Data temporarily unavailable.`;
      } else {
        try {
          const responseText = await response.text();
          errorText += ` - Details: ${responseText.substring(0, 100) || '(empty body)'}`;
        } catch (e) {
          errorText += ` (${response.statusText || 'Failed to parse error response body'})`;
        }
      }
      console.error(`Error in fetchArbitrageData for ${url}: ${errorText}`);
      throw new Error(errorText);
    }
    const data = await response.json();
    const highTrustTickers = data.tickers
      .filter((t: Ticker) => t.trust_score === 'green' && t.volume > 0)
      .sort((a: Ticker, b: Ticker) => b.volume - a.volume)
      .slice(0, 10);

    return { coinId, tickers: highTrustTickers };
  } catch (error) {
    console.error(`Network or other error in fetchArbitrageData for ${url}:`, error);
    if (error instanceof Error && error.message.includes(errorMessagePrefix.split(" (")[0].replace("fetching ", ""))) {
        throw error;
    }
    throw new Error(`Network error during ${errorMessagePrefix}: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const ArbitrageOpportunities: React.FC = () => {
  const { data, isLoading, error } = useQuery<ArbitrageData, Error, ArbitrageData, QueryKey>({
    queryKey: ['arbitrageData', TARGET_COIN_ID],
    queryFn: () => fetchArbitrageData(TARGET_COIN_ID),
    staleTime: 1000 * 60 * 15, 
    refetchInterval: 1000 * 60 * 30,
    retry: (failureCount, err: Error) => {
      if (err.message.includes("429") || err.message.includes("404")) {
        return false;
      }
      return failureCount < 2;
    },
    meta: {
      onError: (err: Error) => {
        // Toast is still good for more detailed background errors
        toast.error(`Arbitrage Data Error: ${err.message}`);
      }
    }
  });

  if (error) {
    // Log for debugging, but don't show component or error message in UI
    console.warn(`ArbitrageOpportunities: Not rendering due to data fetching error: ${error.message}`);
    return null; // "Remove" component if there's an error
  }

  const arbitrageOpportunities = data?.tickers && data.tickers.length > 1 
    ? data.tickers
        .map((ticker, index, arr) => {
          const otherTickers = arr.filter((_, i) => i !== index);
          let bestOpportunity = null;
          for (const other of otherTickers) {
            if (ticker.last < other.last) { // Potential to buy on 'ticker' and sell on 'other'
              const diff = other.last - ticker.last;
              const percentage = (diff / ticker.last) * 100;
              if (!bestOpportunity || percentage > bestOpportunity.percentage) {
                bestOpportunity = {
                  buyExchange: ticker.market.name,
                  buyPrice: ticker.last,
                  sellExchange: other.market.name,
                  sellPrice: other.last,
                  profit: diff,
                  percentage,
                  buyUrl: ticker.trade_url,
                  sellUrl: other.trade_url,
                };
              }
            }
          }
          return bestOpportunity;
        })
        .filter(op => op !== null && op.percentage > 0.5) // Show if > 0.5% raw difference
        .sort((a, b) => b!.percentage - a!.percentage)
        .slice(0, 5) // Show top 5 opportunities
    : [];


  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <GitCompareArrows className="w-6 h-6 mr-2 text-cyan-400" />
          Simplified Arbitrage Finder (Bitcoin)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-center py-4">Loading arbitrage data for Bitcoin...</p>}
        {/* Error display is removed as per request; component returns null on error */}
        {!isLoading && data && (
          <>
            <p className="text-muted-foreground mb-4 text-sm">
              Potential raw price differences for Bitcoin across exchanges. Does not account for fees, slippage, or transfer times.
            </p>
            {arbitrageOpportunities && arbitrageOpportunities.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Buy On</TableHead>
                    <TableHead className="text-right">Buy Price</TableHead>
                    <TableHead>Sell On</TableHead>
                    <TableHead className="text-right">Sell Price</TableHead>
                    <TableHead className="text-right">Raw Diff (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {arbitrageOpportunities.map((op, index) => op && (
                    <TableRow key={index}>
                      <TableCell>
                        {op.buyUrl ? <a href={op.buyUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">{op.buyExchange}</a> : op.buyExchange}
                      </TableCell>
                      <TableCell className="text-right text-green-400">${op.buyPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        {op.sellUrl ? <a href={op.sellUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">{op.sellExchange}</a> : op.sellExchange}
                      </TableCell>
                      <TableCell className="text-right text-red-400">${op.sellPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right font-semibold">
                        <TrendingUp className="inline w-4 h-4 mr-1 text-green-500" />
                        {op.percentage.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-4">No significant raw price differences (&gt;0.5%) found for Bitcoin among top volume exchanges with green trust scores at the moment.</p>
            )}
            <div className="text-xs text-muted-foreground mt-3 flex items-center">
              <Info className="w-3 h-3 mr-1" />
              <span>Data from CoinGecko. For informational purposes only. Prices may be delayed. Trust scores indicate CoinGecko's assessment of exchange liquidity and legitimacy.</span>
            </div>
          </>
        )}
         {!isLoading && !data && !error && ( 
          <p className="text-muted-foreground text-center py-4">No arbitrage data available at the moment.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ArbitrageOpportunities;
