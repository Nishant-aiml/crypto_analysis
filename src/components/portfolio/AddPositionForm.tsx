
import { useState } from 'react';
import { Plus } from 'lucide-react';

interface AddPositionFormProps {
  topCoins: any[];
  onAddPosition: (coinId: string, amount: number, buyPrice: number) => void;
}

const AddPositionForm = ({ topCoins, onAddPosition }: AddPositionFormProps) => {
  const [selectedCoin, setSelectedCoin] = useState('');
  const [amount, setAmount] = useState('');
  const [buyPrice, setBuyPrice] = useState('');

  const handleAddToPortfolio = () => {
    if (!selectedCoin || !amount || !buyPrice) return;
    
    onAddPosition(selectedCoin, parseFloat(amount), parseFloat(buyPrice));
    setSelectedCoin('');
    setAmount('');
    setBuyPrice('');
  };

  return (
    <div className="glass-card p-6 rounded-lg mb-8">
      <h2 className="text-xl font-semibold mb-4">Add New Position</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          value={selectedCoin}
          onChange={(e) => setSelectedCoin(e.target.value)}
          className="bg-secondary border border-border rounded px-3 py-2"
        >
          <option value="">Select Coin</option>
          {topCoins.slice(0, 50).map((coin: any) => (
            <option key={coin.id} value={coin.id}>
              {coin.name} ({coin.symbol.toUpperCase()})
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-secondary border border-border rounded px-3 py-2"
          step="any"
        />
        <input
          type="number"
          placeholder="Buy Price ($)"
          value={buyPrice}
          onChange={(e) => setBuyPrice(e.target.value)}
          className="bg-secondary border border-border rounded px-3 py-2"
          step="any"
        />
        <button
          onClick={handleAddToPortfolio}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Position
        </button>
      </div>
    </div>
  );
};

export default AddPositionForm;
