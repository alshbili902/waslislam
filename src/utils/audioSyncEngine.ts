/**
 * Wasl Islamic (وصل الإسلامية) - Synchronized Quran Audio & Reading Engine.
 * Utilizes EveryAyah verified per-Ayah audio streams:
 * Format: https://everyayah.com/data/{reciter_subfolder}/{surahPadded}{ayahPadded}.mp3
 * Ensures true, authentic Ayah-level playback synchronization without guessing or estimation.
 */

import { SURAH_LIST, RECITERS, getAyahAudioUrl, type Reciter } from '../data/quranMetadata.ts';

export interface AudioTrack {
  id: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  audioUrl: string;
  isLiveRadio?: boolean;
  surahNumber?: number;
  ayahNumber?: number;
  seekSeconds?: number;
}

export type PlaybackMode = 'continuous' | 'repeat_ayah' | 'manual';

export interface AudioSyncState {
  isSyncActive: boolean;
  currentSurahNumber: number;
  currentAyahNumber: number;
  reciterId: string;
  playbackMode: PlaybackMode;
  repeatCount: number;
}

type SyncListener = (state: AudioSyncState) => void;

class AudioSyncEngine {
  private state: AudioSyncState = {
    isSyncActive: false,
    currentSurahNumber: 1,
    currentAyahNumber: 1,
    reciterId: 'alafasy',
    playbackMode: 'continuous',
    repeatCount: 0
  };

  private listeners: Set<SyncListener> = new Set();

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  public getState(): AudioSyncState {
    return { ...this.state };
  }

  /**
   * Builds an AudioTrack object for a specific Surah and Ayah
   */
  public buildAyahAudioTrack(surahNumber: number, ayahNumber: number, reciterId: string): AudioTrack {
    const surah = SURAH_LIST.find(s => s.number === surahNumber) || SURAH_LIST[0];
    const reciter = RECITERS.find(r => r.id === reciterId) || RECITERS[0];
    const audioUrl = getAyahAudioUrl(reciter.id, surahNumber, ayahNumber);

    return {
      id: `sync-ayah-${surahNumber}-${ayahNumber}-${reciter.id}`,
      titleAr: `سورة ${surah.name} — الآية ${ayahNumber}`,
      titleEn: `Surah ${surah.englishName} — Ayah ${ayahNumber}`,
      subtitleAr: `${reciter.nameAr} • تلاوة متزامنة`,
      subtitleEn: `${reciter.nameEn} • Synced Recitation`,
      audioUrl: audioUrl,
      surahNumber: surahNumber,
      ayahNumber: ayahNumber
    };
  }

  /**
   * Start or jump synchronization to specific verse
   */
  public startSync(surahNumber: number, ayahNumber: number, reciterId: string): AudioTrack {
    this.state = {
      ...this.state,
      isSyncActive: true,
      currentSurahNumber: surahNumber,
      currentAyahNumber: ayahNumber,
      reciterId: reciterId
    };
    this.notify();
    return this.buildAyahAudioTrack(surahNumber, ayahNumber, reciterId);
  }

  /**
   * Advances to next Ayah when track finishes
   */
  public handleAyahEnded(): AudioTrack | null {
    if (!this.state.isSyncActive) return null;

    if (this.state.playbackMode === 'repeat_ayah') {
      // Repeat the current Ayah
      this.state.repeatCount += 1;
      this.notify();
      return this.buildAyahAudioTrack(
        this.state.currentSurahNumber,
        this.state.currentAyahNumber,
        this.state.reciterId
      );
    }

    const surah = SURAH_LIST.find(s => s.number === this.state.currentSurahNumber) || SURAH_LIST[0];

    // If within current surah
    if (this.state.currentAyahNumber < surah.numberOfAyahs) {
      const nextAyah = this.state.currentAyahNumber + 1;
      this.state.currentAyahNumber = nextAyah;
      this.notify();
      return this.buildAyahAudioTrack(this.state.currentSurahNumber, nextAyah, this.state.reciterId);
    }

    // If at end of surah and there is a next surah
    if (this.state.currentSurahNumber < 114) {
      const nextSurah = this.state.currentSurahNumber + 1;
      this.state.currentSurahNumber = nextSurah;
      this.state.currentAyahNumber = 1;
      this.notify();
      return this.buildAyahAudioTrack(nextSurah, 1, this.state.reciterId);
    }

    // End of Quran
    this.stopSync();
    return null;
  }

  /**
   * Jump to previous Ayah
   */
  public getPreviousAyah(): AudioTrack | null {
    if (this.state.currentAyahNumber > 1) {
      const prevAyah = this.state.currentAyahNumber - 1;
      this.state.currentAyahNumber = prevAyah;
      this.notify();
      return this.buildAyahAudioTrack(this.state.currentSurahNumber, prevAyah, this.state.reciterId);
    }
    return null;
  }

  public nextAyah(): AudioTrack | null {
    return this.handleAyahEnded();
  }

  public previousAyah(): AudioTrack | null {
    return this.getPreviousAyah();
  }

  public jumpToAyah(surahNumber: number, ayahNumber: number): AudioTrack {
    return this.startSync(surahNumber, ayahNumber, this.state.reciterId);
  }

  public setPlaybackMode(mode: PlaybackMode): void {
    this.state.playbackMode = mode;
    this.notify();
  }

  public stopSync(): void {
    this.state.isSyncActive = false;
    this.notify();
  }
}

export const audioSyncEngine = new AudioSyncEngine();
