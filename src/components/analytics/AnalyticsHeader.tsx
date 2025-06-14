
import { Brain } from 'lucide-react';
import React from 'react';

const AnalyticsHeader: React.FC = () => {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold mb-2 flex items-center">
        <Brain className="w-8 h-8 mr-3 text-primary" />
        Advanced Crypto Analytics
      </h1>
      <p className="text-muted-foreground">In-depth market intelligence, coin analysis, and predictive insights.</p>
    </header>
  );
};

export default AnalyticsHeader;
