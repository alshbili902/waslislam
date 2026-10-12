'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Compass, 
  Calculator, 
  Calendar, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  AlertCircle, 
  Volume2, 
  Plane,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  CITIES, 
  type CityCoordinate, 
  calculatePrayerTimes, 
  calculateQiblaDirection, 
  getHijriDate 
} from '../utils/prayerTimes';
import { format12HourTime, findClosestCity } from '../utils/timeFormat';
import { getUpcomingIslamicOccasions } from '../utils/ramadanCountdown';
import { ADHKAR_DATA } from '../data/adhkarData';

interface DailyWorshipToolsProps {
  selectedCity: CityCoordinate;
  onChangeCity: (city: CityCoordinate) => void;
  isEnglish: boolean;
}

export const DailyWorshipTools: React.FC<DailyWorshipToolsProps> = ({
  selectedCity,
  onChangeCity,
  isEnglish
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'prayer' | 'qibla' | 'zakat' | 'calendar' | 'travel'>('prayer');

  // Prayer state
  const [mounted, setMounted] = useState(false);
  const [prayerData, setPrayerData] = useState(() => calculatePrayerTimes(selectedCity.lat, selectedCity.lng, selectedCity.timezone));
  const [isLocating, setIsLocating] = useState(false);

  const handleDetectLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      alert(isEnglish ? 'Geolocation is not supported.' : 'خاصية تحديد الموقع غير مدعومة في متصفحك.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const closest = findClosestCity(pos.coords.latitude, pos.coords.longitude);
        onChangeCity(closest);
      },
      () => {
        setIsLocating(false);
        alert(isEnglish ? 'Location access was denied or timed out.' : 'تعذر تحديد الموقع الجغرافي. يرجى اختيار مدينتك يدوياً.');
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compass State
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [hasCompassSensor, setHasCompassSensor] = useState<boolean>(false);
  const qiblaAngle = calculateQiblaDirection(selectedCity.lat, selectedCity.lng);

  // Zakat Calculator State
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [goldGrams, setGoldGrams] = useState<number>(0);
  const [goldCarat, setGoldCarat] = useState<'24' | '21' | '18'>('24');
  const [silverGrams, setSilverGrams] = useState<number>(0);
  const [merchandiseValue, setMerchandiseValue] = useState<number>(0);
  const [debtsOwed, setDebtsOwed] = useState<number>(0);

  // Standard Approximate gold prices in SAR for Nisab reference
  const goldPricePerGram24k = 310;
  const goldPricePerGram21k = 271;
  const goldPricePerGram18k = 232;
  const silverPricePerGram = 3.8;
  const nisabValueCash = 85 * goldPricePerGram24k; // ~26,350 SAR

  // Calculate Zakat
  const currentGoldPrice = goldCarat === '24' ? goldPricePerGram24k : goldCarat === '21' ? goldPricePerGram21k : goldPricePerGram18k;
  const totalGoldValue = goldGrams * currentGoldPrice;
  const totalSilverValue = silverGrams * silverPricePerGram;
  const totalWealth = (cashAmount || 0) + totalGoldValue + totalSilverValue + (merchandiseValue || 0) - (debtsOwed || 0);
  const meetsNisab = totalWealth >= nisabValueCash;
  const zakatDue = meetsNisab ? totalWealth * 0.025 : 0;

  // Listen to device orientation for compass
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // webkitCompassHeading is iOS, alpha is Android/Standard
      if ((e as any).webkitCompassHeading !== undefined) {
        setDeviceHeading((e as any).webkitCompassHeading);
        setHasCompassSensor(true);
      } else if (e.alpha !== null) {
        setDeviceHeading(360 - e.alpha);
        setHasCompassSensor(true);
      }
    };

    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, []);

  // Update prayer countdown every second
  useEffect(() => {
    if (!mounted) return;
    const timer = setInterval(() => {
      setPrayerData(calculatePrayerTimes(selectedCity.lat, selectedCity.lng, selectedCity.timezone));
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedCity, mounted]);

  const hijri = getHijriDate();

  return (
    <div className="space-y-6 pb-24">
      {/* Sub Tabs Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'prayer', labelAr: 'مواقيت الصلاة', labelEn: 'Prayer Times', icon: <Clock className="w-4 h-4" /> },
          { id: 'qibla', labelAr: 'بوصلة القبلة', labelEn: 'Qibla Compass', icon: <Compass className="w-4 h-4" /> },
          { id: 'zakat', labelAr: 'حاسبة الزكاة', labelEn: 'Zakat Calculator', icon: <Calculator className="w-4 h-4" /> },
          { id: 'calendar', labelAr: 'التقويم الهجري', labelEn: 'Islamic Calendar', icon: <Calendar className="w-4 h-4" /> },
          { id: 'travel', labelAr: 'وضع المسافر', labelEn: 'Travel Mode', icon: <Plane className="w-4 h-4" /> },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveSubTab(t.id as any)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 flex items-center gap-2 transition-all ${
              activeSubTab === t.id
                ? 'bg-[var(--primary)] text-white shadow-md'
                : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)] hover:text-[var(--text-main)]'
            }`}
          >
            {t.icon}
            <span>{isEnglish ? t.labelEn : t.labelAr}</span>
          </button>
        ))}
      </div>

      {/* 1. Prayer Times Tab */}
      {activeSubTab === 'prayer' && (
        <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
            <div>
              <h2 className="text-xl font-black text-[var(--text-main)] font-cairo">
                {isEnglish ? 'Prayer Schedule & Adhan' : 'جدول الصلوات المفروضة والأذان'}
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {isEnglish ? 'Calculated according to Umm al-Qura standard algorithm' : 'محسوبة بدقة فلكية حسب تقويم أم القرى بالمملكة العربية السعودية'}
              </p>
            </div>

            {/* City Selector with Geolocation */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="p-1.5 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-[var(--primary-light)] text-[var(--primary)] border border-[var(--border-color)] transition-colors flex items-center gap-1 text-xs font-bold"
                title={isEnglish ? 'Detect current location' : 'تحديد الموقع الجغرافي تلقائياً'}
              >
                <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isEnglish ? 'Locate' : 'موقعي'}</span>
              </button>
              <MapPin className="w-4 h-4 text-[var(--gold)]" />
              <select
                value={selectedCity.id}
                onChange={(e) => {
                  const c = CITIES.find(city => city.id === e.target.value);
                  if (c) onChangeCity(c);
                }}
                className="bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl px-3 py-1.5 text-xs font-bold text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)]"
              >
                {CITIES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nameAr} ({c.countryAr})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Next Prayer Feature Banner with 12-Hour Format */}
          <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--gold-hover)] rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-200 block mb-1">
                {isEnglish ? 'Next Prayer' : 'الصلاة القادمة بإذن الله'}
              </span>
              <div className="flex items-center gap-3">
                <h3 className="text-3xl font-black font-cairo">
                  {isEnglish ? prayerData.nextPrayer.nameEn : prayerData.nextPrayer.nameAr}
                </h3>
                <span className="text-2xl font-mono font-bold bg-white/20 px-3 py-1 rounded-xl" suppressHydrationWarning>
                  {format12HourTime(prayerData.nextPrayer.time, isEnglish)}
                </span>
              </div>
            </div>

            <div className="text-center md:text-left bg-black/20 p-4 rounded-xl border border-white/10">
              <span className="text-xs text-emerald-100 block">
                {isEnglish ? 'Time Remaining' : 'الوقت المتبقي حتى الأذان'}
              </span>
              <span suppressHydrationWarning className="text-2xl font-black font-mono text-amber-300">
                {mounted ? prayerData.nextPrayer.remainingFormatted : '--:--:--'}
              </span>
            </div>
          </div>

          {/* Full Times Grid with 12-Hour Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" suppressHydrationWarning>
            {[
              { id: 'fajr', nameAr: 'الفجر', nameEn: 'Fajr', time: prayerData.fajr, desc: 'صلاة الصبح ركعتان جهريتان' },
              { id: 'sunrise', nameAr: 'الشروق', nameEn: 'Sunrise', time: prayerData.sunrise, desc: 'خروج وقت صلاة الفجر ووقت صلاة الضحى' },
              { id: 'dhuhr', nameAr: 'الظهر', nameEn: 'Dhuhr', time: prayerData.dhuhr, desc: 'أربع ركعات سرية' },
              { id: 'asr', nameAr: 'العصر', nameEn: 'Asr', time: prayerData.asr, desc: 'الصلاة الوسطى أربع ركعات سرية' },
              { id: 'maghrib', nameAr: 'المغرب', nameEn: 'Maghrib', time: prayerData.maghrib, desc: 'ثلاث ركعات جهريتان وسرية' },
              { id: 'isha', nameAr: 'العشاء', nameEn: 'Isha', time: prayerData.isha, desc: 'أربع ركعات يعقبها الشفع والوتر' },
            ].map((p) => {
              const isCurrentNext = prayerData.nextPrayer.nameAr === p.nameAr;
              const formattedTime = format12HourTime(p.time, isEnglish);
              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCurrentNext
                      ? 'bg-[var(--primary-light)] border-[var(--primary)] shadow-md'
                      : 'bg-[var(--bg-card-subtle)] border-[var(--border-color)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-base text-[var(--text-main)]">
                      {isEnglish ? p.nameEn : p.nameAr}
                    </span>
                    <span className="text-xl font-black font-mono text-[var(--text-primary)]" suppressHydrationWarning>
                      {formattedTime}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] font-tajawal">
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 2. Qibla Compass Tab */}
      {activeSubTab === 'qibla' && (
        <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm text-center space-y-6">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-black text-[var(--text-main)] font-cairo">
              {isEnglish ? 'Qibla Direction Compass' : 'بوصلة اتجاه القبلة المشرفة'}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {isEnglish
                ? `Direction towards the Holy Kaaba in Makkah from ${selectedCity.nameEn}`
                : `زاوية الاتجاه نحو الكعبة المشرفة بمكة المكرمة من مدينة ${selectedCity.nameAr}`}
            </p>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--gold-light)] text-[var(--gold)] font-bold text-xs">
              <Navigation className="w-3.5 h-3.5" />
              <span>زاوية القبلة: {qiblaAngle}° من الشمال الحقيقي</span>
            </div>
          </div>

          {/* Compass Dial UI */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto my-6">
            {/* Outer Circle Rim */}
            <div className="w-full h-full rounded-full border-4 border-[var(--border-gold)] bg-[var(--bg-card-subtle)] shadow-2xl relative flex items-center justify-center">
              {/* Compass Cardinal Points */}
              <span className="absolute top-2 text-xs font-black text-red-500 font-mono">N (شمال)</span>
              <span className="absolute bottom-2 text-xs font-black text-[var(--text-muted)] font-mono">S (جنوب)</span>
              <span className="absolute left-2 text-xs font-black text-[var(--text-muted)] font-mono">W (غرب)</span>
              <span className="absolute right-2 text-xs font-black text-[var(--text-muted)] font-mono">E (شرق)</span>

              {/* Degrees Ring Ticks */}
              <div className="w-48 h-48 rounded-full border border-dashed border-[var(--border-color)] flex items-center justify-center">
                {/* Center Kaaba Icon */}
                <div className="w-14 h-14 rounded-2xl bg-black border-2 border-[var(--gold)] shadow-lg flex items-center justify-center">
                  <span className="text-[10px] font-bold text-amber-300 font-mono">الكعبة</span>
                </div>
              </div>

              {/* Rotating Pointer to Qibla Angle */}
              <div 
                className="absolute inset-0 flex items-center justify-center transition-transform duration-500"
                style={{ transform: `rotate(${qiblaAngle - deviceHeading}deg)` }}
              >
                {/* Golden Arrow pointing up */}
                <div className="w-2 h-32 bg-gradient-to-t from-transparent via-[var(--gold)] to-[var(--gold)] rounded-t-full relative">
                  <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[20px] border-b-[var(--gold)] absolute -top-4 -left-[6px] drop-shadow-md" />
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-md mx-auto p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] leading-relaxed text-right">
            <h4 className="font-bold text-[var(--text-main)] mb-1 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[var(--gold)]" />
              <span>إرشادات ضبط دقة البوصلة:</span>
            </h4>
            <p>1. ضع الهاتف أفقياً على راحة يدك أو على سطح مستوٍ بعيداً عن المعادن والأجهزة الكهربائية.</p>
            <p>2. حرك الهاتف على شكل رقم (8) لمعايرة مستشعر البوصلة المغناطيسية إن دعت الحاجة.</p>
            <p>3. اتجاه السهم الذهبي يشير مباشرة إلى الكعبة المشرفة بمكة المكرمة حرسها الله.</p>
          </div>
        </section>
      )}

      {/* 3. Zakat Calculator Tab */}
      {activeSubTab === 'zakat' && (
        <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm space-y-6">
          <div className="pb-4 border-b border-[var(--border-color)]">
            <h2 className="text-xl font-black text-[var(--text-main)] font-cairo">
              {isEnglish ? 'Accurate Zakat Calculator' : 'حاسبة الزكاة الشرعية الدقيقة'}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {isEnglish
                ? 'Calculate Zakat al-Maal based on authentic Islamic Nisab (85g 24k Gold threshold = 2.5%)'
                : 'احسب زكاة مالك وعروض تجارتك وفق النصاب الشرعي المعتمد (85 غراماً من الذهب الخالص بنسبة ربع العشر 2.5%)'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Inputs Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                  1. الأموال النقدية والمدخرات البنكية (بالريال أو عملتك):
                </label>
                <input
                  type="number"
                  min="0"
                  value={cashAmount || ''}
                  onChange={(e) => setCashAmount(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm font-bold text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-[var(--text-main)]">
                    2. الذهب المدخر (بالغرام):
                  </label>
                  <div className="flex items-center gap-1 text-[11px]">
                    {(['24', '21', '18'] as const).map(c => (
                      <button
                        key={c}
                        onClick={() => setGoldCarat(c)}
                        className={`px-2 py-0.5 rounded-md font-bold ${goldCarat === c ? 'bg-[var(--gold)] text-white' : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)]'}`}
                      >
                        عيار {c}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="number"
                  min="0"
                  value={goldGrams || ''}
                  onChange={(e) => setGoldGrams(Number(e.target.value))}
                  placeholder="عدد الغرامات"
                  className="w-full bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm font-bold text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)]"
                />
                <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block">
                  القيمة التقديرية للذهب: {(totalGoldValue).toLocaleString()} ر.س (سعر الغرام ~{currentGoldPrice} ر.س)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                  3. عروض التجارة والأسهم المعدة للبيع:
                </label>
                <input
                  type="number"
                  min="0"
                  value={merchandiseValue || ''}
                  onChange={(e) => setMerchandiseValue(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm font-bold text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                  4. الديون العاجلة الواجب سدادها حالاً (تُخصم):
                </label>
                <input
                  type="number"
                  min="0"
                  value={debtsOwed || ''}
                  onChange={(e) => setDebtsOwed(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full bg-[var(--bg-card-subtle)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm font-bold text-[var(--text-main)] focus:outline-none focus:border-[var(--gold)]"
                />
              </div>
            </div>

            {/* Results Column */}
            <div className="bg-[var(--bg-card-subtle)] border border-[var(--border-gold)] rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--text-main)] mb-3">
                  تقرير نتيجة الحساب الشرعي:
                </h3>

                <div className="space-y-2.5 text-xs text-[var(--text-muted)] pb-4 border-b border-[var(--border-color)]">
                  <div className="flex justify-between">
                    <span>إجمالي الوعاء الزكوي الصافي:</span>
                    <strong className="text-[var(--text-main)] font-mono">{totalWealth.toLocaleString()} ر.س</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>نصاب الزكاة الشرعي (85 غرام ذهب 24k):</span>
                    <strong className="text-[var(--gold)] font-mono">~{nisabValueCash.toLocaleString()} ر.س</strong>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span>حالة بلوغ النصاب:</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${meetsNisab ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'}`}>
                      {meetsNisab ? 'بلغ النصاب الشرعي وتجب الزكاة' : 'لم يبلغ النصاب ولا تجب الزكاة'}
                    </span>
                  </div>
                </div>

                <div className="my-5 text-center p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                  <span className="text-xs text-[var(--text-muted)] block mb-1">
                    مقدار الزكاة الواجب إخراجها (2.5%):
                  </span>
                  <div className="text-3xl font-black text-[var(--text-primary)] font-mono">
                    {zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-[var(--text-muted)] bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-[var(--border-color)]">
                <strong>تنبيه شرعي:</strong> تجب الزكاة إذا بلغ المال النصاب وحال عليه الحول الهجري كاملاً (354 يوماً) وهو فائض عن الحاجات الأساسية والديون.
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Islamic Calendar Tab */}
      {activeSubTab === 'calendar' && (
        <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm space-y-6">
          <div className="pb-4 border-b border-[var(--border-color)]">
            <h2 className="text-xl font-black text-[var(--text-main)] font-cairo">
              {isEnglish ? 'Hijri Islamic Calendar & Occasions' : 'التقويم الهجري والمناسبات الإسلامية'}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {isEnglish ? 'Islamic Umm al-Qura calendar synchronizer and upcoming blessed dates' : 'تقويم أم القرى المبارك، ومواعيد المناسبات والمواسم الفاضلة'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] text-white shadow-md text-center">
              <span className="text-xs uppercase tracking-widest text-emerald-200 block mb-2 font-bold">
                اليوم في تقويم أم القرى
              </span>
              <div suppressHydrationWarning className="text-4xl font-black font-cairo mb-2">
                {hijri.formattedAr}
              </div>
              <p suppressHydrationWarning className="text-emerald-100 text-sm font-tajawal">
                الموافق لـ: {mounted ? new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm text-[var(--text-main)]">
                  {isEnglish ? 'Upcoming Islamic Occasions:' : 'أهم المناسبات والمواسم الدينية القادمة:'}
                </h3>
                <span className="text-[10px] text-[var(--gold)] font-bold bg-[var(--gold-light)] px-2 py-0.5 rounded-full">
                  {isEnglish ? 'Calculated (Umm al-Qura)' : 'محسوبة فلكياً بدقة'}
                </span>
              </div>
              {getUpcomingIslamicOccasions().slice(0, 5).map((occ) => (
                <div key={occ.id} className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-2">
                    <h4 className="text-xs font-bold text-[var(--text-main)] truncate">
                      {isEnglish ? occ.nameEn : occ.nameAr}
                    </h4>
                    <p className="text-[10px] text-[var(--text-muted)] truncate">
                      {isEnglish 
                        ? `${occ.targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • in ${occ.countdown.days} days` 
                        : `${occ.targetDate.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', year: 'numeric' })} • متبقٍ ${occ.countdown.days} يوماً`}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[var(--gold)] bg-[var(--gold-light)] px-2.5 py-1 rounded-lg shrink-0">
                    {occ.hijriDay}/{occ.hijriMonth} ({occ.targetHijriYear} هـ)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Travel Mode Tab */}
      {activeSubTab === 'travel' && (
        <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm space-y-6">
          <div className="pb-4 border-b border-[var(--border-color)]">
            <h2 className="text-xl font-black text-[var(--text-main)] font-cairo flex items-center gap-2">
              <Plane className="w-5 h-5 text-[var(--gold)]" />
              <span>{isEnglish ? 'Travel Mode & Fiqh Guidelines' : 'وضع المسافر وأحكام الرخص الشرعية'}</span>
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {isEnglish ? 'Rulings on shortening and combining prayers, and travel Duas' : 'دليل رخص السفر: قصر الصلاة الرباعية، والجمع بين الصلاتين، ودعاء السفر'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-3 text-xs leading-relaxed">
              <h3 className="font-bold text-sm text-[var(--text-main)]">
                أحكام قصر وجمع الصلاة للمسافر:
              </h3>
              <p>• <strong>مسافة القصر:</strong> تبدأ عند مفارقة بنيان البلد لمسافة تقارب 80 كم فما فوق.</p>
              <p>• <strong>قصر الصلوات الرباعية:</strong> تُصلى الظهر والعصر والعشاء ركعتين بدلاً من أربع ركعات.</p>
              <p>• <strong>الجمع بين الصلاتين:</strong> يجوز للمسافر الجمع بين الظهر والعصر (تقديماً أو تأخيراً)، وبين المغرب والعشاء (تقديماً أو تأخيراً).</p>
              <p>• <strong>صلاتا الفجر والمغرب:</strong> لا قصر فيهما؛ الفجر ركعتان والمغرب ثلاث ركعات دائماً.</p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--gold-light)]/40 border border-[var(--border-gold)] space-y-3">
              <h3 className="font-bold text-sm text-[var(--gold)]">
                دعاء السفر المأثور:
              </h3>
              <p className="font-quran text-base font-semibold text-[var(--text-main)] leading-loose">
                «اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَـذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ. اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَـذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى...»
              </p>
              <span className="text-[11px] text-[var(--text-muted)] block">
                رواه مسلم (1342)
              </span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
