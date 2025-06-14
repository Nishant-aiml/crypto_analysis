import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, BarChartHorizontalBig, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Cell } from 'recharts';

const TARGET_COIN_ID_SEASONAL = 'bitcoin'; // Focus on Bitcoin

interface HistoricalPrice {
  timestamp: number;
  price: number;
}

interface MonthlyReturn {
  month: string;
  averageReturn: number;
  yearsOfData: number;
}

const fetchHistoricalData = async (coinId: string, days: number = 365 * 2): Promise<HistoricalPrice[]> => { // 2 years of data
  const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`);
  if (!response.ok) {
    throw new Error(`Failed to fetch historical data for ${coinId}`);
  }
  const data = await response.json();
  return data.prices.map((p: [number, number]) => ({ timestamp: p[0], price: p[1] }));
};

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const calculateSeasonalPatterns = (prices: HistoricalPrice[]): MonthlyReturn[] => {
  const monthlyReturnsByMonth: { [month: number]: number[] } = {};

  for (let i = 0; i < monthNames.length; i++) {
    monthlyReturnsByMonth[i] = [];
  }

  // Group prices by month and year to calculate monthly returns
  const pricesByYearMonth: { [yearMonth: string]: number[] } = {};
  prices.forEach(p => {
    const date = new Date(p.timestamp);
    const year = date.getFullYear();
    const month = date.getMonth();
    const yearMonthKey = `${year}-${month}`;
    if (!pricesByYearMonth[yearMonthKey]) {
      pricesByYearMonth[yearMonthKey] = [];
    }
    pricesByYearMonth[yearMonthKey].push(p.price);
  });
  
  Object.values(pricesByYearMonth).forEach(monthPrices => {
    if (monthPrices.length > 1) { // Need at least start and end price for the month
      const startPrice = monthPrices[0];
      const endPrice = monthPrices[monthPrices.length - 1];
      const date = new Date(prices.find(p => p.price === startPrice)!.timestamp); // get date for this month
      const monthIndex = date.getMonth();
      const monthlyReturn = ((endPrice - startPrice) / startPrice) * 100;
      monthlyReturnsByMonth[monthIndex].push(monthlyReturn);
    }
  });

  return monthNames.map((name, index) => {
    const returns = monthlyReturnsByMonth[index];
    const averageReturn = returns.length > 0 ? returns.reduce((sum, r) => sum + r, 0) / returns.length : 0;
    return {
      month: name,
      averageReturn: parseFloat(averageReturn.toFixed(2)), // Ensure it's a number
      yearsOfData: returns.length,
    };
  });
};


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background/80 backdrop-blur-sm p-2 border border-border rounded-md shadow-lg">
        <p className="label font-semibold">{`${label}`}</p>
        <p className={`text-sm ${data.averageReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          Avg. Return: {data.averageReturn.toFixed(2)}%
        </p>
        <p className="text-xs text-muted-foreground">({data.yearsOfData} year(s) data)</p>
      </div>
    );
  }
  return null;
};


const SeasonalPatterns: React.FC = () => {
  const { data: historicalPrices, isLoading, error } = useQuery<HistoricalPrice[]>({
    queryKey: ['historicalDataSeasonal', TARGET_COIN_ID_SEASONAL],
    queryFn: () => fetchHistoricalData(TARGET_COIN_ID_SEASONAL),
    staleTime: 1000 * 60 * 60 * 6, // 6 hours stale time for historical data
    refetchInterval: false, // Disable automatic refetching for historical data
  });

  const seasonalData = historicalPrices ? calculateSeasonalPatterns(historicalPrices) : [];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarDays className="w-6 h-6 mr-2 text-orange-400" />
          Bitcoin Monthly Performance (Avg. Last 2 Years)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Loading seasonal pattern data for Bitcoin...</p>}
        {error && <p className="text-red-500">Error: {(error as Error).message}</p>}
        {!isLoading && !error && seasonalData.length > 0 && (
          <>
            <p className="text-muted-foreground mb-4 text-sm">
              Average historical monthly returns for Bitcoin based on the last 2 years of daily price data.
            </p>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={seasonalData} margin={{ top: 5, right: 0, left: -25, bottom: 5 }}>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => `${value}%`} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(128,128,128,0.1)' }} />
                  <Bar dataKey="averageReturn">
                    {seasonalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.averageReturn >= 0 ? 'hsl(var(--chart-3))' : 'hsl(var(--chart-4))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-muted-foreground mt-3 flex items-center">
              <Info className="w-3 h-3 mr-1" />
              <span>Historical performance is not indicative of future results. Data from CoinGecko.</span>
            </div>
          </>
        )}
         {!isLoading && !error && seasonalData.length === 0 && (
            <p className="text-muted-foreground">Not enough data to calculate seasonal patterns.</p>
         )}
      </CardContent>
    </Card>
  );
};

export default SeasonalPatterns;
