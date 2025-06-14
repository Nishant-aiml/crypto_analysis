
import { Building2 } from 'lucide-react'; // Removed BarChart3, DollarSign
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

// Define type for individual exchange, consistent with useAnalyticsData
interface Exchange {
  id: string;
  name: string;
  image: string;
  trust_score: number;
  trade_volume_24h_btc: number;
}

interface ExchangeAnalysisProps {
  exchanges?: Exchange[];
  isLoading: boolean;
  error?: Error | null;
}

const ExchangeAnalysis: React.FC<ExchangeAnalysisProps> = ({ exchanges, isLoading, error }) => {
  if (isLoading) {
    return <div className="glass-card p-6 rounded-lg animate-pulse">Loading exchange data...</div>;
  }
  
  if (error) {
    return <div className="glass-card p-6 rounded-lg text-red-400">Error loading exchange data: {error.message}</div>;
  }

  if (!exchanges || exchanges.length === 0) {
    return <div className="glass-card p-6 rounded-lg text-muted-foreground">No exchange data available.</div>;
  }

  const exchangeVolumeData = exchanges?.slice(0, 8).map((exchange: Exchange) => ({
    name: exchange.name.substring(0, 10), // Keep abbreviation for chart
    volume: exchange.trade_volume_24h_btc,
    trustScore: exchange.trust_score, // Keep if used in tooltip or elsewhere
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
        {exchanges?.slice(0, 4).map((exchange: Exchange) => (
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

