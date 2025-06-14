
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

interface PortfolioChartsProps {
  pieData: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  performanceData: Array<{
    name: string;
    '24h': number;
    '7d': number;
    pnl: number;
  }>;
}

const COLORS = ['#8989DE', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

const PortfolioCharts = ({ pieData, performanceData }: PortfolioChartsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Portfolio Allocation */}
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
        <h2 className="text-xl font-semibold mb-4">Performance Comparison</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData}>
              <XAxis dataKey="name" stroke="#E6E4DD" fontSize={12} />
              <YAxis stroke="#E6E4DD" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  background: '#3A3935',
                  border: '1px solid #605F5B',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`${value.toFixed(2)}%`, 'P&L %']}
              />
              <Bar dataKey="pnl" fill="#8989DE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCharts;
