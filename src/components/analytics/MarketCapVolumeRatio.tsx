
import { Ratio } from 'lucide-react';
import React from 'react'; // Ensure React is imported for FC

interface MarketCapVolumeRatioProps {
  marketData: any[];
}

interface CoinRatioData {
  id: string;
  name: string;
  symbol: string;
  image: string;
  marketCap: number;
  volume: number;
  ratio: number | null;
}

const MarketCapVolumeRatio: React.FC<MarketCapVolumeRatioProps> = ({ marketData }) => {
  const ratioData: CoinRatioData[] = marketData.slice(0, 10).map(coin => {
    const marketCap = coin.market_cap;
    const volume = coin.total_volume;
    const ratio = volume > 0 && marketCap > 0 ? marketCap / volume : null;
    return {
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      image: coin.image,
      marketCap,
      volume,
      ratio,
    };
  }).sort((a, b) => (a.ratio ?? Infinity) - (b.ratio ?? Infinity));

  return (
    <div className="glass-card p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Ratio className="w-5 h-5 mr-2 text-purple-400" />
        Market Cap to Volume Ratio (Top 10)
      </h2>
      <div className="space-y-3">
        {ratioData.map(coin => (
          <div key={coin.id} className="p-3 bg-secondary/20 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={coin.image} alt={coin.name} className="w-7 h-7" />
              <div>
                <div className="font-medium">{coin.symbol}</div>
                <div className="text-xs text-muted-foreground">{coin.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">
                {coin.ratio !== null ? coin.ratio.toFixed(2) : 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground">
                MCap: ${(coin.marketCap / 1e9).toFixed(2)}B / Vol: ${(coin.volume / 1e6).toFixed(2)}M
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        A lower ratio may indicate higher liquidity or speculative interest relative to market size. Very high ratios might suggest lower liquidity or less trading activity.
      </p>
    </div>
  );
};

export default MarketCapVolumeRatio;
