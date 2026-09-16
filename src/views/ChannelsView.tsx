import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Tv,
  Radio,
  Sparkles,
  Heart,
  Share2,
  ExternalLink,
  Search,
  Check,
  ShieldCheck,
  Globe,
  SlidersHorizontal,
  ChevronLeft
} from 'lucide-react';
import { IslamicChannel, ChannelCategory } from '../types/channel';
import { channelService } from '../services/channelService';
import { IslamicVideoPlayer } from '../components/channels/IslamicVideoPlayer';
import { ChannelCard } from '../components/channels/ChannelCard';
import { ChannelListSidebar } from '../components/channels/ChannelListSidebar';
import { useUser } from '../context/UserContext';
import { useShareModal } from '../context/ShareContext';

interface ChannelsViewProps {
  initialSlug?: string;
  onNavigate?: (tab: string, contextId?: any) => void;
}

export const ChannelsView: React.FC<ChannelsViewProps> = ({ initialSlug, onNavigate }) => {
  const { user } = useUser();
  const { openShareModal } = useShareModal();

  const [channels, setChannels] = useState<IslamicChannel[]>([]);
  const [categories, setCategories] = useState<ChannelCategory[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<IslamicChannel | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Load data
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [loadedCats, loadedChans, loadedFavs] = await Promise.all([
          channelService.getCategories(),
          channelService.getChannels(),
          channelService.getFavoriteChannelIds(user?.id),
        ]);

        if (!isMounted) return;

        setCategories(loadedCats);
        setChannels(loadedChans);
        setFavoriteIds(loadedFavs);

        // Find initial channel
        if (loadedChans.length > 0) {
          if (initialSlug) {
            const found = loadedChans.find((c) => c.slug === initialSlug || c.id === initialSlug);
            setSelectedChannel(found || loadedChans[0]);
          } else {
            // Pick featured channel or first
            const featured = loadedChans.find((c) => c.isFeatured) || loadedChans[0];
            setSelectedChannel(featured);
          }
        }
      } catch (err) {
        console.error('Failed to load channels data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [initialSlug, user?.id]);

  // Update SEO title and Open Graph metadata when selected channel changes
  useEffect(() => {
    if (selectedChannel) {
      document.title = `${selectedChannel.name} — البث المباشر | وصل الإسلامية`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          selectedChannel.description || `بث مباشر حي لقناة ${selectedChannel.name} عبر منصة وصل الإسلامية بتقنية HLS فائقة الوضوح.`
        );
      }
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', `${selectedChannel.name} — وصل الإسلامية`);
      }
    } else {
      document.title = 'القنوات الإسلامية والبث المباشر — وصل الإسلامية';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          'شاهد القنوات الإسلامية والبث المباشر من مكان واحد: قنوات القرآن الكريم من الحرمين الشريفين، السنة النبوية، والدروس العلمية.'
        );
      }
    }
  }, [selectedChannel]);

  // Channel switching handler (seamless without full page reload)
  const handleSelectChannel = useCallback(
    (channel: IslamicChannel) => {
      if (selectedChannel?.id === channel.id) return;

      channelService.trackChannelEvent('channel_switched', channel.id, channel.name, {
        previousChannel: selectedChannel?.name,
      });

      setSelectedChannel(channel);

      // Update URL without page reload
      if (typeof window !== 'undefined') {
        const newUrl = `/channels/${channel.slug}`;
        if (window.location.pathname !== newUrl) {
          window.history.pushState({ slug: channel.slug }, '', newUrl);
        }
      }
    },
    [selectedChannel]
  );

  // Toggle favorite
  const handleToggleFavorite = async (channel: IslamicChannel) => {
    const isNowFav = await channelService.toggleFavoriteChannel(channel.id, channel, user?.id);
    setFavoriteIds((prev) => (isNowFav ? [...prev, channel.id] : prev.filter((id) => id !== channel.id)));
  };

  // Share channel
  const handleShareChannel = () => {
    if (!selectedChannel) return;
    const url = typeof window !== 'undefined' ? `${window.location.origin}/channels/${selectedChannel.slug}` : '';

    openShareModal({
      type: 'channel' as any,
      title: selectedChannel.name,
      text: selectedChannel.description || 'شاهد البث المباشر للقناة عبر منصة وصل الإسلامية',
      subtext: `التصنيف: ${selectedChannel.categoryName || 'بث مباشر'}`,
      reference: selectedChannel.sourceName || 'وصل الإسلامية',
      sourceUrl: url,
    });
  };

  // Filter channels
  const filteredChannels = useMemo(() => {
    return channels.filter((ch) => {
      // Category filter
      if (selectedCategory === 'favorites') {
        if (!favoriteIds.includes(ch.id)) return false;
      } else if (selectedCategory !== 'all') {
        if (ch.categoryId !== selectedCategory && ch.categorySlug !== selectedCategory) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = ch.name.toLowerCase().includes(q);
        const matchCat = ch.categoryName && ch.categoryName.toLowerCase().includes(q);
        const matchCountry = ch.country && ch.country.toLowerCase().includes(q);
        const matchLang = ch.language && ch.language.toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchCountry && !matchLang) return false;
      }

      return true;
    });
  }, [channels, selectedCategory, favoriteIds, searchQuery]);

  // Related channels (same category excluding selected)
  const relatedChannels = useMemo(() => {
    if (!selectedChannel) return [];
    return channels
      .filter((c) => c.id !== selectedChannel.id && (c.categoryId === selectedChannel.categoryId || c.isFeatured))
      .slice(0, 4);
  }, [channels, selectedChannel]);

  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin" />
        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
          جارٍ تحميل القنوات الإسلامية...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12 font-tajawal">
      {/* 1. Header Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-950 to-teal-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-800/60">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 text-xs font-bold text-emerald-300 border border-emerald-700/60 mb-2">
              <Tv className="w-3.5 h-3.5 text-amber-400" />
              <span>القنوات الإسلامية</span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>بث مباشر</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              القنوات
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 max-w-xl">
              شاهد القنوات الإسلامية والبث المباشر من مكان واحد بأعلى نقاوة وبدون انقطاع.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
              {channels.length} قناة متاحة
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Stage: Player & Sidebar */}
      {selectedChannel ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Video Player & Details (8 Cols on Desktop) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Integrated Video Player */}
            <IslamicVideoPlayer
              channel={selectedChannel}
              isFavorite={favoriteIds.includes(selectedChannel.id)}
              onToggleFavorite={() => handleToggleFavorite(selectedChannel)}
            />

            {/* Channel Details Card */}
            <div className="bg-white dark:bg-emerald-950/80 rounded-3xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/40 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-emerald-900/40">
                <div className="flex items-center gap-3">
                  {selectedChannel.logoUrl && (
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-emerald-900/40 border border-emerald-900/10 dark:border-emerald-700/40 p-1.5 flex items-center justify-center shrink-0">
                      <img
                        src={selectedChannel.logoUrl}
                        alt={selectedChannel.name}
                        className="w-full h-full object-contain rounded-xl"
                      />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                        {selectedChannel.name}
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-[11px] font-bold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        <span>بث مباشر</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">
                        {selectedChannel.categoryName || 'قنوات إسلامية'}
                      </span>
                      {selectedChannel.country && <span>• الدولة: {selectedChannel.country}</span>}
                      {selectedChannel.language && <span>• اللغة: {selectedChannel.language}</span>}
                    </div>
                  </div>
                </div>

                {/* Actions: Favorite & Share */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => handleToggleFavorite(selectedChannel)}
                    className={`h-10 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                      favoriteIds.includes(selectedChannel.id)
                        ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/50 dark:border-rose-900/50 dark:text-rose-400'
                        : 'bg-slate-100 dark:bg-emerald-900/40 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-emerald-900 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${favoriteIds.includes(selectedChannel.id) ? 'fill-current text-rose-500' : ''}`} />
                    <span>{favoriteIds.includes(selectedChannel.id) ? 'في المفضلة' : 'المفضلة'}</span>
                  </button>

                  <button
                    onClick={handleShareChannel}
                    className="h-10 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>مشاركة</span>
                  </button>
                </div>
              </div>

              {/* Description */}
              {selectedChannel.description && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedChannel.description}
                </p>
              )}

              {/* Verified Source Attribution Banner */}
              {selectedChannel.sourceName && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-emerald-900/30 border border-emerald-900/10 dark:border-emerald-800/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>
                      <strong className="font-bold">المصدر الرسمي: </strong>
                      {selectedChannel.sourceName}
                      {selectedChannel.licenseNote && (
                        <span className="text-slate-500 dark:text-slate-400 mr-1.5">
                          ({selectedChannel.licenseNote})
                        </span>
                      )}
                    </span>
                  </div>

                  {selectedChannel.sourceUrl && (
                    <a
                      href={selectedChannel.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1 shrink-0"
                    >
                      <span>زيارة المصدر</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Channel Switcher Sidebar (4 Cols on Desktop) */}
          <div className="lg:col-span-4 h-full">
            <ChannelListSidebar
              channels={channels}
              selectedChannelId={selectedChannel.id}
              onSelectChannel={handleSelectChannel}
            />
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 text-center bg-white dark:bg-emerald-950/40 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/40 p-8">
          <Tv className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            لا توجد قنوات متاحة حالياً
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            يمكن للمشرف إضافة قنوات جديدة أو استيراد قائمة M3U عبر لوحة التحكم.
          </p>
        </div>
      )}

      {/* 3. Category Filter & Search Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-emerald-900/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              استكشف القنوات
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              تصفح القنوات حسب التصنيف أو ابحث عن قناتك المفضلة
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم أو التصنيف..."
              className="w-full h-10 pr-9 pl-3 rounded-xl bg-white dark:bg-emerald-950/70 border border-emerald-900/10 dark:border-emerald-800/50 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-colors shadow-xs"
            />
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {/* All */}
          <button
            onClick={() => setSelectedCategory('all')}
            className={`h-9 px-4 rounded-xl text-xs font-bold shrink-0 transition-all ${
              selectedCategory === 'all'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white dark:bg-emerald-950/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-900/40 border border-emerald-900/10 dark:border-emerald-800/30'
            }`}
          >
            الكل ({channels.length})
          </button>

          {/* Favorites */}
          <button
            onClick={() => setSelectedCategory('favorites')}
            className={`h-9 px-4 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all ${
              selectedCategory === 'favorites'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white dark:bg-emerald-950/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-900/40 border border-emerald-900/10 dark:border-emerald-800/30'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>المفضلة ({favoriteIds.length})</span>
          </button>

          {/* Categories from DB */}
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`h-9 px-4 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white dark:bg-emerald-950/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-900/40 border border-emerald-900/10 dark:border-emerald-800/30'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 pt-2">
          {filteredChannels.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white dark:bg-emerald-950/30 rounded-2xl border border-dashed border-emerald-900/20 p-8">
              لا توجد قنوات مطابقة لهذا التصنيف أو البحث
            </div>
          ) : (
            filteredChannels.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                isSelected={selectedChannel?.id === channel.id}
                isFavorite={favoriteIds.includes(channel.id)}
                onSelect={handleSelectChannel}
                onToggleFavorite={handleToggleFavorite}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
