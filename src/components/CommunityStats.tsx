import React from 'react';
import { MessageCircle, ThumbsUp, ArrowUp, ArrowDown } from 'lucide-react';
import { CommunityMetrics } from '../types';

interface CommunityStatsProps {
  metrics: CommunityMetrics;
  trend: 'up' | 'down';
}

const MetricItem = ({ label, value, change, icon: Icon }: any) => {
  const isPos = change >= 0;
  const badgeClass = isPos 
    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
    : 'text-red-400 bg-red-500/10 border-red-500/20';

  return (
    <div className="relative overflow-hidden bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-center group hover:bg-white/10 transition-colors">
        <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <Icon className="w-4 h-4" />
                {label}
            </div>
             <div className={`flex items-center px-2 py-0.5 rounded-md border text-[10px] font-bold ${badgeClass}`}>
                {isPos ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                {Math.abs(change)}%
            </div>
        </div>
        <span className="text-4xl font-bold text-white tracking-tight">{value}</span>
    </div>
  );
};

const CommunityStats: React.FC<CommunityStatsProps> = ({ metrics, trend }) => {
  const formatNumber = (num: number) => num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString();

  const borderClass = trend === 'up'
    ? "border-emerald-500/20 hover:border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.05)]"
    : "border-red-500/20 hover:border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.05)]";

  return (
    <div className={`h-full bg-gray-900/30 backdrop-blur-xl rounded-3xl p-6 border transition-all duration-300 flex flex-col ${borderClass}`}>
      <h3 className="text-lg font-semibold text-white mb-4">Community Buzz</h3>
      <div className="flex-1 grid grid-rows-2 gap-3">
          <MetricItem label="Mentions" value={formatNumber(metrics.mentions.count)} change={metrics.mentions.change} icon={MessageCircle} />
          <MetricItem label="Upvotes" value={formatNumber(metrics.upvotes.count)} change={metrics.upvotes.change} icon={ThumbsUp} />
      </div>
    </div>
  );
};

export default CommunityStats;