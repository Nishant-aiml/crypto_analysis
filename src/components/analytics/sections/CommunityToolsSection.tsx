
import React from 'react';
import CoinComparisonTool from '@/components/analytics/CoinComparisonTool';
import ErrorBoundary from '@/components/ErrorBoundary';

const CommunityToolsSection: React.FC = () => {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-border">Community & Tools</h2>
      <div className="space-y-8">
        <ErrorBoundary fallbackMessage="Could not load Coin Comparison Tool.">
          {/* CoinComparisonTool fetches its own data and is read-only */}
          <CoinComparisonTool />
        </ErrorBoundary>
      </div>
    </section>
  );
};

export default CommunityToolsSection;
