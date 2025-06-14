
import Navigation from '@/components/Navigation';
import PortfolioStats from '@/components/portfolio/PortfolioStats';
import AddPositionForm from '@/components/portfolio/AddPositionForm';
import PortfolioCharts from '@/components/portfolio/PortfolioCharts';
import PortfolioTable from '@/components/portfolio/PortfolioTable';
import EmptyPortfolio from '@/components/portfolio/EmptyPortfolio';
import { usePortfolio } from '@/hooks/usePortfolio';

const Portfolio = () => {
  const {
    portfolio,
    topCoins,
    addToPortfolio,
    removeFromPortfolio,
    calculatePortfolioStats,
  } = usePortfolio();

  const stats = calculatePortfolioStats();

  // Prepare data for pie chart
  const pieData = stats.items.map(item => ({
    name: item.symbol.toUpperCase(),
    value: item.currentValue,
    percentage: stats.totalValue > 0 ? (item.currentValue / stats.totalValue) * 100 : 0,
  }));

  // Performance over time data (simplified)
  const performanceData = stats.items.map((item, index) => ({
    name: item.symbol.toUpperCase(),
    '24h': item.change24h,
    '7d': item.change7d,
    pnl: item.pnlPercentage,
  }));

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Navigation />
        
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Portfolio Tracker</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Track your cryptocurrency investments and performance</p>
        </header>

        {/* Portfolio Overview */}
        <PortfolioStats
          totalValue={stats.totalValue}
          totalPnL={stats.totalPnL}
          totalPnLPercentage={stats.totalPnLPercentage}
          volatility={stats.volatility}
          diversificationScore={stats.diversificationScore}
        />

        {/* Add New Position */}
        <AddPositionForm
          topCoins={topCoins}
          onAddPosition={addToPortfolio}
        />

        {portfolio.length > 0 ? (
          <>
            {/* Charts Section */}
            <PortfolioCharts
              pieData={pieData}
              performanceData={performanceData}
            />

            {/* Portfolio Details Table */}
            <PortfolioTable
              items={stats.items}
              onRemoveItem={removeFromPortfolio}
            />
          </>
        ) : (
          <EmptyPortfolio />
        )}
      </div>
    </div>
  );
};

export default Portfolio;
