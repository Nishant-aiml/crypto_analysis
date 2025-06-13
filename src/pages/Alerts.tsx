
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2, Bell, TrendingUp, TrendingDown } from 'lucide-react';
import Navigation from '@/components/Navigation';

interface PriceAlert {
  id: string;
  coinId: string;
  symbol: string;
  name: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  image: string;
}

const fetchTopCoins = async () => {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1'
  );
  return response.json();
};

const fetchCoinPrices = async (coinIds: string[]) => {
  if (coinIds.length === 0) return {};
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd`
  );
  return response.json();
};

const Alerts = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [selectedCoin, setSelectedCoin] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [triggeredAlerts, setTriggeredAlerts] = useState<string[]>([]);

  const { data: topCoins } = useQuery({
    queryKey: ['topCoins'],
    queryFn: fetchTopCoins,
  });

  const coinIds = alerts.map(alert => alert.coinId);
  const { data: currentPrices } = useQuery({
    queryKey: ['alertPrices', coinIds],
    queryFn: () => fetchCoinPrices(coinIds),
    enabled: coinIds.length > 0,
    refetchInterval: 30000,
  });

  useEffect(() => {
    const savedAlerts = localStorage.getItem('cryptoAlerts');
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cryptoAlerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    if (!currentPrices) return;

    alerts.forEach(alert => {
      if (!alert.isActive) return;
      
      const currentPrice = currentPrices[alert.coinId]?.usd;
      if (!currentPrice) return;

      const shouldTrigger = 
        (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
        (alert.condition === 'below' && currentPrice <= alert.targetPrice);

      if (shouldTrigger && !triggeredAlerts.includes(alert.id)) {
        // Show browser notification
        if (Notification.permission === 'granted') {
          new Notification(`Price Alert: ${alert.symbol.toUpperCase()}`, {
            body: `${alert.name} is now ${alert.condition} $${alert.targetPrice}. Current price: $${currentPrice.toFixed(2)}`,
            icon: alert.image,
          });
        }

        setTriggeredAlerts(prev => [...prev, alert.id]);
        
        // Deactivate the alert
        setAlerts(prev => prev.map(a => 
          a.id === alert.id ? { ...a, isActive: false } : a
        ));
      }
    });
  }, [currentPrices, alerts, triggeredAlerts]);

  const requestNotificationPermission = async () => {
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const addAlert = () => {
    if (!selectedCoin || !targetPrice) return;
    
    const coin = topCoins?.find((c: any) => c.id === selectedCoin);
    if (!coin) return;

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      coinId: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      targetPrice: parseFloat(targetPrice),
      condition,
      isActive: true,
      image: coin.image,
    };

    setAlerts([...alerts, newAlert]);
    setSelectedCoin('');
    setTargetPrice('');
  };

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
    setTriggeredAlerts(prev => prev.filter(alertId => alertId !== id));
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const getAlertStatus = (alert: PriceAlert) => {
    if (!alert.isActive) return 'Inactive';
    if (triggeredAlerts.includes(alert.id)) return 'Triggered';
    return 'Active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-400';
      case 'Triggered': return 'text-yellow-400';
      case 'Inactive': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <Navigation />
        
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Price Alerts</h1>
          <p className="text-muted-foreground">Set up notifications for cryptocurrency price movements</p>
        </header>

        {/* Notification Status */}
        <div className="glass-card p-4 rounded-lg mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Browser Notifications:</span>
              <span className={`font-medium ${
                Notification.permission === 'granted' ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {Notification.permission === 'granted' ? 'Enabled' : 'Click to enable'}
              </span>
            </div>
            {Notification.permission !== 'granted' && (
              <button
                onClick={requestNotificationPermission}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
              >
                Enable Notifications
              </button>
            )}
          </div>
        </div>

        {/* Add New Alert */}
        <div className="glass-card p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Alert</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as 'above' | 'below')}
              className="bg-secondary border border-border rounded px-3 py-2"
            >
              <option value="above">Price Above</option>
              <option value="below">Price Below</option>
            </select>
            <input
              type="number"
              placeholder="Target Price ($)"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="bg-secondary border border-border rounded px-3 py-2"
              step="0.01"
            />
            <button
              onClick={addAlert}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Alert
            </button>
          </div>
        </div>

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <div className="glass-card rounded-lg overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold">Price Alerts</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/20">
                  <tr>
                    <th className="text-left p-4">Asset</th>
                    <th className="text-center p-4">Condition</th>
                    <th className="text-right p-4">Target Price</th>
                    <th className="text-right p-4">Current Price</th>
                    <th className="text-center p-4">Status</th>
                    <th className="text-center p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert) => {
                    const currentPrice = currentPrices?.[alert.coinId]?.usd || 0;
                    const status = getAlertStatus(alert);
                    
                    return (
                      <tr key={alert.id} className="border-b border-border/50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <img src={alert.image} alt={alert.name} className="w-8 h-8" />
                            <div>
                              <div className="font-medium">{alert.symbol.toUpperCase()}</div>
                              <div className="text-sm text-muted-foreground">{alert.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-center p-4">
                          <div className="flex items-center justify-center">
                            {alert.condition === 'above' ? 
                              <TrendingUp className="w-4 h-4 mr-1 text-green-400" /> : 
                              <TrendingDown className="w-4 h-4 mr-1 text-red-400" />
                            }
                            <span className="capitalize">{alert.condition}</span>
                          </div>
                        </td>
                        <td className="text-right p-4">${alert.targetPrice.toFixed(2)}</td>
                        <td className="text-right p-4">${currentPrice.toFixed(2)}</td>
                        <td className="text-center p-4">
                          <span className={getStatusColor(status)}>{status}</span>
                        </td>
                        <td className="text-center p-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => toggleAlert(alert.id)}
                              className={`px-3 py-1 rounded text-sm ${
                                alert.isActive 
                                  ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
                                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              }`}
                            >
                              {alert.isActive ? 'Pause' : 'Resume'}
                            </button>
                            <button
                              onClick={() => removeAlert(alert.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {alerts.length === 0 && (
          <div className="glass-card p-12 rounded-lg text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No alerts set</h3>
            <p className="text-muted-foreground">Create your first price alert to get notified when cryptocurrencies reach your target prices.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
