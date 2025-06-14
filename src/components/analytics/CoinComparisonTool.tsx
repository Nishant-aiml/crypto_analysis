import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Scale, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  ath: number;
  atl: number;
  circulating_supply: number;
  total_supply: number | null;
}

const fetchCoinData = async (coinIds: string[]): Promise<CoinData[]> => {
  if (coinIds.length === 0) return [];
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}&order=market_cap_desc&per_page=10&page=1&sparkline=false`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      let errorText = `Failed to fetch coin data (IDs: ${coinIds.join(',')}), status: ${response.status}`;
      if (response.status === 429) {
        errorText = `API rate limit reached (429) when fetching coin data (IDs: ${coinIds.join(',')}). Please try again later.`;
      } else {
        try {
          // Try to get more specific error details from the response body
          const errorData = await response.json();
          errorText += ` - Details: ${JSON.stringify(errorData)}`;
        } catch (e) {
          // If parsing JSON fails, try to get plain text
          try {
            const textData = await response.text();
            if (textData) {
              errorText += ` - Response: ${textData.substring(0, 100)}${textData.length > 100 ? '...' : ''}`;
            } else {
              errorText += ` (${response.statusText || 'Failed to parse error response body'})`;
            }
          } catch (textError) {
             errorText += ` (${response.statusText || 'Failed to parse error response body and text fallback failed'})`;
          }
        }
      }
      console.error(`Error in fetchCoinData for ${url}: ${errorText}`, { status: response.status, statusText: response.statusText });
      throw new Error(errorText);
    }
    return response.json();
  } catch (error) {
    console.error(`Network or other error in fetchCoinData for ${url}:`, error);
    if (error instanceof Error) {
      // Re-throw the original error if it's already specific, or wrap it
      throw new Error(error.message || `A network error occurred while fetching coin data.`);
    }
    throw new Error(`An unknown error occurred while fetching coin data: ${String(error)}`);
  }
};

const CoinComparisonTool: React.FC = () => {
  const [coin1Id, setCoin1Id] = useState<string>('bitcoin');
  const [coin2Id, setCoin2Id] = useState<string>('ethereum');
  const [submittedCoinIds, setSubmittedCoinIds] = useState<string[]>(['bitcoin', 'ethereum']);

  const { data: coinData, isLoading, error } = useQuery<CoinData[], Error>({
    queryKey: ['compareCoins', submittedCoinIds],
    queryFn: () => fetchCoinData(submittedCoinIds),
    enabled: submittedCoinIds.length === 2 && submittedCoinIds.every(id => id.trim() !== ''),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, err) => {
      // Do not retry on 429 or 404 errors immediately
      if (err.message.includes("429") || err.message.includes("404")) {
        return false;
      }
      return failureCount < 2; // Retry twice for other errors
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (coin1Id.trim() && coin2Id.trim()) {
      setSubmittedCoinIds([coin1Id.trim().toLowerCase(), coin2Id.trim().toLowerCase()]);
    }
  };

  const renderStat = (label: string, value1: any, value2: any, formatFn?: (val: any) => string | JSX.Element) => {
    const formatter = formatFn || ((val) => (val !== undefined && val !== null ? val.toLocaleString() : 'N/A'));
    return (
      <div className="grid grid-cols-3 py-2 border-b border-border/50 text-sm">
        <div className="col-span-1 text-muted-foreground">{label}</div>
        <div className="col-span-1 text-center">{value1 !== undefined && value1 !== null ? formatter(value1) : 'N/A'}</div>
        <div className="col-span-1 text-center">{value2 !== undefined && value2 !== null ? formatter(value2) : 'N/A'}</div>
      </div>
    );
  };
  
  const formatPriceChange = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return (
      <span className={value >= 0 ? 'text-green-400' : 'text-red-400'}>
        {`${value.toFixed(2)}%`}
      </span>
    );
  };

  const coin1 = coinData?.find(c => c.id === submittedCoinIds[0]);
  const coin2 = coinData?.find(c => c.id === submittedCoinIds[1]);

  const errorMessage = error ? (error as Error).message : "";
  const isRateLimitError = errorMessage.includes("429") || errorMessage.toLowerCase().includes("rate limit");

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Scale className="w-6 h-6 mr-2 text-indigo-400" />
          Coin Comparison Tool
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-6 items-end">
          <div className="flex-1">
            <label htmlFor="coin1" className="block text-sm font-medium text-muted-foreground mb-1">Coin 1 ID (e.g., bitcoin)</label>
            <Input id="coin1" value={coin1Id} onChange={(e) => setCoin1Id(e.target.value)} placeholder="Enter coin ID" />
          </div>
          <div className="flex-1">
            <label htmlFor="coin2" className="block text-sm font-medium text-muted-foreground mb-1">Coin 2 ID (e.g., ethereum)</label>
            <Input id="coin2" value={coin2Id} onChange={(e) => setCoin2Id(e.target.value)} placeholder="Enter coin ID" />
          </div>
          <Button type="submit" disabled={isLoading || !coin1Id.trim() || !coin2Id.trim()}>
            {isLoading ? 'Loading...' : 'Compare'}
          </Button>
        </form>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-md text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span className="font-semibold">Error Fetching Data</span>
            </div>
            <p className="text-sm">{errorMessage}</p>
            {isRateLimitError && (
              <p className="text-xs mt-1">
                This may be due to API rate limits. Please wait a moment and try again.
              </p>
            )}
            {!isRateLimitError && (
              <p className="text-xs mt-1">
                Please ensure the coin IDs are correct or try again later.
              </p>
            )}
          </div>
        )}
        
        {!isLoading && !error && coinData && coin1 && coin2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 py-2 font-semibold">
              <div className="col-span-1">Metric</div>
              <div className="col-span-1 text-center flex items-center justify-center">
                <img src={coin1.image} alt={coin1.name} className="w-6 h-6 mr-2" /> {coin1.name} ({coin1.symbol.toUpperCase()})
              </div>
              <div className="col-span-1 text-center flex items-center justify-center">
                <img src={coin2.image} alt={coin2.name} className="w-6 h-6 mr-2" /> {coin2.name} ({coin2.symbol.toUpperCase()})
              </div>
            </div>
            {renderStat('Current Price', coin1.current_price, coin2.current_price, val => `$${val?.toLocaleString()}`)}
            {renderStat('Market Cap', coin1.market_cap, coin2.market_cap, val => `$${val?.toLocaleString()}`)}
            {renderStat('Market Cap Rank', coin1.market_cap_rank, coin2.market_cap_rank)}
            {renderStat('24h Volume', coin1.total_volume, coin2.total_volume, val => `$${val?.toLocaleString()}`)}
            {renderStat('24h Price Change', coin1.price_change_percentage_24h, coin2.price_change_percentage_24h, formatPriceChange)}
            {renderStat('All-Time High (ATH)', coin1.ath, coin2.ath, val => `$${val?.toLocaleString()}`)}
            {renderStat('All-Time Low (ATL)', coin1.atl, coin2.atl, val => `$${val?.toLocaleString()}`)}
            {renderStat('Circulating Supply', coin1.circulating_supply, coin2.circulating_supply, val => val?.toLocaleString())}
            {renderStat('Total Supply', coin1.total_supply, coin2.total_supply, val => val ? val.toLocaleString() : '∞')}
          </div>
        )}
        {!isLoading && !error && coinData && (!coin1 || !coin2) && submittedCoinIds.length === 2 && (
          <div className="text-center py-4 text-muted-foreground">
            Could not find data for one or both coins ({submittedCoinIds.join(', ')}). Please check the IDs.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CoinComparisonTool;
