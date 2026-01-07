import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { StockData } from '../types';

interface HeroSectionProps {
  stock: StockData;
}

const HeroSection: React.FC<HeroSectionProps> = ({ stock }) => {
  const isPositive = stock.changePercent >= 0;
  
  // Format price and handle potential NaN values strictly for display
  const displayPrice = stock.price > 0 ? stock.price.toFixed(2) : "---";
  
  // Ensure change is a number and not NaN before formatting
  const rawChange = isNaN(stock.changePercent) ? 0 : stock.changePercent;
  const displayChange = stock.price > 0 ? Math.abs(rawChange).toFixed(2) : "0.00";

  return (
    <div className="mb-8 relative overflow-hidden rounded-3xl bg-daily-card border border-daily-border p-8 md:p-12">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-daily-accent/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        
        {/* Left: Identity */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white p-2 shadow-2xl shadow-emerald-900/20 flex items-center justify-center overflow-hidden">
              <img 
                src={stock.logoUrl} 
                alt={`${stock.name} logo`} 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${stock.ticker}&background=0D8ABC&color=fff`;
                }}
              />
            </div>
            <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full border-2 border-daily-card shadow-lg flex items-center gap-1">
              <span>#1</span>
              <span>Trending</span>
            </div>
          </div>
          
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-1">{stock.ticker}</h2>
            <p className="text-lg text-daily-muted font-medium truncate max-w-[200px] md:max-w-md">{stock.name}</p>
            <div className="flex gap-4 mt-3 text-sm text-daily-muted">
                <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5 uppercase tracking-wider text-xs">ApeWisdom Top Pick</span>
            </div>
          </div>
        </div>

        {/* Right: Price Action */}
        <div className="text-left md:text-right">
             <p className="text-sm text-daily-muted uppercase tracking-wider font-semibold mb-1">Current Price</p>
             <div className="flex items-center md:justify-end gap-1 mb-2">
                <span className="text-4xl md:text-6xl font-bold tracking-tighter text-white flex items-start">
                   <span className="text-2xl md:text-3xl mt-2 mr-1 opacity-50">$</span>
                   {displayPrice}
                </span>
             </div>
             <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${isPositive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                 {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                 <span>{isPositive ? '+' : '-'}{displayChange}% Today</span>
             </div>
        </div>
      </div>
      
      {/* Decorative Badge */}
      <div className="absolute top-6 right-6 hidden md:flex items-center gap-2 text-xs font-medium text-daily-muted opacity-50">
        <span>DAILY TICKER PICK</span>
        <div className="w-12 h-[1px] bg-daily-muted"></div>
        <span>{new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default HeroSection;