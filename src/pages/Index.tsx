
import GlobalMarketStats from "@/components/GlobalMarketStats";
import CryptoChart from "@/components/CryptoChart";
import PortfolioCard from "@/components/PortfolioCard";
import CryptoList from "@/components/CryptoList";
import FearGreedIndex from "@/components/FearGreedIndex";
import ThemeToggle from "@/components/ThemeToggle";
import Navigation from "@/components/Navigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Crypto Dashboard</h1>
            <p className="text-muted-foreground">Real-time market insights and analytics</p>
          </div>
          <ThemeToggle />
        </header>
        
        <Navigation />
        
        <GlobalMarketStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          <div className="lg:col-span-3">
            <CryptoChart />
          </div>
          <div className="space-y-6">
            <PortfolioCard />
            <FearGreedIndex />
          </div>
        </div>
        
        <CryptoList />
      </div>
    </div>
  );
};

export default Index;
