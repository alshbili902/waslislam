import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { RadioCategory, RadioReciter, RadioStation } from '../types';
import { radioService } from '../services/radioService';

interface RadioContextType {
  currentStation: RadioStation | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  volume: number;
  isMuted: boolean;
  elapsedSeconds: number;
  favorites: string[];
  recentlyPlayed: RadioStation[];
  isFullPlayerOpen: boolean;
  stations: RadioStation[];
  categories: RadioCategory[];
  reciters: RadioReciter[];
  playStation: (station: RadioStation) => void;
  togglePlay: () => void;
  stop: () => void;
  setVolume: (level: number) => void;
  toggleMute: () => void;
  toggleFavorite: (stationId: string) => Promise<void>;
  retryPlayback: () => void;
  setIsFullPlayerOpen: (open: boolean) => void;
  refreshData: () => Promise<void>;
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

export const RadioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolumeState] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyPlayedIds, setRecentlyPlayedIds] = useState<string[]>([]);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);

  const [stations, setStations] = useState<RadioStation[]>([]);
  const [categories, setCategories] = useState<RadioCategory[]>([]);
  const [reciters, setReciters] = useState<RadioReciter[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);

  // Load initial data
  const refreshData = async () => {
    try {
      const [stList, catList, recList, favList] = await Promise.all([
        radioService.getStations(),
        radioService.getCategories(),
        radioService.getReciters(),
        radioService.getFavorites(),
      ]);
      setStations(stList);
      setCategories(catList);
      setReciters(recList);
      setFavorites(favList);
      setRecentlyPlayedIds(radioService.getRecentHistory());
    } catch (e) {
      console.warn('Error loading radio data:', e);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Initialize single persistent Audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audioRef.current = audio;

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
      setError(null);
    };

    const handlePause = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };

    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      setError('تعذر تشغيل الإذاعة حالياً');
    };

    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Live timer tick when playing
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  // Update MediaSession for lock screen & notifications
  useEffect(() => {
    if (!currentStation || typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
      return;
    }

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentStation.name,
        artist: currentStation.reciterNameAr || currentStation.categoryNameAr || 'إذاعة القرآن الكريم',
        album: 'وصل الإسلامية - إذاعة القرآن الكريم',
        artwork: [
          {
            src: '/brand/logo-icon.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => {
        audioRef.current?.play();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        audioRef.current?.pause();
      });
      navigator.mediaSession.setActionHandler('stop', () => {
        stop();
      });
    } catch (e) {
      console.warn('MediaSession error:', e);
    }
  }, [currentStation]);

  const playStation = (station: RadioStation) => {
    if (!audioRef.current) return;

    // Check if station is marked as stopped or disabled
    if (station.status === 'stopped' || station.status === 'unavailable' || !station.isActive) {
      setError('هذه الإذاعة متوقفة مؤقتاً بأمر الإشراف');
      setCurrentStation(station);
      setIsPlaying(false);
      return;
    }

    setError(null);
    setIsLoading(true);
    setCurrentStation(station);
    setElapsedSeconds(0);

    const audio = audioRef.current;
    audio.pause();
    // Cache buster for live stream connection fresh buffer
    const streamSrc = station.streamUrl.includes('?')
      ? `${station.streamUrl}&t=${Date.now()}`
      : `${station.streamUrl}?t=${Date.now()}`;

    audio.src = streamSrc;
    audio.volume = isMuted ? 0 : volume;

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setIsLoading(false);
        // Record play history
        radioService.recordPlay(station.id);
        setRecentlyPlayedIds(radioService.getRecentHistory());
      })
      .catch((err) => {
        console.warn('Radio audio play failed:', err);
        setIsLoading(false);
        setIsPlaying(false);
        setError('تعذر تشغيل الإذاعة حالياً');
      });
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentStation) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setError(null);
      setIsLoading(true);
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((e) => {
          console.warn('Failed to resume radio:', e);
          setIsLoading(false);
          setIsPlaying(false);
          setError('تعذر تشغيل الإذاعة حالياً');
        });
    }
  };

  const retryPlayback = () => {
    if (currentStation) {
      playStation(currentStation);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsPlaying(false);
    setIsLoading(false);
    setError(null);
    setCurrentStation(null);
    setElapsedSeconds(0);
    setIsFullPlayerOpen(false);
  };

  const setVolume = (level: number) => {
    const clamped = Math.max(0, Math.min(1, level));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : clamped;
    }
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioRef.current.volume = newMuted ? 0 : volume;
  };

  const toggleFavorite = async (stationId: string) => {
    await radioService.toggleFavorite(stationId);
    const updated = await radioService.getFavorites();
    setFavorites(updated);
  };

  // Derive recently played stations from IDs
  const recentlyPlayed = recentlyPlayedIds
    .map((id) => stations.find((s) => s.id === id))
    .filter((s): s is RadioStation => Boolean(s));

  return (
    <RadioContext.Provider
      value={{
        currentStation,
        isPlaying,
        isLoading,
        error,
        volume,
        isMuted,
        elapsedSeconds,
        favorites,
        recentlyPlayed,
        isFullPlayerOpen,
        stations,
        categories,
        reciters,
        playStation,
        togglePlay,
        stop,
        setVolume,
        toggleMute,
        toggleFavorite,
        retryPlayback,
        setIsFullPlayerOpen,
        refreshData,
      }}
    >
      {children}
    </RadioContext.Provider>
  );
};

export function useRadio() {
  const context = useContext(RadioContext);
  if (!context) {
    throw new Error('useRadio must be used within RadioProvider');
  }
  return context;
}
