
export const calculateCorrelation = (coin1Prices: number[] | undefined, coin2Prices: number[] | undefined): number => {
  if (!coin1Prices || !coin2Prices || coin1Prices.length !== coin2Prices.length || coin1Prices.length === 0) return 0;
  
  const n = coin1Prices.length;
  const sum1 = coin1Prices.reduce((a, b) => a + b, 0);
  const sum2 = coin2Prices.reduce((a, b) => a + b, 0);
  const sum1Sq = coin1Prices.reduce((a, b) => a + b * b, 0);
  const sum2Sq = coin2Prices.reduce((a, b) => a + b * b, 0);
  const pSum = coin1Prices.reduce((a, b, i) => a + b * coin2Prices[i], 0);
  
  const num = pSum - (sum1 * sum2 / n);
  const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));
  
  return den === 0 ? 0 : num / den;
};

export const calculateVolatility = (prices: number[] | undefined): number => {
  if (!prices || prices.length < 2) return 0; // Need at least 2 points for volatility
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  if (mean === 0) return 0; // Avoid division by zero if all prices are zero
  const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
  return (Math.sqrt(variance) / mean) * 100; // Coefficient of variation as percentage
};

