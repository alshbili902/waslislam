import React from 'react';
import { motion } from 'motion/react';
import { Play, Heart, Tv, Radio, Sparkles } from 'lucide-react';
import { IslamicChannel } from '../../types/channel';

interface ChannelCardProps {
  channel: IslamicChannel;
  isSelected?: boolean;
  isFavorite?: boolean;
  onSelect: (channel: IslamicChannel) => void;
  onToggleFavorite?: (channel: IslamicChannel) => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  isSelected = false,
  isFavorite = false,
  onSelect,
  onToggleFavorite,
}) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(channel)}
      className={`relative group rounded-2xl p-3 sm:p-4 border transition-all cursor-pointer select-none flex flex-col justify-between ${
        isSelected
          ? 'bg-gradient-to-br from-emerald-50 to-teal-50/70 dark:from-emerald-950/80 dark:to-teal-950/50 border-emerald-500 dark:border-emerald-500 shadow-md'
          : 'bg-white dark:bg-emerald-950/40 hover:bg-slate-50/80 dark:hover:bg-emerald-900/30 border-emerald-900/10 dark:border-emerald-800/40 shadow-xs hover:border-emerald-500/40'
      }`}
    >
      {/* Top Section: Logo & Category & Favorite */}
      <div className="flex items-start justify-between gap-3 mb-3">
        {/* Channel Logo */}
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-100 dark:bg-emerald-900/40 border border-emerald-900/10 dark:border-emerald-700/40 flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-xs">
          {channel.logoUrl ? (
            <img
              src={channel.logoUrl}
              alt={channel.name}
              className="w-full h-full object-contain rounded-lg transition-transform group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <Tv className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          )}

          {/* Playing indicator ring */}
          {isSelected && (
            <span className="absolute inset-0 border-2 border-emerald-500 rounded-xl pointer-events-none" />
          )}
        </div>

        {/* Badges & Favorite */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Live Indicator */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-[10px] font-bold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>بث حي</span>
          </span>

          {/* Favorite Toggle Button */}
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(channel);
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                isFavorite
                  ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/50'
                  : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-emerald-900/50'
              }`}
              title={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Middle Section: Channel Title & Info */}
      <div className="min-w-0 flex-1 mb-3">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-900/50 px-2 py-0.5 rounded-md">
            {channel.categoryName || 'إسلامية'}
          </span>
          {channel.country && (
            <span className="text-[10px] text-slate-400 dark:text-slate-400">
              • {channel.country}
            </span>
          )}
        </div>

        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
          {channel.name}
        </h4>

        {channel.description && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {channel.description}
          </p>
        )}
      </div>

      {/* Bottom Section: Watch CTA */}
      <div className="pt-2 border-t border-slate-100 dark:border-emerald-900/40 flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-400 flex items-center gap-1">
          <Radio className="w-3 h-3 text-emerald-500" />
          <span>HLS مباشر</span>
        </span>

        <button
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            isSelected
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 group-hover:bg-emerald-700 group-hover:text-white'
          }`}
        >
          <Play className="w-3 h-3 fill-current" />
          <span>{isSelected ? 'جارٍ البث' : 'مشاهدة'}</span>
        </button>
      </div>
    </motion.div>
  );
};
