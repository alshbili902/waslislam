import { SpeechCapabilities } from '../types/khatmah';

export type TranscriptCallback = (transcript: string, isFinal: boolean, confidence: number) => void;
export type ErrorCallback = (errorMessage: string, isFatal: boolean) => void;
export type AudioLevelCallback = (level: number) => void;

// TypeScript declaration for webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export class QuranSpeechEngine {
  private recognition: any = null;
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;

  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private transcriptCallbacks: TranscriptCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];
  private audioLevelCallbacks: AudioLevelCallback[] = [];

  private currentTranscript: string = '';
  private fullAccumulatedTranscript: string = '';

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      return;
    }

    try {
      this.recognition = new SpeechRecognitionAPI();
      this.recognition.lang = 'ar-SA';
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 2;

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        let highestConfidence = 0.85;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const text = result[0].transcript;
          if (result[0].confidence && result[0].confidence > 0) {
            highestConfidence = result[0].confidence;
          }

          if (result.isFinal) {
            finalTranscript += ' ' + text;
          } else {
            interimTranscript += ' ' + text;
          }
        }

        if (finalTranscript.trim()) {
          this.fullAccumulatedTranscript += ' ' + finalTranscript.trim();
        }

        const combined = (this.fullAccumulatedTranscript + ' ' + interimTranscript).trim();
        this.currentTranscript = combined;

        const isFinal = Boolean(finalTranscript.trim() && !interimTranscript.trim());
        this.transcriptCallbacks.forEach((cb) =>
          cb(combined, isFinal, highestConfidence)
        );
      };

      this.recognition.onerror = (event: any) => {
        if (event.error === 'no-speech' || event.error === 'aborted') {
          // Normal silence or intentional cancellation, never trigger user error
          return;
        }

        let userMsg = 'تعذر التعرف الصوتي على التلاوة بدقة.';
        let isFatal = false;

        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          userMsg = 'تم رفض إذن استخدام الميكروفون. يرجى السماح به من إعدادات المتصفح للمتابعة.';
          isFatal = true;
        } else if (event.error === 'audio-capture') {
          userMsg = 'لم يتم العثور على ميكروفون صالح أو هو قيد الاستخدام بواسطة تطبيق آخر.';
          isFatal = true;
        } else if (event.error === 'network') {
          userMsg = 'تعذر الاتصال بخدمة التعرف الصوتي. يرجى التحقق من اتصال الإنترنت.';
        } else if (event.error === 'service-not-allowed') {
          userMsg = 'خدمة التعرف الصوتي غير مسموح بها حالياً في هذا المتصفح.';
          isFatal = true;
        }

        this.errorCallbacks.forEach((cb) => cb(userMsg, isFatal));
      };

      this.recognition.onend = () => {
        // If still supposed to be running and not paused, auto restart
        if (this.isRunning && !this.isPaused) {
          try {
            this.recognition.start();
          } catch {
            // Already active or prevented
          }
        }
      };
    } catch (e) {
      console.warn('SpeechRecognition initialization error:', e);
    }
  }

  public getCapabilities(): SpeechCapabilities {
    const isSupported = typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
    return {
      isSupported,
      hasMicrophonePermission: this.mediaStream !== null,
      permissionState: isSupported ? 'prompt' : 'unsupported',
      isContinuousSupported: isSupported,
      supportedBrowsersNotice: 'يدعم التسميع الصوتي متصفحات Chrome و Edge و Safari و Safari iOS والواجهات الحديثة.',
    };
  }

  public async requestMicrophone(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this.errorCallbacks.forEach((cb) =>
        cb('المتصفح لا يدعم الوصول إلى الميكروفون.', true)
      );
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaStream = stream;
      this.setupAudioMonitor(stream);
      return true;
    } catch (err: any) {
      console.warn('Microphone permission denied:', err);
      const isDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
      const msg = isDenied
        ? 'تم رفض إذن الميكروفون. يرجى تفعيله للمتابعة.'
        : 'تعذر تشغيل الميكروفون: ' + (err.message || 'خطأ غير معروف');
      this.errorCallbacks.forEach((cb) => cb(msg, true));
      return false;
    }
  }

  private setupAudioMonitor(stream: MediaStream) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!this.isRunning || this.isPaused || !this.analyser) {
          this.audioLevelCallbacks.forEach((cb) => cb(0));
          return;
        }

        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalizedLevel = Math.min(100, Math.round((average / 128) * 100));

        this.audioLevelCallbacks.forEach((cb) => cb(normalizedLevel));
        this.animFrameId = requestAnimationFrame(checkVolume);
      };

      this.animFrameId = requestAnimationFrame(checkVolume);
    } catch (e) {
      console.warn('Audio monitor setup failed:', e);
    }
  }

  public async start(): Promise<boolean> {
    if (!this.mediaStream) {
      const granted = await this.requestMicrophone();
      if (!granted) return false;
    }

    this.fullAccumulatedTranscript = '';
    this.currentTranscript = '';
    this.isRunning = true;
    this.isPaused = false;

    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (e) {
        // Recognition might already be running
      }
    }

    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    return true;
  }

  public stop(): void {
    this.isRunning = false;
    this.isPaused = false;

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }

    this.cleanup();
  }

  public pause(): void {
    this.isPaused = true;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
  }

  public resume(): void {
    if (!this.isRunning) {
      this.start();
      return;
    }

    this.isPaused = false;
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch {}
    }
  }

  public onTranscript(callback: TranscriptCallback): () => void {
    this.transcriptCallbacks.push(callback);
    return () => {
      this.transcriptCallbacks = this.transcriptCallbacks.filter((cb) => cb !== callback);
    };
  }

  public onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.push(callback);
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter((cb) => cb !== callback);
    };
  }

  public onAudioLevel(callback: AudioLevelCallback): () => void {
    this.audioLevelCallbacks.push(callback);
    return () => {
      this.audioLevelCallbacks = this.audioLevelCallbacks.filter((cb) => cb !== callback);
    };
  }

  public getCurrentTranscript(): string {
    return this.currentTranscript;
  }

  public cleanup(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
      this.mediaStream = null;
    }

    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }

    this.audioLevelCallbacks.forEach((cb) => cb(0));
  }
}

export const quranSpeechEngine = new QuranSpeechEngine();
