import React from 'react';
import { Target, TrendingUp, Minus, TrendingDown } from 'lucide-react';
import { AnalystRating } from '../types';

interface AnalystListProps {
  ratings: AnalystRating[];
}

const AnalystList: React.FC<AnalystListProps> = ({ ratings }) => {
  const getRatingColor = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'buy':
      case 'outperform':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'sell':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'buy':
      case 'outperform':
        return <TrendingUp className="w-3 h-3" />;
      case 'sell':
        return <TrendingDown className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  // Calculate consensus logic based on provided ratings
  const total = ratings.length;
  const positive = ratings.filter(r => ['buy', 'outperform'].includes(r.rating.toLowerCase())).length;
  const neutral = ratings.filter(r => r.rating.toLowerCase() === 'hold').length;
  const negative = ratings.filter(r => r.rating.toLowerCase() === 'sell').length;

  const posPct = total > 0 ? (positive / total) * 100 : 0;
  const neuPct = total > 0 ? (neutral / total) * 100 : 0;
  const negPct = total > 0 ? (negative / total) * 100 : 0;

  let consensusLabel = "Hold";
  if (posPct >= 66) consensusLabel = "Strong Buy";
  else if (posPct > 33) consensusLabel = "Buy";
  else if (negPct > 33) consensusLabel = "Sell";
  else if (negPct >= 66) consensusLabel = "Strong Sell";

  return (
    <div className="bg-daily-card border border-daily-border rounded-3xl p-6 h-full flex flex-col hover:border-daily-accent/30 transition-colors duration-300 overflow-hidden">
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Analyst Ratings</h3>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {ratings.map((analyst) => (
            <div key={analyst.id} className="group p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm text-white">{analyst.firm}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border flex items-center gap-1 ${getRatingColor(analyst.rating)}`}>
                        {getRatingIcon(analyst.rating)}
                        {analyst.rating}
                    </span>
                </div>
                <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2 text-xs text-daily-muted">
                        <Target className="w-3 h-3" />
                        <span>Target: <span className="text-white font-medium">${analyst.targetPrice}</span></span>
                    </div>
                    <span className="text-[10px] text-daily-muted">{analyst.date}</span>
                </div>
            </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="flex justify-between text-xs text-daily-muted">
            <span>Consensus</span>
            <span className="text-white font-medium">{consensusLabel}</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden flex">
            {posPct > 0 && <div className="h-full bg-emerald-500" style={{ width: `${posPct}%` }}></div>}
            {neuPct > 0 && <div className="h-full bg-yellow-500" style={{ width: `${neuPct}%` }}></div>}
            {negPct > 0 && <div className="h-full bg-red-500" style={{ width: `${negPct}%` }}></div>}
        </div>
      </div>
    </div>
  );
};

export default AnalystList;