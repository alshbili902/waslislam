'use client';

import React, { useState } from 'react';
import { 
  Calculator, 
  Coins, 
  Sparkles, 
  Info, 
  ShieldCheck, 
  RotateCcw, 
  HelpCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { localStore } from '../../lib/supabase';

interface ZakatCalculatorProps {
  isEnglish?: boolean;
}

export const ZakatCalculator: React.FC<ZakatCalculatorProps> = ({ isEnglish = false }) => {
  // Configurable currency & market metal rates (Default benchmark in SAR or equivalent)
  const [currency, setCurrency] = useState<string>('SAR');
  const [gold24kPrice, setGold24kPrice] = useState<number>(315); // Approximate SAR per gram
  const [silverPrice, setSilverPrice] = useState<number>(4.2);   // Approximate SAR per gram

  // User asset inputs
  const [cash, setCash] = useState<number>(0);
  const [gold24kGrams, setGold24kGrams] = useState<number>(0);
  const [gold21kGrams, setGold21kGrams] = useState<number>(0);
  const [gold18kGrams, setGold18kGrams] = useState<number>(0);
  const [silverGrams, setSilverGrams] = useState<number>(0);
  const [merchandise, setMerchandise] = useState<number>(0);
  const [debtsOwed, setDebtsOwed] = useState<number>(0);

  // Nisab threshold constants
  const GOLD_NISAB_GRAMS = 85; // 85 grams pure 24k gold
  const SILVER_NISAB_GRAMS = 595; // 595 grams pure silver

  // Calculations
  const goldNisabValue = GOLD_NISAB_GRAMS * gold24kPrice;
  const silverNisabValue = SILVER_NISAB_GRAMS * silverPrice;

  // Gold equivalent in pure 24k:
  // 21k = 21/24 (87.5%), 18k = 18/24 (75%)
  const totalGoldValue = 
    (gold24kGrams * gold24kPrice) +
    (gold21kGrams * (gold24kPrice * (21 / 24))) +
    (gold18kGrams * (gold24kPrice * (18 / 24)));

  const totalSilverValue = silverGrams * silverPrice;

  const totalGrossAssets = cash + totalGoldValue + totalSilverValue + merchandise;
  const netZakatableWealth = Math.max(0, totalGrossAssets - debtsOwed);

  // Active Nisab threshold (standard contemporary fiqh uses gold nisab or silver nisab for cash; gold is safer benchmark)
  const activeNisabThreshold = goldNisabValue;
  const isEligible = netZakatableWealth >= activeNisabThreshold;
  const zakatDue = isEligible ? Math.round(netZakatableWealth * 0.025 * 100) / 100 : 0;

  const handleReset = () => {
    setCash(0);
    setGold24kGrams(0);
    setGold21kGrams(0);
    setGold18kGrams(0);
    setSilverGrams(0);
    setMerchandise(0);
    setDebtsOwed(0);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2.5 rounded-xl bg-[var(--gold-light)] text-[var(--gold)]">
                <Calculator className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-amiri text-[var(--text-main)]">
                {isEnglish ? 'Accurate Zakat Calculator' : 'حاسبة الزكاة الشرعية الدقيقة'}
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] font-tajawal">
              {isEnglish 
                ? 'Calculate Zakat on cash, gold, silver, and business inventory with transparent Nisab standards' 
                : 'احسب زكاة مالك، ذهبك، فضتك، وعروض التجارة بشفافية وفق نصاب 85 جرام ذهب ونسبة 2.5%'}
            </p>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--border-color)] text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEnglish ? 'Reset' : 'إعادة ضبط'}</span>
          </button>
        </div>

        {/* Nisab Reference Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 mt-6 border-t border-[var(--border-color)]">
          <div className="p-4 rounded-2xl bg-[var(--gold-light)]/30 border border-[var(--border-gold)]/50 space-y-1 text-xs">
            <div className="flex items-center justify-between font-bold text-[var(--gold)]">
              <span>{isEnglish ? 'Gold Nisab (85g 24k)' : 'نصاب الذهب (85 جرام عيار 24)'}</span>
              <span>{goldNisabValue.toLocaleString()} {currency}</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              {isEnglish 
                ? `Based on ${gold24kPrice} ${currency}/gram standard benchmark.` 
                : `محسوب على تقدير ${gold24kPrice} ${currency} للجرام الصافي.`}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1 text-xs">
            <div className="flex items-center justify-between font-bold text-[var(--text-main)]">
              <span>{isEnglish ? 'Silver Nisab (595g)' : 'نصاب الفضة (595 جرام)'}</span>
              <span>{silverNisabValue.toLocaleString()} {currency}</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              {isEnglish 
                ? `Based on ${silverPrice} ${currency}/gram pure silver rate.` 
                : `محسوب على تقدير ${silverPrice} ${currency} لجرام الفضة.`}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs vs Calculation Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (Inputs Form - 2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Section 1: Cash & Liquid Balances */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
              <Coins className="w-4 h-4 text-[var(--gold)]" />
              <span>{isEnglish ? '1. Cash & Bank Balances' : '1. السيولة النقدية والأرصدة البنكية'}</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs text-[var(--text-muted)] font-medium">
                {isEnglish ? `Total savings held for one lunar year (${currency}):` : `مجموع الأموال المدخرة التي حال عليها الحول (${currency}):`}
              </label>
              <input
                type="number"
                min="0"
                value={cash || ''}
                onChange={(e) => setCash(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-sm font-bold focus:outline-none focus:border-[var(--gold)] text-[var(--text-main)]"
              />
            </div>
          </div>

          {/* Section 2: Gold & Silver Assets */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--gold)]" />
              <span>{isEnglish ? '2. Gold & Silver Holdings' : '2. مدخرات الذهب والفضة (بالجرام)'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--text-muted)] font-medium">
                  {isEnglish ? 'Gold 24k (grams):' : 'ذهب عيار 24 (جرام):'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={gold24kGrams || ''}
                  onChange={(e) => setGold24kGrams(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs font-bold focus:outline-none focus:border-[var(--gold)] text-[var(--text-main)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[var(--text-muted)] font-medium">
                  {isEnglish ? 'Gold 21k (grams):' : 'ذهب عيار 21 (جرام):'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={gold21kGrams || ''}
                  onChange={(e) => setGold21kGrams(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs font-bold focus:outline-none focus:border-[var(--gold)] text-[var(--text-main)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[var(--text-muted)] font-medium">
                  {isEnglish ? 'Gold 18k (grams):' : 'ذهب عيار 18 (جرام):'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={gold18kGrams || ''}
                  onChange={(e) => setGold18kGrams(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs font-bold focus:outline-none focus:border-[var(--gold)] text-[var(--text-main)]"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs text-[var(--text-muted)] font-medium">
                {isEnglish ? 'Pure Silver (grams):' : 'فضة مدخرة (جرام):'}
              </label>
              <input
                type="number"
                min="0"
                value={silverGrams || ''}
                onChange={(e) => setSilverGrams(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs font-bold focus:outline-none focus:border-[var(--gold)] text-[var(--text-main)]"
              />
            </div>
          </div>

          {/* Section 3: Trade Goods & Deductible Debts */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--gold)]" />
              <span>{isEnglish ? '3. Business Inventory & Debts' : '3. عروض التجارة والديون الحالة'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--text-muted)] font-medium">
                  {isEnglish ? `Trade Goods Market Value (${currency}):` : `قيمة البضائع المعدة للبيع والتجارة (${currency}):`}
                </label>
                <input
                  type="number"
                  min="0"
                  value={merchandise || ''}
                  onChange={(e) => setMerchandise(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs font-bold focus:outline-none focus:border-[var(--gold)] text-[var(--text-main)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-red-500 font-medium">
                  {isEnglish ? `Immediate Debts Owed (${currency}):` : `ديون مستحقة السداد عليك (${currency}):`}
                </label>
                <input
                  type="number"
                  min="0"
                  value={debtsOwed || ''}
                  onChange={(e) => setDebtsOwed(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs font-bold focus:outline-none focus:border-[var(--gold)] text-[var(--text-main)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right (Calculation Summary Card - 1 col) */}
        <div className="space-y-4">
          <div className="bg-gradient-to-b from-[var(--bg-card)] via-[var(--bg-card)] to-[var(--bg-card-subtle)] border border-[var(--border-gold)]/60 rounded-3xl p-6 sm:p-7 shadow-lg space-y-6">
            <div className="space-y-1 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--gold)]">
                {isEnglish ? 'Zakat Output' : 'نتيجة الحساب الشرعي'}
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold font-tajawal text-[var(--text-main)] mt-1">
                {zakatDue.toLocaleString()} {currency}
              </div>
              <div className="text-xs text-[var(--text-muted)] font-tajawal">
                {isEligible 
                  ? (isEnglish ? 'Zakat is obligatory (Reached Nisab)' : 'بلغ النصاب وحال عليه الحول — المقدار الواجب إخراجه')
                  : (isEnglish ? 'Wealth is below Nisab threshold (No Zakat due)' : 'لم يبلغ النصاب الشرعي بعد (لا تجب فيه الزكاة)')}
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="space-y-2 pt-4 border-t border-[var(--border-color)] text-xs">
              <div className="flex items-center justify-between text-[var(--text-muted)]">
                <span>{isEnglish ? 'Gross Assets:' : 'إجمالي الأصول:'}</span>
                <span className="font-bold text-[var(--text-main)]">{totalGrossAssets.toLocaleString()} {currency}</span>
              </div>
              <div className="flex items-center justify-between text-red-500">
                <span>{isEnglish ? 'Deducted Debts:' : 'الديون المخصومة:'}</span>
                <span className="font-bold">-{debtsOwed.toLocaleString()} {currency}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-[var(--border-color)] font-bold text-[var(--text-main)]">
                <span>{isEnglish ? 'Net Zakatable Wealth:' : 'الوعاء الزكوي الصافي:'}</span>
                <span>{netZakatableWealth.toLocaleString()} {currency}</span>
              </div>
              <div className="flex items-center justify-between text-[var(--gold)] font-bold pt-1">
                <span>{isEnglish ? 'Gold Nisab Threshold:' : 'حد النصاب الشرعي:'}</span>
                <span>{goldNisabValue.toLocaleString()} {currency}</span>
              </div>
            </div>

            {/* Status Indicator Banner */}
            <div className={`p-4 rounded-2xl text-xs font-tajawal leading-relaxed ${
              isEligible
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                : 'bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300'
            }`}>
              {isEligible ? (
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>
                    {isEnglish 
                      ? 'Congratulations on your purification. Ensure payment to the eight eligible recipients specified in Surah At-Tawbah (Ayah 60).'
                      : 'طهور وبركة لمالك بإذن الله. احرص على دفع الزكاة لمصارفها الثمانية المذكورة في سورة التوبة (الفقراء، المساكين، والعاملين عليها...).'}
                  </span>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    {isEnglish 
                      ? 'Your net wealth has not reached the minimum threshold (Nisab) of 85 grams of gold.'
                      : 'أموالك الصافية دون حد النصاب (85 جرام ذهب)، ولا تجب عليك الزكاة حالياً؛ والصدقة التطوعية مستحبة دائماً.'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Fiqh Guidance Note */}
          <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[var(--text-main)]">
              <HelpCircle className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span>{isEnglish ? 'Fiqh Ruling Caveat' : 'تنبيه فقهي معتبر:'}</span>
            </div>
            <p className="leading-relaxed">
              ذهب جمهور الفقهاء إلى أن حلي المرأة المعد للاستعمال والزينة الشخصية المعتادة لا زكاة فيه، بينما أوجب بعض العلماء فيه الزكاة إذا بلغ النصاب. وهذه الحاسبة تتبع رأي الاحتياط في المدخرات.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
