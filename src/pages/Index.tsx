
import GlobalMarketStats from "@/components/GlobalMarketStats";
import CryptoChart from "@/components/CryptoChart";
import PortfolioCard from "@/components/PortfolioCard";
import CryptoList from "@/components/CryptoList";
import FearGreedIndex from "@/components/FearGreedIndex";
import ThemeToggle from "@/components/ThemeToggle";
import Navigation from "@/components/Navigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 text-center sm:text-left">Crypto Dashboard</h1>
            <p className="text-muted-foreground text-sm sm:text-base text-center sm:text-left">Real-time market insights and analytics</p>
          </div>
          <ThemeToggle />
        </header>
        
        <Navigation />
        
        <GlobalMarketStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8 mb-8">
          <div className="lg:col-span-3">
            <CryptoChart />
          </div>
          <div className="space-y-6 md:space-y-8">
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
