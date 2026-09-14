import React, { useEffect, useState } from 'react';
import {
  Compass,
  MapPin,
  Clock,
  Settings2,
  Navigation,
  Bell,
  BellOff,
  Calendar,
  Volume2,
  CheckCircle2,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  AlertCircle
} from 'lucide-react';
import {
  CALCULATION_METHODS,
  MADHHAB_OPTIONS,
  HIGH_LATITUDE_OPTIONS,
  POPULAR_CITIES,
  SAUDI_REGIONS,
  calculateNextPrayer,
  calculateQibla,
  fetchPrayerTimes,
  getPrayerNotificationSettings,
  savePrayerNotificationSettings,
  requestNotificationPermission,
  PrayerNotificationSettings
} from '../services/prayerService';
import { NextPrayerInfo, PrayerTimesData, QiblaInfo } from '../types';

const SAVED_LOCATION_KEY = 'wasl_saved_prayer_location_v1';
const SAVED_CALC_SETTINGS_KEY = 'wasl_prayer_calc_settings_v1';

export const PrayerQiblaView: React.FC = () => {
  // Load saved location from localStorage or default to Makkah
  const [selectedCity, setSelectedCity] = useState(() => {
    try {
      const saved = localStorage.getItem(SAVED_LOCATION_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return POPULAR_CITIES[0];
  });

  // Calculation settings
  const [calcSettings, setCalcSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SAVED_CALC_SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      methodId: 4, // Umm Al-Qura
      madhhabId: 0, // Shafi'i / Hanbali / Maliki
      highLatId: 0
    };
  });

  // Notification settings
  const [notifications, setNotifications] = useState<PrayerNotificationSettings>(getPrayerNotificationSettings);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');

  // Modals
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Prayer state
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo | null>(null);
  const [qiblaInfo, setQiblaInfo] = useState<QiblaInfo>(() =>
    calculateQibla(selectedCity.lat, selectedCity.lng)
  );
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);

  // Check notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    } else {
      setNotificationPermission('unsupported');
    }
  }, []);

  // Save selected city to storage
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_LOCATION_KEY, JSON.stringify(selectedCity));
    } catch {}
  }, [selectedCity]);

  // Save calculation settings
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_CALC_SETTINGS_KEY, JSON.stringify(calcSettings));
    } catch {}
  }, [calcSettings]);

  // Fetch prayer times
  useEffect(() => {
    let isCancelled = false;

    async function load() {
      const data = await fetchPrayerTimes(
        selectedCity.lat,
        selectedCity.lng,
        calcSettings.methodId,
        selectedCity.nameAr
      );
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
  }, [selectedCity, calcSettings]);

  // Device orientation for Qibla compass
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const iosHeading = (e as any).webkitCompassHeading;
      if (typeof iosHeading === 'number') {
        setDeviceHeading(iosHeading);
      } else if (e.alpha !== null) {
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

  // Automatic GPS Location Handler
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoMessage('تحديد الموقع الجغرافي غير مدعوم في متصفحك.');
      return;
    }

    setGeoLocating(true);
    setGeoMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        const loc = {
          nameAr: 'موقعي الحالي (GPS)',
          nameEn: 'Current Location',
          countryAr: 'المملكة العربية السعودية',
          regionAr: 'الموقع الدقيق',
          lat: userLat,
          lng: userLng,
          method: calcSettings.methodId
        };
        setSelectedCity(loc);
        setGeoLocating(false);
        setShowLocationModal(false);
      },
      (err) => {
        setGeoMessage('تعذر الوصول للموقع. يرجى التأكد من منح الإذن أو اختيار المدينة يدوياً.');
        setGeoLocating(false);
      },
      { timeout: 8000 }
    );
  };

  // Notification toggles
  const handleToggleNotification = async (key: keyof PrayerNotificationSettings) => {
    if (notificationPermission !== 'granted') {
      const perm = await requestNotificationPermission();
      setNotificationPermission(perm);
      if (perm !== 'granted') return;
    }

    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    savePrayerNotificationSettings(updated);
  };

  const needleRotation = deviceHeading !== null
    ? (qiblaInfo.directionDegrees - deviceHeading + 360) % 360
    : qiblaInfo.directionDegrees;

  // The 6 Canonical Prayer Entries
  const canonicalPrayers = [
    {
      id: 'fajr',
      nameAr: 'الفجر',
      time: prayerTimes?.fajr || '--:--',
      icon: Moon,
      isFard: true,
      desc: 'صلاة الصبح'
    },
    {
      id: 'sunrise',
      nameAr: 'الشروق',
      time: prayerTimes?.sunrise || '--:--',
      icon: Sunrise,
      isFard: false,
      desc: 'طلوع الشمس وانتهاء وقت الفجر'
    },
    {
      id: 'dhuhr',
      nameAr: 'الظهر',
      time: prayerTimes?.dhuhr || '--:--',
      icon: Sun,
      isFard: true,
      desc: 'صلاة الهجير'
    },
    {
      id: 'asr',
      nameAr: 'العصر',
      time: prayerTimes?.asr || '--:--',
      icon: Sun,
      isFard: true,
      desc: 'الصلاة الوسطى'
    },
    {
      id: 'maghrib',
      nameAr: 'المغرب',
      time: prayerTimes?.maghrib || '--:--',
      icon: Sunset,
      isFard: true,
      desc: 'غروب الشمس ووقت الإفطار'
    },
    {
      id: 'isha',
      nameAr: 'العشاء',
      time: prayerTimes?.isha || '--:--',
      icon: Moon,
      isFard: true,
      desc: 'صلاة العتمة'
    }
  ];

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Top Header Card: Title, Hijri Date, Controls */}
      <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 sm:p-7 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                <Clock className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-amiri text-slate-900 dark:text-white">
                  لوحة مواقيت الصلاة المتقدمة
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  مواقيت دقيقة مبنية على الحسابات الفلكية المعتمدة، مع بوصلة القبلة والتنبيهات الحية.
                </p>
              </div>
            </div>

            {/* Hijri & Gregorian Dates */}
            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-medium text-slate-600 dark:text-emerald-200">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200/60 dark:border-emerald-700/50">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {prayerTimes?.dateHijri
                    ? `${prayerTimes.dateHijri.weekdayAr} ${prayerTimes.dateHijri.day} ${prayerTimes.dateHijri.monthAr} ${prayerTimes.dateHijri.year} هـ`
                    : 'جاري تحميل التاريخ الهجري...'}
                </span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-emerald-900/20 border border-slate-200/60 dark:border-emerald-800/40">
                <span>{prayerTimes?.dateGregorian || 'اليوم'}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Location, Calculation Settings, Notifications */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowLocationModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors border border-emerald-600/30"
              title="تغيير المدينة والموقع"
            >
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{selectedCity.nameAr}</span>
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/30 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-emerald-900/50 transition-colors border border-slate-200 dark:border-emerald-700/60"
              title="إعدادات الحساب والمذهب"
            >
              <Settings2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>إعدادات الحساب</span>
            </button>

            <button
              onClick={() => setShowNotificationModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-colors border border-amber-300 dark:border-amber-700/60"
              title="تنبيهات الأذان"
            >
              <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>التنبيهات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Live Next Prayer & 6 Prayers List, Right = Qibla & Kaaba */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Next Prayer Hero & Detailed Prayers */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hero Live Countdown Card */}
          {nextPrayer && (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-teal-950 text-white shadow-xl border border-emerald-700/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between gap-2 mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/70 border border-emerald-600/40 text-emerald-200 text-xs font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>الصلاة القادمة</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-300">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{selectedCity.nameAr}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                  <span className="text-xs text-emerald-300 font-medium block mb-1">
                    حان موعد أو يترقب أذان:
                  </span>
                  <h2 className="text-4xl sm:text-5xl font-extrabold font-amiri text-amber-300">
                    صلاة {nextPrayer.nextPrayerAr}
                  </h2>
                  <p className="text-sm text-emerald-200 mt-2 flex items-center gap-2">
                    <span>موعد الأذان:</span>
                    <strong className="font-mono text-base text-white">{nextPrayer.nextPrayerTime}</strong>
                  </p>
                </div>

                <div className="text-left bg-black/40 p-4 rounded-2xl border border-emerald-600/30 backdrop-blur-xs min-w-[200px]">
                  <span className="text-xs text-emerald-300 block mb-1 font-medium">الوقت المتبقي للأذان</span>
                  <div className="font-mono text-3xl sm:text-4xl font-black text-amber-300 tracking-wider">
                    {nextPrayer.formattedCountdown}
                  </div>
                  <span className="text-[11px] text-emerald-400 mt-1 block">
                    ساعة : دقيقة : ثانية
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6 pt-4 border-t border-emerald-800/50">
                <div className="flex justify-between text-xs text-emerald-300 mb-1.5">
                  <span>الصلاة السابقة: {nextPrayer.currentPrayerAr}</span>
                  <span>{nextPrayer.progressPercent}% حتى الأذان</span>
                </div>
                <div className="w-full bg-emerald-950/80 h-2.5 rounded-full overflow-hidden border border-emerald-700/40">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-300 rounded-full transition-all duration-500"
                    style={{ width: `${nextPrayer.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Canonical 6 Prayers Grid */}
          <div className="bg-white dark:bg-emerald-950/80 rounded-2xl p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                صلوات اليوم المفروضة
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {selectedCity.nameAr}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {canonicalPrayers.map((p) => {
                const IconComp = p.icon;
                const isNext = nextPrayer?.nextPrayerAr === p.nameAr;
                const notifEnabled = notifications[p.id as keyof PrayerNotificationSettings];

                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      isNext
                        ? 'bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent border-emerald-500 shadow-xs dark:bg-emerald-900/50 ring-1 ring-emerald-500'
                        : 'bg-slate-50/70 dark:bg-emerald-900/20 border-slate-200/80 dark:border-emerald-800/40 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                          isNext
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-emerald-100/80 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-slate-900 dark:text-white">
                            {p.nameAr}
                          </span>
                          {isNext && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-bold text-[10px]">
                              القادمة
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                          {p.desc}
                        </span>
                      </div>
                    </div>

                    <div className="text-left flex items-center gap-3">
                      <div>
                        <span className="font-mono text-xl font-bold text-emerald-900 dark:text-amber-300 block">
                          {p.time}
                        </span>
                      </div>
                      {p.isFard && (
                        <button
                          onClick={() => handleToggleNotification(p.id as keyof PrayerNotificationSettings)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            notifEnabled
                              ? 'text-amber-600 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-950/50'
                              : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'
                          }`}
                          title={notifEnabled ? 'التنبيه مفعل' : 'تفعيل التنبيه'}
                        >
                          {notifEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Additional Astronomical Times */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-emerald-900/50 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/20 flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">وقت الإمساك (للسحور):</span>
                <strong className="font-mono text-emerald-800 dark:text-emerald-300">
                  {prayerTimes?.imsak || '04:30'}
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/20 flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">منتصف الليل الشرعي:</span>
                <strong className="font-mono text-emerald-800 dark:text-emerald-300">
                  {prayerTimes?.midnight || '23:38'}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Qibla Compass & Kaaba Heading */}
        <div className="lg:col-span-5 bg-white dark:bg-emerald-950/80 rounded-2xl p-6 border border-emerald-900/10 dark:border-emerald-800/50 shadow-sm flex flex-col items-center justify-between text-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs font-semibold mb-2">
              <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>بوصلة القبلة المباشرة</span>
            </div>
            <h2 className="text-xl font-bold font-amiri text-slate-900 dark:text-white">
              اتجاه الكعبة المشرفة بمكة المكرمة
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              مبني على إحداثيات موقعك الحالي والمسار الجغرافي الأقصر (الدائرة العظمى).
            </p>
          </div>

          {/* Visual Interactive Compass */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-6 flex items-center justify-center">
            {/* Outer Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-emerald-200 dark:border-emerald-800 flex items-center justify-center shadow-inner">
              <span className="absolute top-2 text-xs font-bold text-rose-600">شمال (N)</span>
              <span className="absolute bottom-2 text-xs font-bold text-slate-400">جنوب (S)</span>
              <span className="absolute right-2 text-xs font-bold text-slate-400">شرق (E)</span>
              <span className="absolute left-2 text-xs font-bold text-slate-400">غرب (W)</span>

              <div className="absolute inset-4 rounded-full border border-dashed border-emerald-300/60 dark:border-emerald-700/60 pointer-events-none" />
            </div>

            {/* Rotating Qibla Pointer */}
            <div
              className="relative w-full h-full flex items-center justify-center transition-transform duration-500"
              style={{ transform: `rotate(${needleRotation}deg)` }}
            >
              {/* Kaaba Icon Indicator */}
              <div className="absolute top-6 flex flex-col items-center">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center shadow-lg border-2 border-amber-300 text-lg">
                  🕋
                </div>
                <span className="text-[10px] font-bold text-emerald-800 dark:text-amber-300 mt-0.5">
                  القبلة
                </span>
              </div>

              {/* Needle Line */}
              <div className="w-2 h-36 bg-gradient-to-t from-emerald-800 via-emerald-500 to-amber-400 rounded-full shadow-md" />
              <div className="w-5 h-5 rounded-full bg-slate-900 border-2 border-amber-400 absolute shadow-sm" />
            </div>
          </div>

          {/* Qibla Details */}
          <div className="w-full grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-emerald-900/60 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-emerald-900/30">
              <span className="text-slate-500 dark:text-slate-400 block mb-1">زاوية القبلة</span>
              <strong className="text-lg font-mono text-emerald-800 dark:text-emerald-300">
                {qiblaInfo.directionDegrees}°
              </strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-emerald-900/30">
              <span className="text-slate-500 dark:text-slate-400 block mb-1">المسافة إلى الكعبة</span>
              <strong className="text-lg font-mono text-emerald-800 dark:text-emerald-300">
                {qiblaInfo.distanceKm.toLocaleString()} كم
              </strong>
            </div>
          </div>

          {deviceHeading !== null ? (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-3 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>مستشعر البوصلة الحي يعمل تلقائياً مع حركة الجهاز</span>
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3">
              وجّه أعلى هاتفك نحو الزاوية الموضحة لمطابقة القبلة
            </p>
          )}
        </div>
      </div>

      {/* MODAL 1: Location Selection */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-emerald-950 rounded-3xl max-w-lg w-full p-6 border border-emerald-900/20 dark:border-emerald-800/60 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  تحديد الموقع والمدينة
                </h3>
              </div>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* GPS Option */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700/50">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                    تحديد الموقع الجغرافي التلقائي (GPS)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    يحسب مواقيت الصلاة وزاوية القبلة الدقيقة بدقة الأمتار حسب إحداثيات هاتفك الحالية.
                  </p>
                </div>
                <button
                  onClick={handleGetCurrentLocation}
                  disabled={geoLocating}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors whitespace-nowrap shadow-sm"
                >
                  {geoLocating ? 'جاري التحديد...' : 'تفعيل GPS'}
                </button>
              </div>
              {geoMessage && (
                <p className="text-xs text-rose-500 dark:text-rose-400 mt-2 font-medium">
                  {geoMessage}
                </p>
              )}
            </div>

            {/* Manual City Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                أو اختر مدينتك يدوياً:
              </label>
              <select
                value={selectedCity.nameEn}
                onChange={(e) => {
                  const found = POPULAR_CITIES.find((c) => c.nameEn === e.target.value);
                  if (found) {
                    setSelectedCity(found);
                    setShowLocationModal(false);
                  }
                }}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-700 text-sm text-slate-900 dark:text-white"
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
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Calculation Settings */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-emerald-950 rounded-3xl max-w-lg w-full p-6 border border-emerald-900/20 dark:border-emerald-800/60 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  إعدادات حساب مواقيت الصلاة
                </h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Calculation Method */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  طريقة الحساب الفلكي:
                </label>
                <select
                  value={calcSettings.methodId}
                  onChange={(e) => setCalcSettings({ ...calcSettings, methodId: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-700 text-slate-900 dark:text-white font-medium"
                >
                  {CALCULATION_METHODS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Madhhab / Asr Shadow */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  مذهب حساب صلاة العصر:
                </label>
                <select
                  value={calcSettings.madhhabId}
                  onChange={(e) => setCalcSettings({ ...calcSettings, madhhabId: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-700 text-slate-900 dark:text-white font-medium"
                >
                  {MADHHAB_OPTIONS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              {/* High Latitude */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  تعديل خطوط العرض العليا (للمناطق القطبية والشمالية):
                </label>
                <select
                  value={calcSettings.highLatId}
                  onChange={(e) => setCalcSettings({ ...calcSettings, highLatId: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-700 text-slate-900 dark:text-white font-medium"
                >
                  {HIGH_LATITUDE_OPTIONS.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.nameAr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-emerald-900 flex justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                حفظ وإغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Prayer Notifications Settings */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-emerald-950 rounded-3xl max-w-lg w-full p-6 border border-emerald-900/20 dark:border-emerald-800/60 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  إشعارات وتنبيهات أوقات الصلاة
                </h3>
              </div>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              يمكنك تخصيص التنبيه لكل صلاة بشكل مستقل، وتلقي إشعار لطيف عند دخول وقت الصلاة.
            </p>

            {notificationPermission !== 'granted' && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/50 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>يتطلب إرسال الإشعارات إذناً من متصفحك.</span>
                </div>
                <button
                  onClick={async () => {
                    const res = await requestNotificationPermission();
                    setNotificationPermission(res);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                >
                  منح الإذن
                </button>
              </div>
            )}

            <div className="space-y-2.5">
              {[
                { key: 'fajr', label: 'أذان الفجر' },
                { key: 'dhuhr', label: 'أذان الظهر' },
                { key: 'asr', label: 'أذان العصر' },
                { key: 'maghrib', label: 'أذان المغرب' },
                { key: 'isha', label: 'أذان العشاء' }
              ].map(({ key, label }) => {
                const isEnabled = notifications[key as keyof PrayerNotificationSettings];
                return (
                  <div
                    key={key}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/30 flex items-center justify-between"
                  >
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {label}
                    </span>
                    <button
                      onClick={() => handleToggleNotification(key as keyof PrayerNotificationSettings)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        isEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          isEnabled ? 'right-1' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-emerald-900 flex justify-end">
              <button
                onClick={() => setShowNotificationModal(false)}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                تم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
