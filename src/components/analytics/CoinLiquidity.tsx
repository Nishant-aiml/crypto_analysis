import { useQuery } from '@tanstack/react-query';
import { Droplets, ExternalLink, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface CoinLiquidityProps {
  coinId: string;
  coinName: string;
  coinSymbol: string;
}

const fetchCoinTickers = async (coinId: string) => {
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/tickers?page=1&order=volume_desc&depth=true`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Failed to read error response body (status ${response.status}) for ${coinId} tickers`);
    console.error(`Failed to fetch tickers for ${coinId} from ${url} with status ${response.status}: ${errorText}`, response);
    throw new Error(`Failed to fetch tickers for ${coinId}. Status: ${response.status}. Message: ${errorText}`);
  }
  return response.json();
};

const TrustScoreIndicator: React.FC<{ score: string | null }> = ({ score }) => {
  let color = 'bg-gray-400'; // Default for null or unknown
  if (score === 'green') color = 'bg-green-500';
  else if (score === 'yellow') color = 'bg-yellow-500';
  else if (score === 'red') color = 'bg-red-500';
  return <span className={`inline-block w-3 h-3 rounded-full ${color} mr-1`} title={`Trust Score: ${score || 'N/A'}`}></span>;
};

const CoinLiquidity: React.FC<CoinLiquidityProps> = ({ coinId, coinName, coinSymbol }) => {
  const { data: tickerData, isLoading, error } = useQuery<any, Error>({
    queryKey: ['coinTickers', coinId],
    queryFn: () => fetchCoinTickers(coinId),
    staleTime: 1000 * 60 * 30, 
    refetchInterval: 1000 * 60 * 45, 
    meta: {
      onError: (err: Error) => {
        toast.error(`Error fetching ${coinName} liquidity: ${err.message}`);
      }
    }
  });

  if (isLoading) {
    return <div className="glass-card p-6 rounded-lg animate-pulse">Loading {coinName} liquidity...</div>;
  }
  if (error) { 
    return (
      <div className="glass-card p-6 rounded-lg text-red-400 text-center">
        <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
        <p>Error loading {coinName} liquidity.</p>
        <p className="text-xs mt-1">See toast for more info or try refreshing.</p>
      </div>
    );
  }
  
  if (!tickerData?.tickers) {
     return (
      <div className="glass-card p-6 rounded-lg text-center text-muted-foreground">
        No ticker data available for {coinName}.
      </div>
    );
  }

  const topTickers = tickerData.tickers.slice(0, 5);

  return (
    <div className="glass-card p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Droplets className="w-5 h-5 mr-2 text-teal-400" />
        {coinName} ({coinSymbol.toUpperCase()}) Liquidity
      </h2>
      {topTickers.length > 0 ? (
        <div className="space-y-3">
          {topTickers.map((ticker: any, index: number) => (
            <div key={index} className="p-3 bg-secondary/20 rounded-lg text-sm">
              <div className="flex justify-between items-center mb-1">
                <div className="font-medium flex items-center">
                  <TrustScoreIndicator score={ticker.trust_score} />
                  {ticker.market.name} ({ticker.base}/{ticker.target})
                  {ticker.trade_url && (
                    <a href={ticker.trade_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary/70 hover:text-primary">
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
                <div className="font-mono text-xs">Spread: {(ticker.bid_ask_spread_percentage * 100).toFixed(2)}%</div>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <div>Price: ${ticker.last.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</div>
                <div>Volume (24h): ${ticker.converted_volume.usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
         <p className="text-muted-foreground text-center py-4">No top ticker data to display for {coinName}.</p>
      )}
    </div>
  );
};

export default CoinLiquidity;
