import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { StockData } from '../types';

interface HeroSectionProps {
  stock: StockData;
}

const HeroSection: React.FC<HeroSectionProps> = ({ stock }) => {
  const isPositive = stock.changePercent >= 0;
  
  // Format price and handle potential NaN values strictly for display
  const displayPrice = stock.price > 0 ? stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "---";
  
  // Ensure change is a number and not NaN before formatting
  const rawChange = isNaN(stock.changePercent) ? 0 : stock.changePercent;
  const displayChange = stock.price > 0 ? Math.abs(rawChange).toFixed(2) : "0.00";

  // ✨ Glassmorphism Styles based on Trend ✨
  // 상승장이면 에메랄드 빛, 하락장이면 빨간 빛이 감도는 유리 효과
  const containerClass = isPositive
    ? "border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)]"
    : "border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.15)]";

  const trendBlobClass = isPositive ? "bg-emerald-500" : "bg-red-500";

  return (
    <div className={`mb-8 relative overflow-hidden rounded-3xl p-8 md:p-12 border transition-all duration-500 bg-gray-900/30 backdrop-blur-2xl ${containerClass}`}>
      
      {/* Background decoration (Dynamic Color Blob) */}
      <div className={`absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 rounded-full blur-[100px] opacity-20 pointer-events-none ${trendBlobClass}`}></div>
      
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        
        {/* Left: Identity */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/90 backdrop-blur-sm p-2 shadow-2xl shadow-black/20 flex items-center justify-center overflow-hidden">
              <img 
                src={stock.logoUrl} 
                alt={`${stock.name} logo`} 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${stock.ticker}&background=0D8ABC&color=fff`;
                }}
              />
            </div>
            {/* #1 Trending Badge */}
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-2.5 py-1 rounded-full border border-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.5)] flex items-center gap-1 z-20">
              <span>#1</span>
              <span>Trending</span>
            </div>
          </div>
          
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-1 drop-shadow-lg">{stock.ticker}</h2>
            <p className="text-lg text-gray-300 font-medium truncate max-w-[200px] md:max-w-md">{stock.name}</p>
            <div className="flex gap-4 mt-3 text-sm text-gray-400">
                <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10 uppercase tracking-wider text-xs backdrop-blur-md">
                  ApeWisdom Top Pick
                </span>
            </div>
          </div>
        </div>

        {/* Right: Price Action */}
        <div className="text-left md:text-right">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Current Price</p>
              <div className="flex items-center md:justify-end gap-1 mb-2">
                <span className="text-5xl md:text-7xl font-bold tracking-tighter text-white flex items-start drop-shadow-xl">
                    <span className="text-2xl md:text-3xl mt-2 mr-1 opacity-50 font-normal">$</span>
                    {displayPrice}
                </span>
              </div>
              
              {/* Change Pill */}
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border backdrop-blur-md ${isPositive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]'}`}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{isPositive ? '+' : '-'}{displayChange}% Today</span>
              </div>
        </div>
      </div>
      
      {/* Decorative Badge (Top Right) */}
      <div className="absolute top-6 right-6 hidden md:flex items-center gap-3 text-xs font-semibold text-gray-500 opacity-60">
        <span className="tracking-widest">DAILY TICKER PICK</span>
        <div className="w-8 h-[1px] bg-gray-600"></div>
        <span>{new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default HeroSection;