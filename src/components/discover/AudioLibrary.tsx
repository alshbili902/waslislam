'use client';

import React, { useState } from 'react';
import { 
  Radio, 
  Volume2, 
  Play, 
  Pause, 
  Headphones, 
  Sparkles, 
  Bookmark, 
  CheckCircle2, 
  Search,
  ExternalLink,
  Layers,
  Music,
  Heart
} from 'lucide-react';
import { RECITERS, Reciter } from '../../data/quranMetadata';
import { RADIO_STATIONS, RadioStation } from '../../data/radioData';
import { AudioTrack } from '../AudioPlayerBar';
import { saveItemToLibrary, isItemSaved, removeItemFromLibrary } from '../../utils/libraryManager';

interface AudioLibraryProps {
  onPlayTrack: (track: AudioTrack) => void;
  selectedReciterId: string;
  onChangeReciter: (id: string) => void;
  isEnglish: boolean;
}

const FEATURED_SURAHS = [
  { number: 1, nameAr: 'الفاتحة', nameEn: 'Al-Fatihah', pad: '001' },
  { number: 18, nameAr: 'الكهف', nameEn: 'Al-Kahf', pad: '018' },
  { number: 36, nameAr: 'يس', nameEn: 'Ya-Sin', pad: '036' },
  { number: 55, nameAr: 'الرحمن', nameEn: 'Ar-Rahman', pad: '055' },
  { number: 56, nameAr: 'الواقعة', nameEn: 'Al-Waqi\'ah', pad: '056' },
  { number: 67, nameAr: 'الملك', nameEn: 'Al-Mulk', pad: '067' },
  { number: 112, nameAr: 'الإخلاص', nameEn: 'Al-Ikhlas', pad: '112' },
  { number: 113, nameAr: 'الفلق', nameEn: 'Al-Falaq', pad: '113' },
  { number: 114, nameAr: 'الناس', nameEn: 'An-Nas', pad: '114' },
];

