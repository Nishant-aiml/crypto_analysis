
export interface PortfolioItem {
  id: string;
  coinId: string;
  symbol: string;
  name: string;
  amount: number;
  buyPrice: number;
  image: string;
}

export interface PortfolioItemWithStats extends PortfolioItem {
  currentPrice: number;
  currentValue: number;
  cost: number;
  pnl: number;
  pnlPercentage: number;
  change24h: number;
  change7d: number;
}

export interface PortfolioStats {
    items: PortfolioItemWithStats[];
    totalValue: number;
    totalCost: number;
    totalPnL: number;
    totalPnLPercentage: number;
    sharpeRatio: number;
    volatility: number;
    diversificationScore: number;
}
