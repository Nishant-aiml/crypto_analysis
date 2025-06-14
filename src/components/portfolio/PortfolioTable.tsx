
import { Trash2 } from 'lucide-react';

interface PortfolioItem {
  id: string;
  symbol: string;
  name: string;
  image: string;
  amount: number;
  buyPrice: number;
  currentPrice: number;
  currentValue: number;
  pnl: number;
  pnlPercentage: number;
  change24h: number;
}

interface PortfolioTableProps {
  items: PortfolioItem[];
  onRemoveItem: (id: string) => void;
}

const PortfolioTable = ({ items, onRemoveItem }: PortfolioTableProps) => {
  return (
    <div className="glass-card rounded-lg overflow-hidden">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-semibold">Portfolio Holdings</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary/20">
            <tr>
              <th className="text-left p-4">Asset</th>
              <th className="text-right p-4">Amount</th>
              <th className="text-right p-4">Buy Price</th>
              <th className="text-right p-4">Current Price</th>
              <th className="text-right p-4">Value</th>
              <th className="text-right p-4">P&L</th>
              <th className="text-right p-4">24h Change</th>
              <th className="text-center p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border/50 hover:bg-secondary/10">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <img src={item.image} alt={item.name} className="w-8 h-8 rounded-full" />
                    <div>
                      <div className="font-medium">{item.symbol.toUpperCase()}</div>
                      <div className="text-sm text-muted-foreground">{item.name}</div>
                    </div>
                  </div>
                </td>
                <td className="text-right p-4">{item.amount.toFixed(6)}</td>
                <td className="text-right p-4">${item.buyPrice.toFixed(2)}</td>
                <td className="text-right p-4">${item.currentPrice.toFixed(2)}</td>
                <td className="text-right p-4 font-medium">${item.currentValue.toFixed(2)}</td>
                <td className={`text-right p-4 font-medium ${item.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${item.pnl.toFixed(2)} ({item.pnlPercentage.toFixed(2)}%)
                </td>
                <td className={`text-right p-4 ${item.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {item.change24h.toFixed(2)}%
                </td>
                <td className="text-center p-4">
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortfolioTable;
