import { useQuery } from '@tanstack/react-query';
import { Building2, BarChart3, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const fetchExchanges = async () => {
  const response = await fetch('https://api.coingecko.com/api/v3/exchanges?per_page=10');
  if (!response.ok) throw new Error('Failed to fetch exchange data');
  return response.json();
};

const ExchangeAnalysis = () => {
  const { data: exchanges, isLoading } = useQuery({
    queryKey: ['exchanges'],
    queryFn: fetchExchanges,
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchInterval: 1000 * 60 * 90, // 1.5 hours
  });

  if (isLoading) {
    return <div className="glass-card p-6 rounded-lg animate-pulse">Loading exchange data...</div>;
  }

  const exchangeVolumeData = exchanges?.slice(0, 8).map((exchange: any) => ({
    name: exchange.name.substring(0, 10),
    volume: exchange.trade_volume_24h_btc,
    trustScore: exchange.trust_score,
  })) || [];

  return (
    <div className="glass-card p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Building2 className="w-5 h-5 mr-2 text-blue-400" />
        Exchange Volume Analysis
      </h2>
      <div className="h-[300px] mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={exchangeVolumeData}>
            <XAxis dataKey="name" stroke="#E6E4DD" fontSize={12} />
            <YAxis stroke="#E6E4DD" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                background: '#3A3935',
                border: '1px solid #605F5B',
                borderRadius: '8px'
              }}
              formatter={(value: number) => [`${value.toFixed(0)} BTC`, 'Volume (24h)']}
            />
            <Bar dataKey="volume" fill="#60A5FA" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exchanges?.slice(0, 4).map((exchange: any) => (
          <div key={exchange.id} className="p-3 bg-secondary/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <img src={exchange.image} alt={exchange.name} className="w-8 h-8" />
              <div className="flex-1">
                <div className="font-medium">{exchange.name}</div>
                <div className="text-sm text-muted-foreground">
                  Trust Score: {exchange.trust_score}/10
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {(exchange.trade_volume_24h_btc / 1000).toFixed(1)}K BTC
                </div>
                <div className="text-xs text-muted-foreground">24h Volume</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExchangeAnalysis;
