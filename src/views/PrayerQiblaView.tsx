import React, { useEffect, useState } from 'react';
import {
  Compass,
  MapPin,
  Clock,
  Settings,
  Navigation,
  Sparkles,
  Info,
  Calendar as CalIcon
} from 'lucide-react';
import {
  CALCULATION_METHODS,
  POPULAR_CITIES,
  SAUDI_REGIONS,
  calculateNextPrayer,
  calculateQibla,
  fetchPrayerTimes
} from '../services/prayerService';
import { NextPrayerInfo, PrayerTimesData, QiblaInfo } from '../types';

export const PrayerQiblaView: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState(POPULAR_CITIES[0]);
  const [methodId, setMethodId] = useState(4); // Umm Al-Qura default
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo | null>(null);
  const [qiblaInfo, setQiblaInfo] = useState<QiblaInfo>(() =>
    calculateQibla(POPULAR_CITIES[0].lat, POPULAR_CITIES[0].lng)
  );
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      const data = await fetchPrayerTimes(selectedCity.lat, selectedCity.lng, methodId, selectedCity.nameAr);
      if (!isCancelled) {
        setPrayerTimes(data);
        setNextPrayer(calculateNextPrayer(data));
        setQiblaInfo(calculateQibla(selectedCity.lat, selectedCity.lng));
      }
    }

    load();

    const interval = setInterval(() => {
      if (prayerTimes) {
        setNextPrayer(calculateNextPrayer(prayerTimes));
      }
    }, 1000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [selectedCity, methodId]);

  // Handle device orientation for real compass needle
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const iosHeading = (e as any).webkitCompassHeading;
      if (typeof iosHeading === 'number') {
        // iOS
        setDeviceHeading(iosHeading);
      } else if (e.alpha !== null) {
        // Android
        setDeviceHeading(360 - e.alpha);
      }
    };

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, []);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('تحديد الموقع الجغرافي غير مدعوم في متصفحك.');
      return;
    }

    setGeoLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setSelectedCity({
          nameAr: 'موقعي الحالي',
          nameEn: 'Current Location',
          countryAr: 'موقعك الدقيق',
          lat: userLat,
          lng: userLng,
          method: methodId
        });
        setGeoLocating(false);
      },
      (err) => {
        setGeoError('تعذر تحديد الموقع تلقائياً. يمكنك اختيار المدينة من القائمة.');
        setGeoLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const needleRotation = deviceHeading !== null
    ? (qiblaInfo.directionDegrees - deviceHeading + 360) % 360
    : qiblaInfo.directionDegrees;

  return (
    <div className="space-y-6 pb-16">
      {/* Settings & Location Bar */}
      <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                مواقيت الصلاة واتجاه القبلة
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              مواقيت صلاة دقيقة، عد تنازلي حيّ للأذان، وحساب زاوية القبلة والمسافة للكعبة المشرفة.
            </p>
          </div>

          {/* Location & Calculation Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleGetCurrentLocation}
              disabled={geoLocating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors border border-emerald-600/30"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{geoLocating ? 'جاري التحديد...' : 'موقعي الحالي'}</span>
            </button>

            <select
              value={selectedCity.nameEn}
              onChange={(e) => {
                const found = POPULAR_CITIES.find((c) => c.nameEn === e.target.value);
                if (found) setSelectedCity(found);
              }}
              className="text-xs font-medium bg-slate-50 dark:bg-emerald-900/50 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl border border-slate-200 dark:border-emerald-700/60 focus:outline-hidden cursor-pointer"
            >
              {SAUDI_REGIONS.map((region) => (
                <optgroup key={region} label={region}>
                  {POPULAR_CITIES.filter((c) => c.regionAr === region).map((c) => (
                    <option key={c.nameEn} value={c.nameEn}>
                      {c.nameAr}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <select
              value={methodId}
              onChange={(e) => setMethodId(Number(e.target.value))}
              className="text-xs font-medium bg-slate-50 dark:bg-emerald-900/50 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl border border-slate-200 dark:border-emerald-700/60 focus:outline-hidden"
            >
              {CALCULATION_METHODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nameAr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {geoError && (
          <p className="text-xs text-rose-500 mt-2">
            {geoError}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prayer Times & Countdown */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Countdown Card */}
          {nextPrayer && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-teal-950 text-white shadow-lg border border-emerald-800/40 relative overflow-hidden">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-300">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>الصلاة القادمة</span>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-800/60 text-emerald-200 border border-emerald-600/40">
                  {selectedCity.nameAr}
                </span>
              </div>

              <div className="flex items-end justify-between gap-4">
                <div>
                  <h3 className="text-3xl sm:text-4xl font-bold font-amiri text-amber-300">
                    صلاة {nextPrayer.nextPrayerAr}
                  </h3>
                  <p className="text-xs text-emerald-200 mt-1">
                    موعد الأذان: {nextPrayer.nextPrayerTime}
                  </p>
                </div>

                <div className="text-left font-mono">
                  <span className="text-xs text-emerald-300 block mb-1">متبقي للأذان</span>
                  <span className="text-2xl sm:text-3xl font-bold text-white bg-black/30 px-3 py-1.5 rounded-xl border border-emerald-600/30">
                    {nextPrayer.formattedCountdown}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-emerald-950/60 h-2 rounded-full overflow-hidden mt-6 border border-emerald-700/30">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${nextPrayer.progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* All Prayers Table */}
          <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
              جدول مواقيت اليوم
            </h3>
            <div className="space-y-2">
              {[
                { name: 'الإمساك', time: prayerTimes?.imsak || '04:30', note: 'قبل الفجر' },
                { name: 'الفجر', time: prayerTimes?.fajr || '--:--', note: 'صلاة الفريضة' },
                { name: 'الشروق', time: prayerTimes?.sunrise || '--:--', note: 'شروق الشمس' },
                { name: 'الظهر', time: prayerTimes?.dhuhr || '--:--', note: 'صلاة الفريضة' },
                { name: 'العصر', time: prayerTimes?.asr || '--:--', note: 'صلاة الفريضة' },
                { name: 'المغرب', time: prayerTimes?.maghrib || '--:--', note: 'صلاة الفريضة' },
                { name: 'العشاء', time: prayerTimes?.isha || '--:--', note: 'صلاة الفريضة' },
                { name: 'منتصف الليل', time: prayerTimes?.midnight || '23:38', note: 'الربع الأخير' }
              ].map((p) => {
                const isNext = nextPrayer?.nextPrayerAr === p.name;
                return (
                  <div
                    key={p.name}
                    className={`p-3 rounded-xl flex items-center justify-between transition-colors ${
                      isNext
                        ? 'bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-500 font-bold'
                        : 'bg-slate-50 dark:bg-emerald-900/20 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div>
                      <span className="text-sm font-semibold">{p.name}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mr-2">
                        ({p.note})
                      </span>
                    </div>
                    <span className="font-mono text-base font-bold text-emerald-900 dark:text-amber-300">
                      {p.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Qibla Compass & Kaaba Heading */}
        <div className="lg:col-span-5 bg-white dark:bg-emerald-950/80 rounded-2xl p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm flex flex-col items-center justify-between text-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs font-semibold mb-2">
              <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>بوصلة القبلة الدقيقة</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              اتجاه الكعبة المشرفة
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              موقع الكعبة في مكة المكرمة: 21.4225° N, 39.8262° E
            </p>
          </div>

          {/* Visual Interactive Compass */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-6 flex items-center justify-center">
            {/* Outer Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-emerald-200 dark:border-emerald-800 flex items-center justify-center shadow-inner">
              {/* North, South, East, West Markers */}
              <span className="absolute top-2 text-xs font-bold text-rose-600">شمال (N)</span>
              <span className="absolute bottom-2 text-xs font-bold text-slate-400">جنوب (S)</span>
              <span className="absolute right-2 text-xs font-bold text-slate-400">شرق (E)</span>
              <span className="absolute left-2 text-xs font-bold text-slate-400">غرب (W)</span>

              {/* Degrees Tick Marks */}
              <div className="absolute inset-4 rounded-full border border-dashed border-emerald-300/60 dark:border-emerald-700/60 pointer-events-none" />
            </div>

            {/* Rotating Qibla Pointer */}
            <div
              className="relative w-full h-full flex items-center justify-center transition-transform duration-500"
              style={{ transform: `rotate(${needleRotation}deg)` }}
            >
              {/* Kaaba Gold Icon at the top of the needle */}
              <div className="absolute top-6 flex flex-col items-center">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center shadow-lg border border-amber-300">
                  🕋
                </div>
                <span className="text-[10px] font-bold text-emerald-800 dark:text-amber-300 mt-0.5">
                  القبلة
                </span>
              </div>

              {/* Needle Line */}
              <div className="w-1.5 h-36 bg-gradient-to-t from-emerald-700 via-emerald-500 to-amber-400 rounded-full shadow-md" />
              <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-amber-400 absolute shadow-sm" />
            </div>
          </div>

          {/* Qibla Details */}
          <div className="w-full grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-emerald-900/60 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/30">
              <span className="text-slate-500 dark:text-slate-400 block mb-1">زاوية الاتجاه</span>
              <strong className="text-base sm:text-lg font-mono text-emerald-800 dark:text-emerald-300">
                {qiblaInfo.directionDegrees}°
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/30">
              <span className="text-slate-500 dark:text-slate-400 block mb-1">المسافة إلى مكة</span>
              <strong className="text-base sm:text-lg font-mono text-emerald-800 dark:text-emerald-300">
                {qiblaInfo.distanceKm.toLocaleString()} كم
              </strong>
            </div>
          </div>

          {deviceHeading !== null && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
              ✓ تم تفعيل مستشعر البوصلة الحي في جهازك
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
