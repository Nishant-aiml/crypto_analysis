
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface RiskAssessmentCoin {
  id: string;
  image: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  riskLevel: string;
  riskColor: string;
}

interface RiskAssessmentProps {
  riskData: RiskAssessmentCoin[];
}

const RiskAssessment: React.FC<RiskAssessmentProps> = ({ riskData }) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: price > 1 ? 2 : 6 });
  };

  return (
    <div className="glass-card p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
        Risk Assessment Matrix
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {riskData.map((coin) => (
          <div key={coin.id} className="p-4 bg-secondary/20 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <img src={coin.image} alt={coin.symbol} className="w-6 h-6" />
              <span className="font-medium">{coin.symbol}</span>
            </div>
            <div className="text-sm space-y-1">
              <div>Price: ${formatPrice(coin.current_price)}</div>
              <div>24h Change: <span className={coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                {coin.price_change_percentage_24h.toFixed(2)}%
              </span></div>
              <div>Risk Level: <span className={coin.riskColor}>{coin.riskLevel}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskAssessment;
