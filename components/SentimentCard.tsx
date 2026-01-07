import React from 'react';
import { Smile, Frown, Activity } from 'lucide-react';
import { SentimentData } from '../types';

interface SentimentCardProps {
  sentiment: SentimentData;
}

const SentimentCard: React.FC<SentimentCardProps> = ({ sentiment }) => {
  return (
    <div className="bg-daily-card border border-daily-border rounded-3xl p-6 flex flex-col h-full hover:border-daily-accent/30 transition-colors duration-300 overflow-hidden">
      <div className="mb-2 flex justify-between items-center flex-shrink-0">
        <h3 className="text-lg font-semibold text-white">Sentiment</h3>
        <div className="bg-white/5 p-1.5 rounded-lg flex-shrink-0">
            <Activity className="w-4 h-4 text-daily-accent" />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-8">
        {/* Main Percentage */}
        <div className="flex items-center justify-center relative py-2">
            <svg className="w-48 h-48 transform -rotate-90 flex-shrink-0" viewBox="0 0 128 128">
                <circle
                    className="text-white/5"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                />
                <circle
                    className="text-daily-accent"
                    strokeWidth="8"
                    strokeDasharray={351} // 2 * pi * 56 ≈ 351.8
                    strokeDashoffset={351 - (351 * sentiment.bullishPercent) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                />
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="text-4xl font-bold text-white">{sentiment.bullishPercent}%</span>
                <span className="block text-xs text-daily-muted uppercase mt-1">Bullish</span>
            </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-500/10 rounded-xl p-3 flex items-center gap-2 border border-emerald-500/20 overflow-hidden">
                <Smile className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div className="min-w-0">
                    <span className="block text-[10px] text-emerald-200 truncate">Positive</span>
                    <span className="font-bold text-sm text-white">{sentiment.bullishPercent}%</span>
                </div>
            </div>
            <div className="bg-red-500/10 rounded-xl p-3 flex items-center gap-2 border border-red-500/20 overflow-hidden">
                <Frown className="w-4 h-4 text-red-400 flex-shrink-0" />
                <div className="min-w-0">
                    <span className="block text-[10px] text-red-200 truncate">Negative</span>
                    <span className="font-bold text-sm text-white">{sentiment.bearishPercent}%</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentCard;