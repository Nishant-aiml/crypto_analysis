
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Target } from 'lucide-react';

interface PortfolioStatsProps {
  totalValue: number;
  totalPnL: number;
  totalPnLPercentage: number;
  volatility: number;
  diversificationScore: number;
}

const PortfolioStats = ({ 
  totalValue, 
  totalPnL, 
  totalPnLPercentage, 
  volatility, 
  diversificationScore 
}: PortfolioStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
          </div>
          <DollarSign className="w-8 h-8 text-blue-400" />
        </div>
      </div>
      
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total P&L</p>
            <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${totalPnL.toFixed(2)}
            </p>
            <p className={`text-sm ${totalPnLPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnLPercentage.toFixed(2)}%
            </p>
          </div>
          {totalPnL >= 0 ? 
            <TrendingUp className="w-8 h-8 text-green-400" /> : 
            <TrendingDown className="w-8 h-8 text-red-400" />
          }
        </div>
      </div>
      
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Portfolio Risk</p>
            <p className="text-2xl font-bold">{volatility.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground">Volatility</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-yellow-400" />
        </div>
      </div>
      
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Diversification</p>
            <p className="text-2xl font-bold">{diversificationScore.toFixed(0)}</p>
            <p className="text-sm text-muted-foreground">Score</p>
          </div>
          <Target className="w-8 h-8 text-purple-400" />
        </div>
      </div>
    </div>
  );
};

export default PortfolioStats;
