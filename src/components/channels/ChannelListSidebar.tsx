import React, { useState, useMemo } from 'react';
import { Search, Tv, Radio, Play, Check } from 'lucide-react';
import { IslamicChannel } from '../../types/channel';

interface ChannelListSidebarProps {
  channels: IslamicChannel[];
  selectedChannelId?: string;
  onSelectChannel: (channel: IslamicChannel) => void;
}

export const ChannelListSidebar: React.FC<ChannelListSidebarProps> = ({
  channels,
  selectedChannelId,
  onSelectChannel,
}) => {
  const [search, setSearch] = useState('');

  const filteredChannels = useMemo(() => {
    if (!search.trim()) return channels;
    const q = search.trim().toLowerCase();
    return channels.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.categoryName && c.categoryName.toLowerCase().includes(q)) ||
        (c.country && c.country.toLowerCase().includes(q))
    );
  }, [channels, search]);

  return (
    <div className="bg-white dark:bg-emerald-950/70 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/40 p-4 shadow-sm flex flex-col h-full">
      {/* Header & Search */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">قائمة القنوات</h3>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">
            {filteredChannels.length} قناة
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في القنوات..."
            className="w-full h-9 pr-8 pl-3 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-emerald-900/10 dark:border-emerald-800/50 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[480px] lg:max-h-[580px] pr-1 scrollbar-thin scrollbar-thumb-emerald-500/20">
        {filteredChannels.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            لا توجد قنوات مطابقة لبحثك
          </div>
        ) : (
          filteredChannels.map((channel) => {
            const isSelected = channel.id === selectedChannelId;
            return (
              <button
                key={channel.id}
                onClick={() => onSelectChannel(channel)}
                className={`w-full p-2.5 rounded-2xl text-right transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-100 to-teal-50 dark:from-emerald-900/80 dark:to-emerald-950 text-emerald-950 dark:text-white font-bold border border-emerald-500/50 shadow-xs'
                    : 'hover:bg-slate-50 dark:hover:bg-emerald-900/30 text-slate-700 dark:text-slate-200 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Channel Logo */}
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-emerald-900/50 border border-emerald-900/10 dark:border-emerald-700/30 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                    {channel.logoUrl ? (
                      <img
                        src={channel.logoUrl}
                        alt={channel.name}
                        className="w-full h-full object-contain rounded-md"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Tv className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>

                  {/* Channel Meta */}
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold truncate">{channel.name}</h4>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 block truncate">
                      {channel.categoryName || 'إسلامية'}
                    </span>
                  </div>
                </div>

                {/* Right Status Badge */}
                <div className="shrink-0 flex items-center gap-1.5">
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-200/50 dark:bg-emerald-800/60 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>جارٍ العرض</span>
                    </span>
                  ) : (
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 group-hover:text-emerald-600">
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
