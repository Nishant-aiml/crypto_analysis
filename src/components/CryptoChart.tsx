
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";

const CryptoChart = () => {
  return (
    <div className="glass-card p-4 sm:p-6 rounded-lg mb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold">Bitcoin Price</h2>
      </div>
      <div className="h-[300px] sm:h-[350px] md:h-[400px] w-full">
        <AdvancedRealTimeChart
          symbol="BINANCE:BTCUSDT"
          theme="dark"
          locale="en"
          autosize
          hide_side_toolbar={false}
          allow_symbol_change={true}
          interval="D"
          toolbar_bg="#141413"
          enable_publishing={false}
          hide_top_toolbar={false}
        />
      </div>
    </div>
  );
};

export default CryptoChart;