export const AudioLibrary: React.FC<AudioLibraryProps> = ({
  onPlayTrack,
  selectedReciterId,
  onChangeReciter,
  isEnglish
}) => {
  const [activeTab, setActiveTab] = useState<'reciters' | 'radio' | 'surahs'>('radio');
  const [searchQuery, setSearchQuery] = useState('');

  const currentReciter = RECITERS.find(r => r.id === selectedReciterId) || RECITERS[0];

  const handlePlayRadio = (station: RadioStation) => {
    onPlayTrack({
      id: station.id,
      titleAr: station.nameAr,
      titleEn: station.nameEn,
      subtitleAr: `${station.countryAr} • بث مباشر`,
      subtitleEn: `${station.countryAr} • Live Radio`,
      audioUrl: station.streamUrl,
      isLiveRadio: true,
    });
  };

  const handlePlaySurahAudio = (surah: typeof FEATURED_SURAHS[0], reciter: Reciter) => {
    // Standard EveryAyah surah stream URL format
    const audioUrl = `https://download.quranicaudio.com/quran/${reciter.subfolder.split('_')[0].toLowerCase()}/${surah.pad}.mp3`;
    onPlayTrack({
      id: `surah-${surah.number}-${reciter.id}`,
      titleAr: `سورة ${surah.nameAr}`,
      titleEn: `Surah ${surah.nameEn}`,
      subtitleAr: `بصوت الشيخ ${reciter.nameAr}`,
      subtitleEn: `Recited by ${reciter.nameEn}`,
      audioUrl: audioUrl,
      isLiveRadio: false,
      surahNumber: surah.number,
    });
  };

  const handleSaveToFavorites = (item: { id: string; titleAr: string; titleEn: string; subtitleAr: string }) => {
    if (isItemSaved(item.id)) {
      removeItemFromLibrary(item.id);
    } else {
      saveItemToLibrary({
        id: item.id,
        type: 'audio',
        titleAr: item.titleAr,
        titleEn: item.titleEn,
        contentAr: item.subtitleAr,
        categoryAr: 'المكتبة الصوتية',
        sourceAttribution: 'شبكة الصوتيات الإسلامية المعتمدة',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[var(--emerald-deep)] via-[var(--primary-dark)] to-[#07251a] border border-[var(--border-gold)]/50 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--gold)]/20 border border-[var(--gold)]/40 text-[var(--gold)] text-xs font-bold">
            <Headphones className="w-3.5 h-3.5" />
            <span>{isEnglish ? 'Islamic Audio & Radio Hub' : 'المكتبة الصوتية والإذاعات المباشرة'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-amiri leading-tight">
            {isEnglish ? 'Listen to the Holy Quran and Live Stations' : 'استمع لأعذب التلاوات القرآنية والإذاعات المباشرة'}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 font-tajawal leading-relaxed">
            {isEnglish 
              ? 'High quality, non-stop broadcasts from Cairo, Makkah, and top authorized reciters.' 
              : 'بث حي متواصل لأعرق الإذاعات الإسلامية ومصاحف كاملة بأصوات كبار قراء العالم الإسلامي.'}
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-[var(--border-color)]">
        <button
          onClick={() => setActiveTab('radio')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
            activeTab === 'radio'
              ? 'bg-gradient-to-r from-[var(--emerald-deep)] to-[var(--primary-dark)] text-white border-[var(--border-gold)] shadow-sm'
              : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--gold)]'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>{isEnglish ? 'Live Radio Stations' : 'الإذاعات القرآنية المباشرة'}</span>
        </button>

        <button
          onClick={() => setActiveTab('reciters')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
            activeTab === 'reciters'
              ? 'bg-gradient-to-r from-[var(--emerald-deep)] to-[var(--primary-dark)] text-white border-[var(--border-gold)] shadow-sm'
              : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--gold)]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{isEnglish ? 'Reciters Catalog' : 'دليل القراء المعتمدين'}</span>
        </button>

        <button
          onClick={() => setActiveTab('surahs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
            activeTab === 'surahs'
              ? 'bg-gradient-to-r from-[var(--emerald-deep)] to-[var(--primary-dark)] text-white border-[var(--border-gold)] shadow-sm'
              : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--gold)]'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>{isEnglish ? 'Featured Surahs' : 'تلاوات السور المختارة'}</span>
        </button>
      </div>

      {/* TAB 1: LIVE RADIO */}
      {activeTab === 'radio' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {RADIO_STATIONS.map((station) => (
            <div
              key={station.id}
              className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)] transition-all shadow-sm flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    {isEnglish ? 'LIVE' : 'بث مباشر'}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-bold">
                    {station.countryAr}
                  </span>
                </div>

                <h3 className="text-base font-bold font-amiri text-[var(--text-main)] group-hover:text-[var(--gold)] transition-colors">
                  {isEnglish ? station.nameEn : station.nameAr}
                </h3>

                <p className="text-xs text-[var(--text-muted)] font-tajawal line-clamp-2 leading-relaxed">
                  {station.descriptionAr}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
                <button
                  onClick={() => handlePlayRadio(station)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--emerald-deep)] to-[var(--primary-dark)] text-white text-xs font-bold hover:shadow-md transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isEnglish ? 'Tune In' : 'استماع مباشر'}</span>
                </button>

                <button
                  onClick={() => handleSaveToFavorites({
                    id: station.id,
                    titleAr: station.nameAr,
                    titleEn: station.nameEn,
                    subtitleAr: station.descriptionAr
                  })}
                  className={`p-2 rounded-xl border transition-colors ${
                    isItemSaved(station.id)
                      ? 'bg-[var(--gold-light)] text-[var(--gold)] border-[var(--border-gold)]'
                      : 'border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--bg-card-subtle)]'
                  }`}
                  title={isEnglish ? 'Save to favorites' : 'حفظ في المفضلة'}
                >
                  <Heart className={`w-4 h-4 ${isItemSaved(station.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: RECITERS CATALOG */}
      {activeTab === 'reciters' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {RECITERS.map((reciter) => {
            const isSelected = reciter.id === selectedReciterId;

            return (
              <div
                key={reciter.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'bg-[var(--gold-light)]/20 border-[var(--gold)] shadow-md ring-1 ring-[var(--gold)]'
                    : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-[var(--gold)]/60'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[var(--primary-light)] text-[var(--text-primary)] border border-[var(--border-color)] text-[10px] font-bold">
                      {reciter.style}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[var(--gold)] text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        القارئ المختار
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold font-amiri text-[var(--text-main)]">
                    {isEnglish ? reciter.nameEn : reciter.nameAr}
                  </h3>

                  <p className="text-xs text-[var(--text-muted)] font-mono">
                    {reciter.serverUrl.replace('https://', '')}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
                  <button
                    onClick={() => onChangeReciter(reciter.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[var(--gold)] text-black'
                        : 'border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)]'
                    }`}
                  >
                    {isSelected ? (isEnglish ? 'Active Reciter' : 'مُفعّل للتلاوة') : (isEnglish ? 'Set as Default' : 'اختيار كقارئ افتراضي')}
                  </button>

                  <button
                    onClick={() => handlePlaySurahAudio(FEATURED_SURAHS[0], reciter)}
                    className="p-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                    title={isEnglish ? 'Preview recitation' : 'استماع عينة من الفاتحة'}
                  >
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: FEATURED SURAHS */}
      {activeTab === 'surahs' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)]">
              {isEnglish ? 'Reciter in use:' : 'التلاوة الحالية بصوت:'} <strong className="text-[var(--gold)]">{currentReciter.nameAr}</strong>
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              رواية حفص عن عاصم
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {FEATURED_SURAHS.map((surah) => (
              <div
                key={surah.number}
                className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--gold)] transition-all flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--gold-light)] text-[var(--gold)] font-bold text-xs flex items-center justify-center">
                    {surah.number}
                  </div>
                  <div>
                    <h4 className="text-base font-bold font-amiri text-[var(--text-main)]">
                      سورة {isEnglish ? surah.nameEn : surah.nameAr}
                    </h4>
                    <span className="text-[10px] text-[var(--text-muted)] font-tajawal">
                      {currentReciter.nameAr.split(' ')[0]} {currentReciter.nameAr.split(' ')[1]}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handlePlaySurahAudio(surah, currentReciter)}
                  className="p-2.5 rounded-xl bg-[var(--primary-light)] text-[var(--text-primary)] hover:bg-[var(--gold)] hover:text-black transition-all"
                  aria-label={`Play Surah ${surah.nameAr}`}
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
