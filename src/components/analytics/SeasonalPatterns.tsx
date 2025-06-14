
import React from 'react';
import { CalendarDays, BarChartHorizontalBig } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SeasonalPatterns: React.FC = () => {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarDays className="w-6 h-6 mr-2 text-orange-400" />
          Seasonal Pattern Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          This tool would analyze historical price data to identify recurring patterns or trends based on specific times of the year, month, or week (e.g., "September effect", weekend volatility).
        </p>
        <div className="bg-secondary/20 p-4 rounded-md">
          <h4 className="font-medium mb-2 flex items-center">
            <BarChartHorizontalBig className="w-4 h-4 mr-2 text-orange-300" />
            Analysis Focus:
          </h4>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Average monthly/weekly returns.</li>
            <li>Volatility patterns by day of the week.</li>
            <li>Performance around major holidays or events.</li>
            <li>Correlation of patterns across different assets.</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-3">
            Note: Past seasonal performance is not indicative of future results. This analysis provides historical context.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SeasonalPatterns;
