import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Tv,
  PictureInPicture,
  RotateCcw,
  AlertCircle,
  Radio,
  Sparkles,
  Heart,
  Settings,
  Check
} from 'lucide-react';
import { IslamicChannel } from '../../types/channel';
import { channelService } from '../../services/channelService';

interface IslamicVideoPlayerProps {
  channel: IslamicChannel;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onNextChannel?: () => void;
  onPreviousChannel?: () => void;
}

export const IslamicVideoPlayer: React.FC<IslamicVideoPlayerProps> = ({
  channel,
  isFavorite = false,
  onToggleFavorite,
  onNextChannel,
  onPreviousChannel,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Playback States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('wasl_video_volume');
      return saved ? parseFloat(saved) : 0.8;
    } catch {
      return 0.8;
    }
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quality settings
  const [levels, setLevels] = useState<{ index: number; label: string }[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1); // -1 = Auto
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  // PiP capability
  const [supportsPip, setSupportsPip] = useState(false);

  // Reset controls timer
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSettingsMenu) {
        setShowControls(false);
      }
    }, 3500);
  }, [isPlaying, showSettingsMenu]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      setSupportsPip('pictureInPictureEnabled' in document);
    }
  }, []);

  // Cleanup active HLS instance cleanly
  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      try {
        hlsRef.current.stopLoad();
        hlsRef.current.detachMedia();
        hlsRef.current.destroy();
      } catch (e) {
        console.warn('Error destroying HLS instance:', e);
      }
      hlsRef.current = null;
    }
  }, []);

  // Load and play stream
  const initPlayer = useCallback(() => {
    const video = videoRef.current;
    if (!video || !channel?.streamUrl) return;

    // Reset states
    setIsLoading(true);
    setIsBuffering(false);
    setErrorMessage(null);
    setAutoplayBlocked(false);
    setLevels([]);
    setCurrentLevel(-1);

    destroyHls();

    video.volume = volume;
    video.muted = isMuted;

    const streamUrl = channel.streamUrl;
    channelService.trackChannelEvent('channel_opened', channel.id, channel.name, { streamUrl });

    // 1. Check native HLS support (Safari / iOS)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
            channelService.trackChannelEvent('playback_started', channel.id, channel.name);
          })
          .catch((err) => {
            console.warn('Native video autoplay blocked:', err);
            setAutoplayBlocked(true);
            setIsLoading(false);
          });
      }
    }
    // 2. Use HLS.js for browsers without native HLS support (Chrome, Firefox, Edge, Android)
    else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        capLevelToPlayerSize: true,
      });

      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setIsLoading(false);
        const availableLevels = data.levels.map((lvl, index) => ({
          index,
          label: lvl.height ? `${lvl.height}p` : `${Math.round(lvl.bitrate / 1000)}k`,
        }));
        setLevels(availableLevels);

        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              channelService.trackChannelEvent('playback_started', channel.id, channel.name);
            })
            .catch(() => {
              setAutoplayBlocked(true);
            });
        }
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setCurrentLevel(data.level);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.warn('HLS Error event:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('HLS Network Error, attempting recovery...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('HLS Media Error, attempting recovery...');
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal HLS error, unable to recover');
              destroyHls();
              setIsLoading(false);
              setErrorMessage('تعذر تشغيل القناة حالياً. البث غير متاح مؤقتاً.');
              channelService.trackChannelEvent('playback_error', channel.id, channel.name, { error: data.details });
              break;
          }
        }
      });
    } else {
      // Unsupported browser
      setIsLoading(false);
      setErrorMessage('لا يدعم هذا المتصفح صيغة البث المباشر الحالية.');
    }
  }, [channel, volume, isMuted, destroyHls]);

  // Trigger init on channel change
  useEffect(() => {
    initPlayer();
    return () => {
      destroyHls();
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [initPlayer, destroyHls]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => {
      setIsBuffering(false);
      setIsLoading(false);
    };
    const onError = () => {
      setIsLoading(false);
      setIsBuffering(false);
      setErrorMessage('البث غير متاح مؤقتاً. يرجى إعادة المحاولة.');
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('error', onError);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('error', onError);
    };
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Controls actions
  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      setAutoplayBlocked(false);
      setErrorMessage(null);
      video.play().catch(() => setAutoplayBlocked(true));
    }
  };

  const handleToggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val === 0) {
        videoRef.current.muted = true;
        setIsMuted(true);
      } else if (isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
    try {
      localStorage.setItem('wasl_video_volume', val.toString());
    } catch {}
  };

  const handleToggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (e) {
      console.warn('Fullscreen error:', e);
    }
  };

  const handleTogglePip = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (video.requestPictureInPicture) {
        await video.requestPictureInPicture();
      }
    } catch (e) {
      console.warn('PiP error:', e);
    }
  };

  const handleSelectQuality = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentLevel(levelIndex);
      setShowSettingsMenu(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimer}
      onTouchStart={resetControlsTimer}
      onClick={resetControlsTimer}
      className={`relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-emerald-900/30 dark:border-emerald-500/20 select-none group font-tajawal ${
        isFullscreen ? 'rounded-none border-none' : ''
      }`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        playsInline
        autoPlay
        crossOrigin="anonymous"
        className="w-full h-full object-contain bg-black"
      />

      {/* Buffering Indicator Overlay */}
      {isBuffering && !isLoading && !errorMessage && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-[1px] pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full border-3 border-amber-400/30 border-t-amber-400 animate-spin" />
            <span className="text-xs font-bold text-amber-300 bg-black/60 px-3 py-1 rounded-full">
              جارٍ تحميل البث...
            </span>
          </div>
        </div>
      )}

      {/* Initial Loading State */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gradient-to-br from-[#031c15] via-[#021812] to-black text-white p-6">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-900/60 border border-emerald-600/40 flex items-center justify-center shadow-lg">
              {channel.logoUrl ? (
                <img
                  src={channel.logoUrl}
                  alt={channel.name}
                  className="w-10 h-10 object-contain rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <Tv className="w-8 h-8 text-emerald-400" />
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mb-1 text-center">{channel.name}</h3>
          <p className="text-xs text-emerald-300/80 mb-4 text-center">{channel.categoryName || 'بث مباشر'}</p>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span>جارٍ الاتصال بالبث المباشر...</span>
          </div>
        </div>
      )}

      {/* Autoplay Blocked Overlay */}
      {autoplayBlocked && !errorMessage && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm text-white p-6">
          <button
            onClick={handleTogglePlay}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all mb-3"
          >
            <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
          </button>
          <span className="text-sm sm:text-base font-bold text-white">انقر لبدء تشغيل البث</span>
          <span className="text-xs text-slate-300 mt-1">سياسات المتصفح تتطلب إذناً لتشغيل الصوت</span>
        </div>
      )}

      {/* Error State Overlay */}
      {errorMessage && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md text-white p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-3">
            <AlertCircle className="w-8 h-8 text-rose-400" />
          </div>
          <h4 className="text-base sm:text-lg font-bold text-rose-200 mb-1">تعذر تشغيل البث</h4>
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mb-4">{errorMessage}</p>
          <button
            onClick={initPlayer}
            className="h-10 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة المحاولة</span>
          </button>
        </div>
      )}

      {/* Player Header Overlay (Top Bar) */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 inset-x-0 z-30 p-3 sm:p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-white"
          >
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              {channel.logoUrl && (
                <img
                  src={channel.logoUrl}
                  alt={channel.name}
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-lg bg-white/10 p-0.5 shrink-0"
                />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
                    {channel.name}
                  </h3>
                  {/* Live Status Badge */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>بث مباشر</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-300">
                  <span>{channel.categoryName || 'إسلامية'}</span>
                  {channel.country && <span>• {channel.country}</span>}
                </div>
              </div>
            </div>

            {/* Favorite & Header actions */}
            <div className="flex items-center gap-2 shrink-0">
              {onToggleFavorite && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite();
                  }}
                  className={`p-2 rounded-xl backdrop-blur-md transition-colors ${
                    isFavorite
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  title={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Center Play/Pause Click Handler Overlay */}
      <div
        onClick={handleTogglePlay}
        className="absolute inset-0 z-10 cursor-pointer"
        aria-label="تبديل التشغيل"
      />

      {/* Bottom Controls Bar Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 inset-x-0 z-30 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Controls: Play/Pause, Next/Prev, Volume */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={handleTogglePlay}
                className="p-2 sm:p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
                title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                )}
              </button>

              {/* Volume & Mute */}
              <div className="flex items-center gap-1.5 group/vol">
                <button
                  onClick={handleToggleMute}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white transition-colors"
                  title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-24 h-1.5 accent-emerald-400 bg-white/20 rounded-lg cursor-pointer"
                  title="مستوى الصوت"
                />
              </div>

              {/* Live Badge */}
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>مباشر</span>
              </span>
            </div>

            {/* Right Controls: Quality Menu, PiP, Fullscreen */}
            <div className="flex items-center gap-1.5 sm:gap-2 relative">
              {/* Quality Selector */}
              {levels.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 transition-colors"
                    title="جودة البث"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {currentLevel === -1 ? 'تلقائي' : levels[currentLevel]?.label || 'جودة'}
                    </span>
                  </button>

                  <AnimatePresence>
                    {showSettingsMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: -10 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute bottom-full left-0 mb-2 w-36 bg-slate-900/95 border border-emerald-800/60 rounded-xl shadow-xl p-1.5 text-xs space-y-1 z-40 backdrop-blur-md"
                      >
                        <button
                          onClick={() => handleSelectQuality(-1)}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-right flex items-center justify-between ${
                            currentLevel === -1 ? 'bg-emerald-800 text-white font-bold' : 'hover:bg-white/10 text-slate-300'
                          }`}
                        >
                          <span>تلقائي (Auto)</span>
                          {currentLevel === -1 && <Check className="w-3.5 h-3.5" />}
                        </button>
                        {levels.map((lvl) => (
                          <button
                            key={lvl.index}
                            onClick={() => handleSelectQuality(lvl.index)}
                            className={`w-full px-2.5 py-1.5 rounded-lg text-right flex items-center justify-between ${
                              currentLevel === lvl.index ? 'bg-emerald-800 text-white font-bold' : 'hover:bg-white/10 text-slate-300'
                            }`}
                          >
                            <span>{lvl.label}</span>
                            {currentLevel === lvl.index && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Picture-in-Picture */}
              {supportsPip && (
                <button
                  onClick={handleTogglePip}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="صورة داخل صورة"
                >
                  <PictureInPicture className="w-4 h-4" />
                </button>
              )}

              {/* Fullscreen */}
              <button
                onClick={handleToggleFullscreen}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title={isFullscreen ? 'تصغير' : 'ملء الشاشة'}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
