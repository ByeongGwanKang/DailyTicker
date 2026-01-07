import React from 'react';
import { MessageCircle, ThumbsUp, ArrowUp, ArrowDown } from 'lucide-react';
import { CommunityMetrics } from '../types';

interface CommunityStatsProps {
  metrics: CommunityMetrics;
}

const MetricItem = ({ 
  label, 
  value, 
  change, 
  icon: Icon 
}: { 
  label: string; 
  value: string; 
  change: number; 
  icon: React.ElementType; 
}) => {
  const isPos = change >= 0;
  const absChange = Math.abs(change);
  
  // Badge Styles
  const badgeClass = isPos 
    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
    : 'text-red-400 bg-red-500/10 border-red-500/20';

  return (
    <div className="relative overflow-hidden bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-center group hover:border-white/10 transition-colors">
        {/* Background Gradient Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div className="flex justify-between items-center mb-1 relative z-10">
            <div className="flex items-center gap-2 text-daily-muted text-xs font-bold uppercase tracking-wider">
                <Icon className="w-4 h-4" />
                {label}
            </div>
             <div className={`flex items-center px-2 py-0.5 rounded-md border text-[10px] font-bold ${badgeClass}`}>
                {isPos ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                {absChange}%
            </div>
        </div>

        <div className="relative z-10 mt-1">
             <span className="text-5xl font-bold text-white tracking-tighter leading-none">{value}</span>
        </div>
    </div>
  );
};

const CommunityStats: React.FC<CommunityStatsProps> = ({ metrics }) => {
  const formatNumber = (num: number) => {
    return num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString();
  };

  return (
    <div className="bg-daily-card border border-daily-border rounded-3xl p-6 flex flex-col h-full hover:border-daily-accent/30 transition-colors duration-300">
      <div className="mb-4 flex-shrink-0">
        <h3 className="text-lg font-semibold text-white">Community Buzz</h3>
      </div>

      <div className="flex-1 grid grid-rows-2 gap-3">
          <MetricItem 
              label="Mentions" 
              value={formatNumber(metrics.mentions.count)} 
              change={metrics.mentions.change}
              icon={MessageCircle}
          />
          
          <MetricItem 
              label="Upvotes" 
              value={formatNumber(metrics.upvotes.count)} 
              change={metrics.upvotes.change}
              icon={ThumbsUp}
          />
      </div>
    </div>
  );
};

export default CommunityStats;