import React, { useEffect, useRef } from 'react';

interface StockChartProps {
  symbol: string;
}

const StockChart: React.FC<StockChartProps> = ({ symbol }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Clear previous script if any
    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    // TradingView Widget Configuration
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": symbol, // Removed "NASDAQ:" prefix to let TradingView auto-resolve exchange (supports SPY, BTC, etc.)
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "allow_symbol_change": false,
      "calendar": false,
      "support_host": "https://www.tradingview.com",
      "backgroundColor": "rgba(17, 17, 17, 1)",
      "gridColor": "rgba(255, 255, 255, 0.05)",
      "hide_top_toolbar": false,
      "hide_side_toolbar": false,
      "withdateranges": true,
      "hide_volume": false
    });

    container.current.appendChild(script);
  }, [symbol]);

  return (
    <div className="w-full bg-daily-card border border-daily-border rounded-3xl p-1 overflow-hidden mb-8 relative group h-[500px]">
      <div className="w-full h-full" ref={container}></div>
    </div>
  );
};

export default StockChart;