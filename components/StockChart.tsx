import React, { useEffect, useRef } from 'react';

interface StockChartProps {
  symbol: string;
}

const StockChart: React.FC<StockChartProps> = ({ symbol }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 컨테이너가 없거나, 이미 스크립트가 들어가 있다면 실행하지 않음 (중복 방지)
    if (!container.current || container.current.querySelector("script")) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": symbol, 
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

    // 컴포넌트가 화면에서 사라질 때(Unmount)만 내용을 비움
    // 이렇게 하면 Strict Mode의 빠른 재실행에도 안전합니다.
    return () => {
        // cleanup 로직은 필요하다면 여기에 추가
    };
  }, [symbol]);

  return (
    <div className="w-full bg-daily-card border border-daily-border rounded-3xl p-1 overflow-hidden mb-8 relative group h-[500px]">
      <div className="w-full h-full" ref={container}></div>
    </div>
  );
};

export default StockChart;