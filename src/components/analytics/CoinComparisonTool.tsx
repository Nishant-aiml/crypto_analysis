import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Scale } from 'lucide-react';
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
      let errorText = `Failed to fetch coin data for comparison (IDs: ${coinIds.join(',')}) with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorText += `: ${JSON.stringify(errorData)}`;
      } catch (e) {
        errorText += ` and failed to parse error response body.`;
      }
      console.error(errorText, response);
      throw new Error(errorText);
    }
    return response.json();
  } catch (error) {
    console.error(`Network or other error fetching coin data for comparison from ${url}:`, error);
    if (error instanceof Error) {
      throw new Error(`Network error fetching coin data for comparison: ${error.message}`);
    }
    throw new Error(`Network error fetching coin data for comparison: ${String(error)}`);
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
    staleTime: 1000 * 60 * 10,
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

        {error && <div className="text-red-500 text-center py-4">Error: {(error as Error).message}. Please ensure IDs are correct or try again later.</div>}
        
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
