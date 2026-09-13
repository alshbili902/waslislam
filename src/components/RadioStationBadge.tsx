import React from 'react';
import { Radio, BookOpen, Compass, Award, Sparkles, Users } from 'lucide-react';

export interface RadioStationBadgeProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isPlaying?: boolean;
  isLoading?: boolean;
  stationName?: string;
  categorySlug?: string;
  type?: 'station' | 'reciter';
  className?: string;
}

export const RadioStationBadge: React.FC<RadioStationBadgeProps> = ({
  size = 'md',
  isPlaying = false,
  isLoading = false,
  stationName = '',
  categorySlug,
  type = 'station',
  className = '',
}) => {
  // Determine appropriate icon based on category, type or name
  const getIcon = () => {
    if (type === 'reciter') {
      return <BookOpen className={getIconSize()} />;
    }

    const name = stationName.toLowerCase();
    const slug = (categorySlug || '').toLowerCase();

    if (slug === 'haramain' || name.includes('حرم') || name.includes('مكة') || name.includes('مدينة')) {
      return <Compass className={getIconSize()} />;
    }
    if (slug === 'murattal' || slug === 'mojawwad' || name.includes('مصحف') || name.includes('قرآن')) {
      return <BookOpen className={getIconSize()} />;
    }
    if (slug === 'rare' || name.includes('نادرة')) {
      return <Award className={getIconSize()} />;
    }
    if (slug === 'reciters' || name.includes('قارئ')) {
      return <Users className={getIconSize()} />;
    }
    return <Radio className={getIconSize()} />;
  };

  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return 'w-11 h-11 rounded-xl';
      case 'lg':
        return 'w-20 h-20 sm:w-24 sm:h-24 rounded-2xl';
      case 'xl':
        return 'w-44 h-44 sm:w-52 sm:h-52 rounded-3xl';
      case 'md':
      default:
        return 'w-14 h-14 rounded-2xl';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-5 h-5';
      case 'lg':
        return 'w-9 h-9 sm:w-11 sm:h-11';
      case 'xl':
        return 'w-20 h-20 sm:w-24 sm:h-24';
      case 'md':
      default:
        return 'w-6 h-6';
    }
  };

  return (
    <div
      className={`relative overflow-hidden shrink-0 flex items-center justify-center select-none shadow-md border transition-all duration-300 ${getDimensions()} ${
        isPlaying
          ? 'bg-gradient-to-br from-emerald-800 via-emerald-950 to-teal-950 border-amber-400/60 shadow-emerald-500/20 shadow-lg'
          : 'bg-gradient-to-br from-emerald-900/90 via-emerald-950 to-slate-950 border-emerald-500/30'
      } ${className}`}
    >
      {/* Subtle Islamic 8-point geometric star watermark */}
      <svg
        className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300 ${
          isPlaying ? 'opacity-15 text-amber-300' : 'opacity-10 text-emerald-300'
        }`}
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <path d="M50 0 L61.8 38.2 L100 50 L61.8 61.8 L50 100 L38.2 61.8 L0 50 L38.2 38.2 Z" opacity="0.6" />
        <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
      </svg>

      {/* Main Center Icon */}
      <div
        className={`relative z-10 flex items-center justify-center transition-transform duration-300 ${
          isPlaying ? 'text-amber-300 scale-105' : 'text-emerald-200'
        }`}
      >
        {isLoading ? (
          <div className="border-2 border-amber-400 border-t-transparent rounded-full animate-spin w-5 h-5" />
        ) : (
          getIcon()
        )}
      </div>

      {/* Programmatic Soundwave Equalizer Bars (Visible only when playing) */}
      {isPlaying && !isLoading && (
        <div className="absolute inset-x-0 bottom-1 sm:bottom-1.5 flex items-end justify-center gap-0.5 sm:gap-1 z-20 pointer-events-none">
          {size === 'sm' ? (
            <>
              <span className="w-0.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
              <span className="w-0.5 h-4 bg-emerald-400 rounded-full animate-pulse [animation-delay:150ms]" />
              <span className="w-0.5 h-2 bg-amber-400 rounded-full animate-pulse [animation-delay:300ms]" />
            </>
          ) : size === 'md' ? (
            <>
              <span className="w-0.5 h-3 bg-amber-400 rounded-full animate-pulse" />
              <span className="w-0.5 h-4.5 bg-emerald-300 rounded-full animate-pulse [animation-delay:120ms]" />
              <span className="w-0.5 h-2.5 bg-amber-400 rounded-full animate-pulse [animation-delay:240ms]" />
              <span className="w-0.5 h-4 bg-emerald-300 rounded-full animate-pulse [animation-delay:360ms]" />
            </>
          ) : size === 'lg' ? (
            <>
              <span className="w-1 h-4 bg-amber-400 rounded-full animate-pulse" />
              <span className="w-1 h-6 bg-emerald-300 rounded-full animate-pulse [animation-delay:100ms]" />
              <span className="w-1 h-8 bg-amber-300 rounded-full animate-pulse [animation-delay:200ms]" />
              <span className="w-1 h-5 bg-emerald-300 rounded-full animate-pulse [animation-delay:300ms]" />
              <span className="w-1 h-3 bg-amber-400 rounded-full animate-pulse [animation-delay:400ms]" />
            </>
          ) : (
            /* size === 'xl' */
            <div className="h-10 sm:h-12 w-full px-6 flex items-end justify-center gap-1.5 bg-gradient-to-t from-black/60 to-transparent pb-1">
              {[35, 75, 45, 90, 60, 85, 40, 70, 95, 50, 65, 80].map((h, i) => (
                <span
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`w-1 rounded-full animate-pulse ${
                    i % 2 === 0 ? 'bg-amber-400' : 'bg-emerald-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subtle active border glow */}
      {isPlaying && (
        <span className="absolute inset-0 rounded-[inherit] ring-1 ring-amber-400/40 pointer-events-none" />
      )}
    </div>
  );
};
