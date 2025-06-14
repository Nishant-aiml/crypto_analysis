
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity } from 'lucide-react';

interface CorrelationData {
  name: string;
  symbol: string;
  correlation: number;
}

interface VolatilityData {
  name: string; // Symbol
  volatility: number;
  price: number;
}

interface CorrelationVolatilityProps {
  correlationData: CorrelationData[];
  volatilityData: VolatilityData[];
}

const CorrelationVolatility: React.FC<CorrelationVolatilityProps> = ({ correlationData, volatilityData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <div className="glass-card p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Bitcoin Correlation Analysis</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={correlationData}>
              <XAxis dataKey="symbol" stroke="#E6E4DD" fontSize={12} />
              <YAxis stroke="#E6E4DD" fontSize={12} domain={[-1, 1]} />
              <Tooltip 
                contentStyle={{ 
                  background: '#3A3935',
                  border: '1px solid #605F5B',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#E6E4DD' }}
              />
              <Bar dataKey="correlation" fill="#8989DE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Correlation with Bitcoin (1 = perfect positive, -1 = perfect negative)
        </p>
      </div>

      <div className="glass-card p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Volatility Index (7-day)
        </h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volatilityData}>
              <XAxis dataKey="name" stroke="#E6E4DD" fontSize={12} />
              <YAxis stroke="#E6E4DD" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  background: '#3A3935',
                  border: '1px solid #605F5B',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#E6E4DD' }}
                formatter={(value: number) => [`${value.toFixed(2)}%`, 'Volatility']}
              />
              <Bar dataKey="volatility" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Higher values indicate more price volatility
        </p>
      </div>
    </div>
  );
};

export default CorrelationVolatility;
