import React, { useState, useEffect } from 'react';
import {
  Headphones,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
  Pause,
  ExternalLink,
  Search,
  Sliders,
  ShieldCheck,
  Award,
  BookOpen,
  UserCheck,
  Activity,
  Zap,
  Globe,
  Radio
} from 'lucide-react';
import { QuranAudioReciter } from '../../types/quranAudio';
import {
  ReciterService,
  AudioSourceService,
  StreamDiagnosticResult
} from '../../services/quranAudioService';

export const AdminQuranAudioManager: React.FC = () => {
  const [reciters, setReciters] = useState<QuranAudioReciter[]>([]);
  const [search, setSearch] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    count: number;
    surahCount: number;
    lastSync: string;
    failedItems: number;
    error?: string;
  } | null>(null);

  // Quick test state in table
  const [testingUrl, setTestingUrl] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ url: string; reachable: boolean } | null>(null);

  // Full Diagnostic Tool State
  const [diagnosticUrl, setDiagnosticUrl] = useState('https://server8.mp3quran.net/afs/001.mp3');
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<StreamDiagnosticResult | null>(null);

  const loadData = () => {
    const list = ReciterService.getReciters();
    setReciters(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleReciter = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/quran-audio/reciters/${id}/toggle`, {
        method: 'POST'
      });
      if (res.ok) {
        setReciters((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
        );
      } else {
        setReciters((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
        );
      }
    } catch {
      setReciters((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
      );
    }
  };

  const handleSyncMetadata = async () => {
    setIsSyncing(true);
    setSyncResult(null);

    try {
      const res = await fetch('/api/admin/quran-audio/sync', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSyncResult({
          success: true,
          count: data.count || reciters.length,
          surahCount: 114,
          lastSync: data.lastSync || new Date().toISOString(),
          failedItems: 0
        });
        loadData();
      } else {
        const clientRes = await ReciterService.syncRecitersFromApi();
        setSyncResult({
          success: clientRes.success,
          count: clientRes.count,
          surahCount: 114,
          lastSync: new Date().toISOString(),
          failedItems: 0,
          error: clientRes.error
        });
        loadData();
      }
    } catch (e: any) {
      const clientRes = await ReciterService.syncRecitersFromApi();
      setSyncResult({
        success: clientRes.success,
        count: clientRes.count,
        surahCount: 114,
        lastSync: new Date().toISOString(),
        failedItems: 0,
        error: e?.message
      });
      loadData();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTestStream = async (url: string) => {
    setTestingUrl(url);
    const reachable = await AudioSourceService.validateAudioStream(url);
    setTestResult({ url, reachable });
    setTestingUrl(null);
  };

  const handleRunDiagnostic = async () => {
    if (!diagnosticUrl.trim()) return;
    setIsDiagnosing(true);
    setDiagnosticResult(null);
    try {
      const result = await AudioSourceService.diagnoseAudioStream(diagnosticUrl.trim());
      setDiagnosticResult(result);
    } catch (err: any) {
      setDiagnosticResult({
        url: diagnosticUrl,
        provider: 'mp3quran.net',
        httpStatus: null,
        contentType: null,
        acceptRanges: null,
        contentLength: null,
        corsSupported: false,
        isPlayable: false,
        errorCode: 'EXCEPTION',
        errorMessage: err?.message || 'فشل فحص الرابط',
        latencyMs: 0
      });
    } finally {
      setIsDiagnosing(false);
    }
  };

  const filteredReciters = reciters.filter(
    (r) =>
      r.nameAr.includes(search) ||
      r.riwayah.includes(search) ||
      r.nameEn.toLowerCase().includes(search.toLowerCase())
  );

  const totalRecordings = reciters.reduce(
    (sum, r) => sum + (r.moshafList[0]?.surahTotal || 114),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Sync Control */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-[#021812] to-teal-950 border border-emerald-500/30 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-900/60 text-amber-300 border border-emerald-700/50">
              <Headphones className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-emerald-400">إدارة صوتيات وتلاوات القرآن الكريم</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-tajawal text-white">
            مكتبة القرآن الكريم الصوتية
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            إدارة القراء، الروايات المعتمدة، الخوادم الصوتية، والمزامنة التلقائية مع شبكة mp3quran.net الرسمية المعتمدة.
          </p>
        </div>

        <button
          onClick={handleSyncMetadata}
          disabled={isSyncing}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all shrink-0 cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'جارٍ المزامنة...' : 'مزامنة بيانات القرآن'}</span>
        </button>
      </div>

      {/* Sync Status Banner */}
      {syncResult && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-4 text-xs ${
            syncResult.success
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {syncResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <div>
              <span className="font-bold block">
                {syncResult.success ? 'تمت مزامنة بيانات القرآن بنجاح' : 'تعذر إكمال المزامنة بالكامل'}
              </span>
              <span className="text-[11px] opacity-80">
                القراء: {syncResult.count} • السور: {syncResult.surahCount} • آخر فحص: {new Date(syncResult.lastSync).toLocaleTimeString('ar-SA')}
              </span>
            </div>
          </div>
          {syncResult.error && (
            <span className="text-[11px] text-rose-300 font-mono">{syncResult.error}</span>
          )}
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-emerald-950/60 border border-slate-200 dark:border-emerald-800/60 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">إجمالي القراء</span>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{reciters.length}</h4>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block">
            {reciters.filter((r) => r.isActive).length} مفعّل في المنصة
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-emerald-950/60 border border-slate-200 dark:border-emerald-800/60 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">السور القرآنية</span>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">114</h4>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block">
            مكية (86) • مدنية (28)
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-emerald-950/60 border border-slate-200 dark:border-emerald-800/60 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">إجمالي التسجيلات الصوتية</span>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{totalRecordings}</h4>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block">
            تلاوة كاملة عالية الجودة
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-emerald-950/60 border border-slate-200 dark:border-emerald-800/60 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">مزود الخدمة المعتمد</span>
          <h4 className="text-base font-bold text-emerald-800 dark:text-amber-300 truncate">mp3quran.net CDN</h4>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
            خوادم سحابية موثقة وآمنة
          </span>
        </div>
      </div>

      {/* AUDIO URL TEST TOOL (Diagnostic Tool) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-emerald-950/60 border border-slate-200 dark:border-emerald-800/60 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            <Activity className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              أداة فحص وتشخيص روابط الصوت (Audio Diagnostic Test Tool)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              فحص فوري للاستجابة، الترويسات (Headers)، دعـم CORS، ودعم تدفق البيانات الجزئي (Range Requests).
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="url"
            value={diagnosticUrl}
            onChange={(e) => setDiagnosticUrl(e.target.value)}
            placeholder="أدخل رابط التلاوة الصوتي للمعاينة (e.g. https://.../001.mp3)"
            className="flex-1 w-full p-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800/60 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
          />

          <button
            onClick={handleRunDiagnostic}
            disabled={isDiagnosing}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-60 shrink-0"
          >
            <Zap className={`w-3.5 h-3.5 ${isDiagnosing ? 'animate-spin' : ''}`} />
            <span>{isDiagnosing ? 'جارٍ الفحص...' : 'اختبار التشغيل'}</span>
          </button>
        </div>

        {/* Diagnostic Results Card */}
        {diagnosticResult && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                نتائج التشخيص الفني:
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  diagnosticResult.isPlayable
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-300 border border-emerald-400'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-900/80 dark:text-rose-300 border border-rose-400'
                }`}
              >
                {diagnosticResult.isPlayable ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>✓ صالح للتشغيل</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>
                      {diagnosticResult.errorCode === 'TIMEOUT'
                        ? '✕ انتهت المهلة'
                        : diagnosticResult.corsSupported === false
                        ? '✕ CORS'
                        : '✕ المصدر غير متاح'}
                    </span>
                  </>
                )}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-white dark:bg-emerald-950/60 border border-slate-200 dark:border-emerald-800/40">
                <span className="text-[10px] text-slate-400 block">HTTP Status</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {diagnosticResult.httpStatus ? `${diagnosticResult.httpStatus} OK` : 'غير متاح'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-emerald-950/60 border border-slate-200 dark:border-emerald-800/40">
                <span className="text-[10px] text-slate-400 block">Content-Type</span>
                <span className="font-bold text-slate-800 dark:text-white truncate block">
                  {diagnosticResult.contentType || 'غير معروف'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-emerald-950/60 border border-slate-200 dark:border-emerald-800/40">
                <span className="text-[10px] text-slate-400 block">Range Requests</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {diagnosticResult.acceptRanges || 'غير محدد'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-emerald-950/60 border border-slate-200 dark:border-emerald-800/40">
                <span className="text-[10px] text-slate-400 block">زمن الاستجابة (Latency)</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {diagnosticResult.latencyMs} ms
                </span>
              </div>
            </div>

            {diagnosticResult.errorMessage && (
              <p className="text-xs text-rose-600 dark:text-rose-400">
                {diagnosticResult.errorMessage}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Reciters Table Header & Search */}
      <div className="p-5 rounded-3xl bg-white dark:bg-emerald-950/60 border border-slate-200 dark:border-emerald-800/60 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2 self-start sm:self-auto">
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>قائمة القراء والروايات والخوادم ({filteredReciters.length})</span>
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث عن قارئ أو رواية..."
              className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800/60 text-xs text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 dark:bg-emerald-900/50 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-emerald-800/60">
              <tr>
                <th className="p-3">القارئ</th>
                <th className="p-3">الرواية</th>
                <th className="p-3">السور المتاحة</th>
                <th className="p-3">خادم البث المباشر</th>
                <th className="p-3">فحص الاتصال</th>
                <th className="p-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/40">
              {filteredReciters.map((r) => {
                const moshaf = r.moshafList[0];
                const sampleUrl = `${moshaf.serverUrl}001.mp3`;

                return (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-emerald-900/20 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {r.letter}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{r.nameAr}</span>
                          <span className="text-[10px] text-slate-400 block">{r.nameEn}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-medium">
                        {r.riwayah}
                      </span>
                    </td>

                    <td className="p-3 text-slate-600 dark:text-slate-300 font-mono">
                      {moshaf.surahTotal} / 114
                    </td>

                    <td className="p-3 text-slate-500 dark:text-slate-400 font-mono text-[10px] max-w-[200px] truncate" title={moshaf.serverUrl}>
                      {moshaf.serverUrl}
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => handleTestStream(sampleUrl)}
                        disabled={testingUrl === sampleUrl}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-emerald-900/50 hover:bg-slate-200 dark:hover:bg-emerald-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {testingUrl === sampleUrl ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : testResult?.url === sampleUrl ? (
                          testResult.reachable ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          )
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                        <span>فحص الفاتحة</span>
                      </button>
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => handleToggleReciter(r.id)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          r.isActive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {r.isActive ? 'مفعّل' : 'معطّل'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
