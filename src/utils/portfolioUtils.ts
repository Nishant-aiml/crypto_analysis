
import type { PortfolioItem, PortfolioStats } from '@/types/portfolio';

export const calculatePortfolioStats = (
  portfolio: PortfolioItem[],
  currentPrices: Record<string, { usd: number; usd_24h_change?: number; usd_7d_change?: number }>
): PortfolioStats => {
    let totalValue = 0;
    let totalCost = 0;
    let totalPnL = 0;

    const itemsWithData = portfolio.map(item => {
      const priceData = currentPrices[item.coinId];
      const currentPrice = priceData?.usd || 0;
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
        change24h: priceData?.usd_24h_change || 0,
        change7d: priceData?.usd_7d_change || 0,
      };
    });

    const totalPnLPercentage = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

    const calculateRiskMetrics = () => {
      if (itemsWithData.length === 0) return { sharpeRatio: 0, volatility: 0, diversificationScore: 0 };

      const returns = itemsWithData.map(item => item.change24h || 0);
      const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
      const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
      const volatility = Math.sqrt(variance);

      // Simplified Sharpe Ratio, assuming risk-free rate of 0 for simplicity in this context
      const sharpeRatio = volatility > 0 ? avgReturn / volatility : 0; 

      const allocations = itemsWithData.map(item => item.currentValue / totalValue);
      const herfindahlIndex = allocations.reduce((sum, allocation) => sum + Math.pow(allocation, 2), 0);
      // Ensure diversificationScore is not negative and scaled to 100
      let diversificationScore = 0;
      if (allocations.length > 1) { // HHI is 1 for single asset, leading to 0 diversification
         diversificationScore = Math.max(0, 100 * (1 - herfindahlIndex));
      } else if (allocations.length === 1 && totalValue > 0) {
         diversificationScore = 0; // Single asset means no diversification
      }

      return { sharpeRatio, volatility, diversificationScore };
    };

    const riskMetrics = calculateRiskMetrics();

    return {
      items: itemsWithData,
      totalValue,
      totalCost,
      totalPnL,
      totalPnLPercentage,
      ...riskMetrics,
    };
};
