
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CoinPerformanceData {
  id: string;
  image: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number | null;
}

interface TopPerformersProps {
  topGainers: CoinPerformanceData[];
  topLosers: CoinPerformanceData[];
}

const TopPerformers: React.FC<TopPerformersProps> = ({ topGainers, topLosers }) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: price > 1 ? 2 : 6 });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <div className="glass-card p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
          Top Gainers (24h)
        </h2>
        <div className="space-y-3">
          {topGainers.map((coin) => (
            <div key={coin.id} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
              <div className="flex items-center space-x-3">
                <img src={coin.image} alt={coin.name} className="w-8 h-8" />
                <div>
                  <span className="font-medium">{coin.symbol.toUpperCase()}</span>
                  <div className="text-sm text-muted-foreground">{coin.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">${formatPrice(coin.current_price)}</div>
                <div className="text-green-400">{(coin.price_change_percentage_24h ?? 0).toFixed(2)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <TrendingDown className="w-5 h-5 mr-2 text-red-400" />
          Top Losers (24h)
        </h2>
        <div className="space-y-3">
          {topLosers.map((coin) => (
            <div key={coin.id} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
              <div className="flex items-center space-x-3">
                <img src={coin.image} alt={coin.name} className="w-8 h-8" />
                <div>
                  <span className="font-medium">{coin.symbol.toUpperCase()}</span>
                  <div className="text-sm text-muted-foreground">{coin.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">${formatPrice(coin.current_price)}</div>
                <div className="text-red-400">{(coin.price_change_percentage_24h ?? 0).toFixed(2)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopPerformers;
