
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const fetchCryptoData = async () => {
  const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const CryptoList = () => {
  const [sortBy, setSortBy] = useState('market_cap_desc');
  const [showCount, setShowCount] = useState(10);
  
  const { data: cryptos, isLoading } = useQuery({
    queryKey: ['cryptos', sortBy],
    queryFn: fetchCryptoData,
    refetchInterval: 30000,
  });

  const sortedCryptos = cryptos?.slice().sort((a, b) => {
    switch (sortBy) {
      case 'price_desc':
        return b.current_price - a.current_price;
      case 'price_asc':
        return a.current_price - b.current_price;
      case 'change_desc':
        return b.price_change_percentage_24h - a.price_change_percentage_24h;
      case 'change_asc':
        return a.price_change_percentage_24h - b.price_change_percentage_24h;
      case 'volume_desc':
        return b.total_volume - a.total_volume;
      default:
        return b.market_cap - a.market_cap;
    }
  }).slice(0, showCount);

  if (isLoading) {
    return <div className="glass-card rounded-lg p-6 animate-pulse">Loading market data...</div>;
  }

  return (
    <div className="glass-card rounded-lg p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Market Overview</h2>
        <div className="flex items-center gap-4">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-secondary border border-muted rounded px-3 py-1 text-sm"
          >
            <option value="market_cap_desc">Market Cap</option>
            <option value="price_desc">Price High-Low</option>
            <option value="price_asc">Price Low-High</option>
            <option value="change_desc">24h Gainers</option>
            <option value="change_asc">24h Losers</option>
            <option value="volume_desc">Volume</option>
          </select>
          <select 
            value={showCount} 
            onChange={(e) => setShowCount(Number(e.target.value))}
            className="bg-secondary border border-muted rounded px-3 py-1 text-sm"
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={15}>Top 15</option>
            <option value={20}>Top 20</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-muted-foreground">
              <th className="pb-4">Rank</th>
              <th className="pb-4">Name</th>
              <th className="pb-4">Price</th>
              <th className="pb-4">1h %</th>
              <th className="pb-4">24h %</th>
              <th className="pb-4">7d %</th>
              <th className="pb-4">Volume</th>
              <th className="pb-4">Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {sortedCryptos?.map((crypto, index) => (
              <tr key={crypto.id} className="border-t border-secondary hover:bg-secondary/20 transition-colors">
                <td className="py-4 text-muted-foreground">#{crypto.market_cap_rank}</td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <img src={crypto.image} alt={crypto.name} className="w-8 h-8 rounded-full" />
                    <div>
                      <p className="font-medium">{crypto.name}</p>
                      <p className="text-sm text-muted-foreground">{crypto.symbol.toUpperCase()}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 font-mono">${crypto.current_price.toLocaleString()}</td>
                <td className="py-4">
                  <span
                    className={`flex items-center gap-1 ${
                      crypto.price_change_percentage_1h_in_currency >= 0 ? "text-success" : "text-warning"
                    }`}
                  >
                    {crypto.price_change_percentage_1h_in_currency >= 0 ? (
                      <ArrowUpIcon className="w-3 h-3" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3" />
                    )}
                    {Math.abs(crypto.price_change_percentage_1h_in_currency || 0).toFixed(2)}%
                  </span>
                </td>
                <td className="py-4">
                  <span
                    className={`flex items-center gap-1 ${
                      crypto.price_change_percentage_24h >= 0 ? "text-success" : "text-warning"
                    }`}
                  >
                    {crypto.price_change_percentage_24h >= 0 ? (
                      <TrendingUpIcon className="w-3 h-3" />
                    ) : (
                      <TrendingDownIcon className="w-3 h-3" />
                    )}
                    {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                  </span>
                </td>
                <td className="py-4">
                  <span
                    className={`flex items-center gap-1 ${
                      crypto.price_change_percentage_7d_in_currency >= 0 ? "text-success" : "text-warning"
                    }`}
                  >
                    {crypto.price_change_percentage_7d_in_currency >= 0 ? (
                      <TrendingUpIcon className="w-3 h-3" />
                    ) : (
                      <TrendingDownIcon className="w-3 h-3" />
                    )}
                    {Math.abs(crypto.price_change_percentage_7d_in_currency || 0).toFixed(2)}%
                  </span>
                </td>
                <td className="py-4">${(crypto.total_volume / 1e9).toFixed(1)}B</td>
                <td className="py-4">${(crypto.market_cap / 1e9).toFixed(1)}B</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CryptoList;
