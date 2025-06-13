
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, BarChart, Bar } from 'recharts';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Percent, Briefcase } from 'lucide-react';
import Navigation from '@/components/Navigation';

interface PortfolioItem {
  id: string;
  coinId: string;
  symbol: string;
  name: string;
  amount: number;
  buyPrice: number;
  image: string;
}

const fetchCoinPrices = async (coinIds: string[]) => {
  if (coinIds.length === 0) return [];
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true&include_7d_change=true`
  );
  return response.json();
};

const fetchTopCoins = async () => {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1'
  );
  return response.json();
};

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [selectedCoin, setSelectedCoin] = useState('');
  const [amount, setAmount] = useState('');
  const [buyPrice, setBuyPrice] = useState('');

  const { data: topCoins } = useQuery({
    queryKey: ['topCoins'],
    queryFn: fetchTopCoins,
  });

  const coinIds = portfolio.map(item => item.coinId);
  const { data: currentPrices } = useQuery({
    queryKey: ['coinPrices', coinIds],
    queryFn: () => fetchCoinPrices(coinIds),
    enabled: coinIds.length > 0,
    refetchInterval: 30000,
  });

  useEffect(() => {
    const savedPortfolio = localStorage.getItem('cryptoPortfolio');
    if (savedPortfolio) {
      setPortfolio(JSON.parse(savedPortfolio));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cryptoPortfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  const addToPortfolio = () => {
    if (!selectedCoin || !amount || !buyPrice) return;
    
    const coin = topCoins?.find((c: any) => c.id === selectedCoin);
    if (!coin) return;

    const newItem: PortfolioItem = {
      id: Date.now().toString(),
      coinId: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      amount: parseFloat(amount),
      buyPrice: parseFloat(buyPrice),
      image: coin.image,
    };

    setPortfolio([...portfolio, newItem]);
    setSelectedCoin('');
    setAmount('');
    setBuyPrice('');
  };

  const removeFromPortfolio = (id: string) => {
    setPortfolio(portfolio.filter(item => item.id !== id));
  };

  const calculatePortfolioStats = () => {
    let totalValue = 0;
    let totalCost = 0;
    let totalPnL = 0;

    const itemsWithData = portfolio.map(item => {
      const currentPrice = currentPrices?.[item.coinId]?.usd || 0;
      const currentValue = item.amount * currentPrice;
      const cost = item.amount * item.buyPrice;
      const pnl = currentValue - cost;
      const pnlPercentage = cost > 0 ? (pnl / cost) * 100 : 0;

      totalValue += currentValue;
      totalCost += cost;
      totalPnL += pnl;

      return {
        ...item,
        currentPrice,
        currentValue,
        cost,
        pnl,
        pnlPercentage,
        change24h: currentPrices?.[item.coinId]?.usd_24h_change || 0,
      };
    });

    const totalPnLPercentage = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

    return {
      items: itemsWithData,
      totalValue,
      totalCost,
      totalPnL,
      totalPnLPercentage,
    };
  };

  const stats = calculatePortfolioStats();

  // Prepare data for pie chart
  const pieData = stats.items.map(item => ({
    name: item.symbol.toUpperCase(),
    value: item.currentValue,
    percentage: (item.currentValue / stats.totalValue) * 100,
  }));

  const COLORS = ['#8989DE', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <Navigation />
        
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Portfolio Tracker</h1>
          <p className="text-muted-foreground">Track your cryptocurrency investments and performance</p>
        </header>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total P&L</p>
                <p className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${stats.totalPnL.toFixed(2)}
                </p>
              </div>
              {stats.totalPnL >= 0 ? 
                <TrendingUp className="w-8 h-8 text-green-400" /> : 
                <TrendingDown className="w-8 h-8 text-red-400" />
              }
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Return</p>
                <p className={`text-2xl font-bold ${stats.totalPnLPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.totalPnLPercentage.toFixed(2)}%
                </p>
              </div>
              <Percent className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Add New Position */}
        <div className="glass-card p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Position</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={selectedCoin}
              onChange={(e) => setSelectedCoin(e.target.value)}
              className="bg-secondary border border-border rounded px-3 py-2"
            >
              <option value="">Select Coin</option>
              {topCoins?.slice(0, 50).map((coin: any) => (
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
            />
            <input
              type="number"
              placeholder="Buy Price ($)"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              className="bg-secondary border border-border rounded px-3 py-2"
            />
            <button
              onClick={addToPortfolio}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Position
            </button>
          </div>
        </div>

        {portfolio.length > 0 && (
          <>
            {/* Allocation Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="glass-card p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Portfolio Allocation</h2>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']}
                        labelFormatter={(label) => `${label}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {pieData.map((item, index) => (
                    <div key={item.name} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm">{item.name}: {item.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Chart */}
              <div className="glass-card p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Position Performance</h2>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.items}>
                      <XAxis dataKey="symbol" stroke="#E6E4DD" fontSize={12} />
                      <YAxis stroke="#E6E4DD" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          background: '#3A3935',
                          border: '1px solid #605F5B',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`${value.toFixed(2)}%`, 'P&L %']}
                      />
                      <Bar dataKey="pnlPercentage" fill="#8989DE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Portfolio Details */}
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
                    {stats.items.map((item) => (
                      <tr key={item.id} className="border-b border-border/50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <img src={item.image} alt={item.name} className="w-8 h-8" />
                            <div>
                              <div className="font-medium">{item.symbol.toUpperCase()}</div>
                              <div className="text-sm text-muted-foreground">{item.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right p-4">{item.amount.toFixed(6)}</td>
                        <td className="text-right p-4">${item.buyPrice.toFixed(2)}</td>
                        <td className="text-right p-4">${item.currentPrice.toFixed(2)}</td>
                        <td className="text-right p-4">${item.currentValue.toFixed(2)}</td>
                        <td className={`text-right p-4 ${item.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${item.pnl.toFixed(2)} ({item.pnlPercentage.toFixed(2)}%)
                        </td>
                        <td className={`text-right p-4 ${item.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {item.change24h.toFixed(2)}%
                        </td>
                        <td className="text-center p-4">
                          <button
                            onClick={() => removeFromPortfolio(item.id)}
                            className="text-red-400 hover:text-red-300"
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
          </>
        )}

        {portfolio.length === 0 && (
          <div className="glass-card p-12 rounded-lg text-center">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No positions yet</h3>
            <p className="text-muted-foreground">Add your first cryptocurrency position to start tracking your portfolio.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
