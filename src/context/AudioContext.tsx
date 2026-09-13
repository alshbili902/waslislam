import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Ayah, Reciter, SurahMeta } from '../types';
import { RECITERS_LIST, SURAHS_LIST } from '../data/quranMetadata';

interface AudioContextType {
  isPlaying: boolean;
  currentSurah: SurahMeta | null;
  currentAyah: Ayah | null;
  selectedReciter: Reciter;
  progress: number;
  duration: number;
  currentTime: number;
  playAyah: (surah: SurahMeta, ayah: Ayah) => void;
  playSurah: (surah: SurahMeta, ayahs: Ayah[], startIndex?: number) => void;
  togglePlay: () => void;
  seek: (percentage: number) => void;
  stop: () => void;
  setReciter: (reciter: Reciter) => void;
  playNextAyah: () => void;
  playPrevAyah: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSurah, setCurrentSurah] = useState<SurahMeta | null>(null);
  const [currentAyah, setCurrentAyah] = useState<Ayah | null>(null);
  const [ayahPlaylist, setAyahPlaylist] = useState<Ayah[]>([]);
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(RECITERS_LIST[0]);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;

    const onTimeUpdate = () => {
      if (audio.duration) {
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onEnded = () => {
      // Auto-advance to next ayah in playlist
      setPlaylistIndex((prev) => {
        const next = prev + 1;
        if (ayahPlaylist.length > next) {
          const nextAyah = ayahPlaylist[next];
          setCurrentAyah(nextAyah);
          loadAndPlay(nextAyah, selectedReciter);
          return next;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, [ayahPlaylist, selectedReciter]);

  const loadAndPlay = (ayah: Ayah, reciter: Reciter) => {
    if (!audioRef.current) return;
    const url = ayah.audio || `https://cdn.islamic.network/quran/audio/128/${reciter.id}/${ayah.number}.mp3`;
    audioRef.current.src = url;
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch((e) => {
        console.warn('Audio play prevented:', e);
        setIsPlaying(false);
      });
  };

  const playAyah = (surah: SurahMeta, ayah: Ayah) => {
    setCurrentSurah(surah);
    setCurrentAyah(ayah);
    setAyahPlaylist([ayah]);
    setPlaylistIndex(0);
    loadAndPlay(ayah, selectedReciter);
  };

  const playSurah = (surah: SurahMeta, ayahs: Ayah[], startIndex = 0) => {
    if (!ayahs.length) return;
    setCurrentSurah(surah);
    setAyahPlaylist(ayahs);
    setPlaylistIndex(startIndex);
    const startAyah = ayahs[startIndex] || ayahs[0];
    setCurrentAyah(startAyah);
    loadAndPlay(startAyah, selectedReciter);
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentAyah) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(console.warn);
    }
  };

  const seek = (percentage: number) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const time = (percentage / 100) * audioRef.current.duration;
    audioRef.current.currentTime = time;
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentAyah(null);
    setCurrentSurah(null);
  };

  const playNextAyah = () => {
    if (playlistIndex < ayahPlaylist.length - 1) {
      const nextIdx = playlistIndex + 1;
      setPlaylistIndex(nextIdx);
      const nextAyah = ayahPlaylist[nextIdx];
      setCurrentAyah(nextAyah);
      loadAndPlay(nextAyah, selectedReciter);
    }
  };

  const playPrevAyah = () => {
    if (playlistIndex > 0) {
      const prevIdx = playlistIndex - 1;
      setPlaylistIndex(prevIdx);
      const prevAyah = ayahPlaylist[prevIdx];
      setCurrentAyah(prevAyah);
      loadAndPlay(prevAyah, selectedReciter);
    }
  };

  const setReciter = (reciter: Reciter) => {
    setSelectedReciter(reciter);
    if (currentAyah && isPlaying) {
      loadAndPlay(currentAyah, reciter);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        currentSurah,
        currentAyah,
        selectedReciter,
        progress,
        duration,
        currentTime,
        playAyah,
        playSurah,
        togglePlay,
        seek,
        stop,
        setReciter,
        playNextAyah,
        playPrevAyah
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within AudioProvider');
  return context;
}
