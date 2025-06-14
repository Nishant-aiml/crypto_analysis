
import { useState, useEffect } from 'react';
import { useQuery, QueryKey } from '@tanstack/react-query';
import { Plus, Trash2, Bell, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { toast } from 'sonner';

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

// Using the generic fetcher from usePortfolio (or similar utility) would be ideal
// For now, replicate similar robust fetching logic here
const genericFetchCoinGeckoAlerts = async (url: string, errorMessagePrefix: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      let errorText = `${errorMessagePrefix}, status: ${response.status}`;
      if (response.status === 429) {
        errorText = `API rate limit (429) for ${errorMessagePrefix}. Please try again later.`;
      } else {
        try {
          const errorData = await response.json();
          errorText += ` - Details: ${JSON.stringify(errorData).substring(0, 100)}`;
        } catch (e) {
          try {
            const textData = await response.text();
            errorText += ` - Response: ${textData.substring(0, 100) || '(empty body)'}`;
          } catch (textE) {
            errorText += ` (${response.statusText || 'Failed to parse error response body'})`;
          }
        }
      }
      console.error(`Error in genericFetchCoinGeckoAlerts for ${url}: ${errorText}`);
      throw new Error(errorText);
    }
    return response.json();
  } catch (error) {
    console.error(`Network or other error in genericFetchCoinGeckoAlerts for ${url}:`, error);
     if (error instanceof Error && error.message.includes(errorMessagePrefix.split(" (")[0])) {
        throw error;
    }
    throw new Error(`Network error during ${errorMessagePrefix}: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const fetchTopCoinsForAlerts = async () => {
  const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1';
  return genericFetchCoinGeckoAlerts(url, "fetching top coins for alerts");
};

const fetchCoinPricesForAlerts = async (coinIds: string[]) => {
  if (coinIds.length === 0) return {};
  // Switched from /simple/price to /coins/markets to avoid "Failed to fetch" errors.
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}`;

  const marketData = await genericFetchCoinGeckoAlerts(url, "fetching coin prices for alerts");

  if (!Array.isArray(marketData)) {
    console.error("Expected array from /coins/markets for alerts, got:", marketData);
    return {};
  }

  const prices = marketData.reduce((acc, coin) => {
    acc[coin.id] = {
      usd: coin.current_price,
    };
    return acc;
  }, {} as Record<string, { usd: number }>);

  return prices;
};

const Alerts = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [selectedCoin, setSelectedCoin] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [triggeredAlerts, setTriggeredAlerts] = useState<string[]>([]);

  const { data: topCoins, error: topCoinsError } = useQuery<any[], Error, any[], QueryKey>({
    queryKey: ['topCoinsForAlerts'],
    queryFn: fetchTopCoinsForAlerts,
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchInterval: 1000 * 60 * 45, // 45 minutes
    meta: {
      onError: (err: Error) => {
        toast.error(`Failed to load top coins for alerts: ${err.message}`);
      }
    }
  });

  const coinIdsForPriceFetch = alerts.filter(a => a.isActive).map(alert => alert.coinId);
  const { data: currentPrices, error: currentPricesError } = useQuery<Record<string, { usd: number }>, Error, Record<string, { usd: number }>, QueryKey>({
    queryKey: ['alertCoinPrices', coinIdsForPriceFetch],
    queryFn: () => fetchCoinPricesForAlerts(coinIdsForPriceFetch),
    enabled: coinIdsForPriceFetch.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
    meta: {
      onError: (err: Error) => {
        toast.error(`Failed to load current prices for alerts: ${err.message}`);
      }
    }
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
    if (!currentPrices || currentPricesError) return; // Don't process if no prices or error fetching prices

    alerts.forEach(alert => {
      if (!alert.isActive) return;
      
      const priceInfo = currentPrices[alert.coinId];
      if (!priceInfo || typeof priceInfo.usd !== 'number') return;
      const currentCoinPrice = priceInfo.usd;

      const shouldTrigger = 
        (alert.condition === 'above' && currentCoinPrice >= alert.targetPrice) ||
        (alert.condition === 'below' && currentCoinPrice <= alert.targetPrice);

      if (shouldTrigger && !triggeredAlerts.includes(alert.id)) {
        if (Notification.permission === 'granted') {
          new Notification(`Price Alert: ${alert.symbol.toUpperCase()}`, {
            body: `${alert.name} is now ${alert.condition} $${alert.targetPrice.toLocaleString()}. Current price: $${currentCoinPrice.toLocaleString()}`,
            icon: alert.image,
          });
        }
        toast.info(`🔔 ${alert.name} reached target! Price: $${currentCoinPrice.toLocaleString()}`);
        setTriggeredAlerts(prev => [...prev, alert.id]);
        
        setAlerts(prev => prev.map(a => 
          a.id === alert.id ? { ...a, isActive: false } : a
        ));
      }
    });
  }, [currentPrices, alerts, triggeredAlerts, currentPricesError]);

  const requestNotificationPermission = async () => {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success("Browser notifications enabled!");
      } else {
        toast.warning("Browser notifications not enabled. You might miss alerts.");
      }
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const addAlert = () => {
    if (!selectedCoin || !targetPrice) {
      toast.error("Please select a coin and enter a target price.");
      return;
    }
    if (!topCoins) {
      toast.error("Top coins data is not available yet. Please try again shortly.");
      return;
    }
    
    const coin = topCoins?.find((c: any) => c.id === selectedCoin);
    if (!coin) {
      toast.error("Selected coin not found.");
      return;
    }

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
    toast.success(`Alert set for ${coin.name}`);
    setSelectedCoin('');
    setTargetPrice('');
  };

  const removeAlert = (id: string) => {
    const alertToRemove = alerts.find(alert => alert.id === id);
    setAlerts(alerts.filter(alert => alert.id !== id));
    setTriggeredAlerts(prev => prev.filter(alertId => alertId !== id));
    if (alertToRemove) {
      toast.info(`Alert for ${alertToRemove.name} removed.`);
    }
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => {
      if (alert.id === id) {
        const updatedAlert = { ...alert, isActive: !alert.isActive };
        toast.info(`Alert for ${updatedAlert.name} ${updatedAlert.isActive ? 'resumed' : 'paused'}.`);
        return updatedAlert;
      }
      return alert;
    }));
  };

  const getAlertStatus = (alert: PriceAlert) => {
    if (triggeredAlerts.includes(alert.id) && !alert.isActive) return 'Triggered & Inactive'; // Explicit for clarity
    if (!alert.isActive) return 'Inactive';
    if (triggeredAlerts.includes(alert.id)) return 'Triggered'; // Should ideally not happen if isActive is false after trigger
    return 'Active';
  };

  const getStatusColor = (status: string) => {
    if (status.startsWith('Triggered')) return 'text-yellow-400';
    switch (status) {
      case 'Active': return 'text-green-400';
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
                Notification.permission === 'granted' ? 'text-green-400' : 
                Notification.permission === 'denied' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {Notification.permission.charAt(0).toUpperCase() + Notification.permission.slice(1)}
              </span>
            </div>
            {Notification.permission === 'default' && (
              <button
                onClick={requestNotificationPermission}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
              >
                Enable Notifications
              </button>
            )}
             {Notification.permission === 'denied' && (
              <p className="text-xs text-red-400">Notifications are blocked. Please enable them in your browser settings.</p>
            )}
          </div>
        </div>

        {/* Add New Alert */}
        <div className="glass-card p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Alert</h2>
          {topCoinsError && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive p-3 rounded-md text-sm mb-4">
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              Could not load coins for selection: {topCoinsError.message}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            <select
              value={selectedCoin}
              onChange={(e) => setSelectedCoin(e.target.value)}
              className="bg-secondary border border-border rounded px-3 py-2 h-10"
              disabled={!topCoins || topCoins.length === 0 || !!topCoinsError}
            >
              <option value="">Select Coin</option>
              {topCoins?.slice(0, 100).map((coin: any) => ( // Increased to 100
                <option key={coin.id} value={coin.id}>
                  {coin.name} ({coin.symbol.toUpperCase()})
                </option>
              ))}
            </select>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as 'above' | 'below')}
              className="bg-secondary border border-border rounded px-3 py-2 h-10"
            >
              <option value="above">Price Above</option>
              <option value="below">Price Below</option>
            </select>
            <input
              type="number"
              placeholder="Target Price ($)"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="bg-secondary border border-border rounded px-3 py-2 h-10"
              step="any" // Allow more flexible steps
            />
            <button
              onClick={addAlert}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center h-10 col-span-1 md:col-span-1" // Adjusted span for consistency
              disabled={!topCoins || !!topCoinsError}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Alert
            </button>
            {/* Placeholder for potential error message for form level issues */}
          </div>
        </div>

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <div className="glass-card rounded-lg overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold">My Price Alerts</h2>
            </div>
            {currentPricesError && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive p-3 rounded-md text-sm m-4">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Could not load current prices for alerts: {currentPricesError.message}
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/20">
                  <tr>
                    <th className="text-left p-3 sm:p-4 text-xs sm:text-sm">Asset</th>
                    <th className="text-center p-3 sm:p-4 text-xs sm:text-sm">Condition</th>
                    <th className="text-right p-3 sm:p-4 text-xs sm:text-sm">Target ($)</th>
                    <th className="text-right p-3 sm:p-4 text-xs sm:text-sm">Current ($)</th>
                    <th className="text-center p-3 sm:p-4 text-xs sm:text-sm">Status</th>
                    <th className="text-center p-3 sm:p-4 text-xs sm:text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert) => {
                    const currentPrice = currentPrices?.[alert.coinId]?.usd;
                    const status = getAlertStatus(alert);
                    
                    return (
                      <tr key={alert.id} className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
                        <td className="p-3 sm:p-4">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <img src={alert.image} alt={alert.name} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" />
                            <div>
                              <div className="font-medium text-sm sm:text-base">{alert.symbol.toUpperCase()}</div>
                              <div className="text-xs sm:text-sm text-muted-foreground">{alert.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-center p-3 sm:p-4 text-xs sm:text-sm">
                          <div className="flex items-center justify-center">
                            {alert.condition === 'above' ? 
                              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-green-400" /> : 
                              <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-red-400" />
                            }
                            <span className="capitalize">{alert.condition}</span>
                          </div>
                        </td>
                        <td className="text-right p-3 sm:p-4 text-xs sm:text-sm">${alert.targetPrice.toLocaleString()}</td>
                        <td className={`text-right p-3 sm:p-4 text-xs sm:text-sm ${currentPricesError ? 'text-muted-foreground/50' : ''}`}>
                          {typeof currentPrice === 'number' ? `$${currentPrice.toLocaleString()}` : (currentPricesError ? 'Error' : 'Loading...')}
                        </td>
                        <td className="text-center p-3 sm:p-4 text-xs sm:text-sm">
                          <span className={getStatusColor(status)}>{status}</span>
                        </td>
                        <td className="text-center p-3 sm:p-4">
                          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                            <button
                              onClick={() => toggleAlert(alert.id)}
                              className={`px-2 py-1 sm:px-3 rounded text-xs sm:text-sm ${
                                alert.isActive 
                                  ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
                                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              }`}
                            >
                              {alert.isActive ? 'Pause' : 'Resume'}
                            </button>
                            <button
                              onClick={() => removeAlert(alert.id)}
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Remove Alert"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
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
