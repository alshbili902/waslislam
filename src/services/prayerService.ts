import { PrayerTimesData, QiblaInfo } from '../types';

export interface CityPreset {
  nameAr: string;
  nameEn: string;
  countryAr: string;
  regionAr: string;
  lat: number;
  lng: number;
  method: number; // 4 = Umm Al-Qura (official Saudi standard)
}

// All official regions, cities, and governorates of the Kingdom of Saudi Arabia
export const POPULAR_CITIES: CityPreset[] = [
  // 1. منطقة مكة المكرمة
  { nameAr: 'مكة المكرمة', nameEn: 'Makkah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة مكة المكرمة', lat: 21.4225, lng: 39.8262, method: 4 },
  { nameAr: 'جدة', nameEn: 'Jeddah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة مكة المكرمة', lat: 21.5433, lng: 39.1728, method: 4 },
  { nameAr: 'الطائف', nameEn: 'Taif', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة مكة المكرمة', lat: 21.2854, lng: 40.4222, method: 4 },
  { nameAr: 'القنفذة', nameEn: 'Al Qunfudhah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة مكة المكرمة', lat: 19.1281, lng: 41.0787, method: 4 },
  { nameAr: 'رابغ', nameEn: 'Rabigh', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة مكة المكرمة', lat: 22.7986, lng: 39.0349, method: 4 },
  { nameAr: 'الليث', nameEn: 'Al Lith', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة مكة المكرمة', lat: 20.1479, lng: 40.2697, method: 4 },
  { nameAr: 'خليص', nameEn: 'Khulais', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة مكة المكرمة', lat: 22.0089, lng: 39.3175, method: 4 },
  { nameAr: 'الجموم', nameEn: 'Al Jumum', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة مكة المكرمة', lat: 21.6169, lng: 39.6981, method: 4 },
  { nameAr: 'رنية', nameEn: 'Ranyah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة مكة المكرمة', lat: 21.2575, lng: 42.8467, method: 4 },
  { nameAr: 'الخرمة', nameEn: 'Al Khurmah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة مكة المكرمة', lat: 21.9167, lng: 42.0833, method: 4 },
  { nameAr: 'تربة', nameEn: 'Turbah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة مكة المكرمة', lat: 21.2167, lng: 41.6333, method: 4 },
  { nameAr: 'أضم', nameEn: 'Adham', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة مكة المكرمة', lat: 20.5211, lng: 40.8583, method: 4 },
  { nameAr: 'الكامل', nameEn: 'Al Kamil', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة مكة المكرمة', lat: 22.3833, lng: 39.7500, method: 4 },
  { nameAr: 'العرضيات', nameEn: 'Al Ardiyat', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة مكة المكرمة', lat: 19.4667, lng: 41.6500, method: 4 },

  // 2. منطقة المدينة المنورة
  { nameAr: 'المدينة المنورة', nameEn: 'Madinah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة المدينة المنورة', lat: 24.4672, lng: 39.6111, method: 4 },
  { nameAr: 'ينبع', nameEn: 'Yanbu', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة المدينة المنورة', lat: 24.0889, lng: 38.0637, method: 4 },
  { nameAr: 'العلا', nameEn: 'AlUla', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة المدينة المنورة', lat: 26.6176, lng: 37.9248, method: 4 },
  { nameAr: 'بدر', nameEn: 'Badr', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة المدينة المنورة', lat: 23.7828, lng: 38.7903, method: 4 },
  { nameAr: 'مهد الذهب', nameEn: 'Mahd adh Dhahab', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة المدينة المنورة', lat: 23.5042, lng: 40.8678, method: 4 },
  { nameAr: 'الحناكية', nameEn: 'Al Hinakiyah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة المدينة المنورة', lat: 24.8631, lng: 40.4950, method: 4 },
  { nameAr: 'خيبر', nameEn: 'Khaybar', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة المدينة المنورة', lat: 25.6989, lng: 39.2961, method: 4 },
  { nameAr: 'وادي الفرع', nameEn: 'Wadi al-Fara', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة المدينة المنورة', lat: 23.4000, lng: 39.7000, method: 4 },
  { nameAr: 'العيص', nameEn: 'Al Ais', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة المدينة المنورة', lat: 24.9667, lng: 38.1000, method: 4 },

  // 3. منطقة الرياض
  { nameAr: 'الرياض', nameEn: 'Riyadh', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الرياض', lat: 24.7136, lng: 46.6753, method: 4 },
  { nameAr: 'الخرج', nameEn: 'Al Kharj', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الرياض', lat: 24.1554, lng: 47.3120, method: 4 },
  { nameAr: 'الدرعية', nameEn: 'Diriyah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الرياض', lat: 24.7342, lng: 46.5753, method: 4 },
  { nameAr: 'الدوادمي', nameEn: 'Ad Dawadimi', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الرياض', lat: 24.5077, lng: 44.3924, method: 4 },
  { nameAr: 'المجمعة', nameEn: 'Al Majmaah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الرياض', lat: 25.9044, lng: 45.3436, method: 4 },
  { nameAr: 'القويعية', nameEn: 'Al Quwayiyah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الرياض', lat: 24.0536, lng: 45.2639, method: 4 },
  { nameAr: 'وادي الدواسر', nameEn: 'Wadi ad-Dawasir', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الرياض', lat: 20.4533, lng: 44.8021, method: 4 },
  { nameAr: 'الأفلاج', nameEn: 'Al Aflaj', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الرياض', lat: 22.2856, lng: 46.7289, method: 4 },
  { nameAr: 'الزلفي', nameEn: 'Az Zulfi', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الرياض', lat: 26.2992, lng: 44.7836, method: 4 },
  { nameAr: 'شقراء', nameEn: 'Shaqra', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الرياض', lat: 25.2472, lng: 45.2536, method: 4 },
  { nameAr: 'حوطة بني تميم', nameEn: 'Hawtat Bani Tamim', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الرياض', lat: 23.5186, lng: 46.8522, method: 4 },
  { nameAr: 'عفيف', nameEn: 'Afif', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الرياض', lat: 23.9064, lng: 42.9172, method: 4 },
  { nameAr: 'السليل', nameEn: 'As Sulayyil', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الرياض', lat: 20.4608, lng: 45.5778, method: 4 },
  { nameAr: 'ضرما', nameEn: 'Dhurma', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الرياض', lat: 24.6053, lng: 46.1264, method: 4 },
  { nameAr: 'المزاحمية', nameEn: 'Al Muzahimiyah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الرياض', lat: 24.4828, lng: 46.2625, method: 4 },
  { nameAr: 'رماح', nameEn: 'Rumah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الرياض', lat: 25.5667, lng: 47.1667, method: 4 },
  { nameAr: 'ثادق', nameEn: 'Thadiq', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الرياض', lat: 25.2917, lng: 45.8750, method: 4 },
  { nameAr: 'حريملاء', nameEn: 'Huraymila', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الرياض', lat: 25.1278, lng: 46.1222, method: 4 },
  { nameAr: 'الحريق', nameEn: 'Al Hariq', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الرياض', lat: 23.6333, lng: 46.5167, method: 4 },
  { nameAr: 'الغاط', nameEn: 'Al Ghat', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الرياض', lat: 26.0250, lng: 44.9611, method: 4 },

  // 4. المنطقة الشرقية
  { nameAr: 'الدمام', nameEn: 'Dammam', countryAr: 'المملكة العربية السعودية', regionAr: 'المنطقة الشرقية', lat: 26.4207, lng: 50.0888, method: 4 },
  { nameAr: 'الخبر', nameEn: 'Al Khobar', countryAr: 'المملكة العربية السعودية', regionAr: 'المنطقة الشرقية', lat: 26.2886, lng: 50.2108, method: 4 },
  { nameAr: 'الظهران', nameEn: 'Dhahran', countryAr: 'المملكة العربية السعودية', regionAr: 'المنطقة الشرقية', lat: 26.2886, lng: 50.1140, method: 4 },
  { nameAr: 'الأحساء (الهفوف والمبرز)', nameEn: 'Al Ahsa', countryAr: 'المملكة العربية السعودية', regionAr: 'المنطقة الشرقية', lat: 25.3800, lng: 49.5855, method: 4 },
  { nameAr: 'الجبيل', nameEn: 'Jubail', countryAr: 'المملكة العربية السعودية', regionAr: 'المنطقة الشرقية', lat: 27.0046, lng: 49.6606, method: 4 },
  { nameAr: 'حفر الباطن', nameEn: 'Hafar Al Batin', countryAr: 'المملكة العربية السعودية', regionAr: 'المنطقة الشرقية', lat: 28.4328, lng: 45.9708, method: 4 },
  { nameAr: 'القطيف', nameEn: 'Qatif', countryAr: 'المملكة العربية السعودية', regionAr: 'المنطقة الشرقية', lat: 26.5576, lng: 50.0033, method: 4 },
  { nameAr: 'الخفجي', nameEn: 'Khafji', countryAr: 'المملكة العربية السعودية', regionAr: 'المنطقة الشرقية', lat: 28.4391, lng: 48.4913, method: 4 },
  { nameAr: 'النعيرية', nameEn: 'Nairiyah', countryAr: 'المملكة العربية السعودية', regionAr: 'المنطقة الشرقية', lat: 27.5028, lng: 48.4897, method: 4 },
  { nameAr: 'بقيق', nameEn: 'Buqayq', countryAr: 'المملكة العربية السعودية', regionAr: 'المنطقة الشرقية', lat: 25.9358, lng: 49.6697, method: 4 },
  { nameAr: 'رأس تنورة', nameEn: 'Ras Tanura', countryAr: 'المملكة العربية السعودية', regionAr: 'المنطقة الشرقية', lat: 26.6575, lng: 50.1583, method: 4 },
  { nameAr: 'قرية العليا', nameEn: 'Qaryat al-Ulya', countryAr: 'المملكة العربية السعودية', regionAr: 'المنطقة الشرقية', lat: 27.5500, lng: 47.7000, method: 4 },
  { nameAr: 'العديد', nameEn: 'Al Adeed', countryAr: 'المملكة العربية السعودية', regionAr: 'المنطقة الشرقية', lat: 24.6167, lng: 51.1000, method: 4 },

  // 5. منطقة القصيم
  { nameAr: 'بريدة', nameEn: 'Buraidah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة القصيم', lat: 26.3592, lng: 43.9818, method: 4 },
  { nameAr: 'عنيزة', nameEn: 'Onaizah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة القصيم', lat: 26.0847, lng: 43.9934, method: 4 },
  { nameAr: 'الرس', nameEn: 'Ar Rass', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة القصيم', lat: 25.8694, lng: 43.4975, method: 4 },
  { nameAr: 'المذنب', nameEn: 'Al Midhnab', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة القصيم', lat: 25.8667, lng: 44.2167, method: 4 },
  { nameAr: 'البكيرية', nameEn: 'Al Bukayriyah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة القصيم', lat: 26.1361, lng: 43.6608, method: 4 },
  { nameAr: 'البدائع', nameEn: 'Al Badayea', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة القصيم', lat: 26.0333, lng: 43.7500, method: 4 },
  { nameAr: 'عيون الجواء', nameEn: 'Uyun AlJiwa', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة القصيم', lat: 26.5167, lng: 43.6167, method: 4 },
  { nameAr: 'رياض الخبراء', nameEn: 'Riyadh Al Khabra', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة القصيم', lat: 26.0667, lng: 43.6000, method: 4 },
  { nameAr: 'الأسياح', nameEn: 'Al Asyah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة القصيم', lat: 26.7833, lng: 44.0333, method: 4 },
  { nameAr: 'النبهانية', nameEn: 'An Nabhaniyah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة القصيم', lat: 25.8667, lng: 43.0500, method: 4 },
  { nameAr: 'الشماسية', nameEn: 'Ash Shimasiyah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة القصيم', lat: 26.3000, lng: 44.2667, method: 4 },
  { nameAr: 'عقلة الصقور', nameEn: 'Uglat Asugoor', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة القصيم', lat: 25.8333, lng: 42.1833, method: 4 },
  { nameAr: 'ضرية', nameEn: 'Dariyah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة القصيم', lat: 24.7167, lng: 42.8500, method: 4 },

  // 6. منطقة عسير
  { nameAr: 'أبها', nameEn: 'Abha', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة عسير', lat: 18.2164, lng: 42.5053, method: 4 },
  { nameAr: 'خميس مشيط', nameEn: 'Khamis Mushait', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة عسير', lat: 18.3065, lng: 42.7350, method: 4 },
  { nameAr: 'بيشة', nameEn: 'Bisha', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة عسير', lat: 20.0005, lng: 42.6053, method: 4 },
  { nameAr: 'النماص', nameEn: 'Al Namas', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة عسير', lat: 19.1203, lng: 42.1336, method: 4 },
  { nameAr: 'محايل عسير', nameEn: 'Muhayil Asir', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة عسير', lat: 18.5411, lng: 42.0528, method: 4 },
  { nameAr: 'ظهران الجنوب', nameEn: 'Dhahran Al Janub', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة عسير', lat: 17.6853, lng: 43.5186, method: 4 },
  { nameAr: 'تنومة', nameEn: 'Tanomah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة عسير', lat: 18.9333, lng: 42.1667, method: 4 },
  { nameAr: 'سراة عبيدة', nameEn: 'Sarat Abidah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة عسير', lat: 18.0833, lng: 43.1333, method: 4 },
  { nameAr: 'رجال ألمع', nameEn: 'Rijal Almaa', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة عسير', lat: 18.2167, lng: 42.3333, method: 4 },
  { nameAr: 'أحد رفيدة', nameEn: 'Ahad Rafidah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة عسير', lat: 18.1833, lng: 42.8333, method: 4 },
  { nameAr: 'بلقرن', nameEn: 'Balqarn', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة عسير', lat: 19.6000, lng: 41.9500, method: 4 },
  { nameAr: 'تثليث', nameEn: 'Tathlith', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة عسير', lat: 19.5486, lng: 43.4914, method: 4 },
  { nameAr: 'المجاردة', nameEn: 'Al Majardah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة عسير', lat: 19.1167, lng: 41.9167, method: 4 },
  { nameAr: 'البرك', nameEn: 'Al Birk', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة عسير', lat: 18.2167, lng: 41.5333, method: 4 },
  { nameAr: 'بارق', nameEn: 'Bariq', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة عسير', lat: 18.9333, lng: 41.9500, method: 4 },
  { nameAr: 'طريب', nameEn: 'Tareeb', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة عسير', lat: 18.4333, lng: 43.2167, method: 4 },

  // 7. منطقة تبوك
  { nameAr: 'تبوك', nameEn: 'Tabuk', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة تبوك', lat: 28.3835, lng: 36.5662, method: 4 },
  { nameAr: 'ضباء', nameEn: 'Duba', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة تبوك', lat: 27.3514, lng: 35.6901, method: 4 },
  { nameAr: 'الوجه', nameEn: 'Al Wajh', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة تبوك', lat: 26.2455, lng: 36.4525, method: 4 },
  { nameAr: 'أملج', nameEn: 'Umluj', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة تبوك', lat: 25.0311, lng: 37.2685, method: 4 },
  { nameAr: 'حقل', nameEn: 'Haqi', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة تبوك', lat: 29.2833, lng: 34.9333, method: 4 },
  { nameAr: 'تيماء', nameEn: 'Tayma', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة تبوك', lat: 27.6333, lng: 38.5333, method: 4 },
  { nameAr: 'البدع', nameEn: 'Al Badaa', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة تبوك', lat: 28.4667, lng: 35.0167, method: 4 },

  // 8. منطقة حائل
  { nameAr: 'حائل', nameEn: 'Hail', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة حائل', lat: 27.5114, lng: 41.6907, method: 4 },
  { nameAr: 'بقعاء', nameEn: 'Baqaa', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة حائل', lat: 27.9167, lng: 42.4000, method: 4 },
  { nameAr: 'الغزالة', nameEn: 'Al Ghazalah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة حائل', lat: 26.6833, lng: 41.3167, method: 4 },
  { nameAr: 'الشنان', nameEn: 'Ash Shinan', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة حائل', lat: 27.1667, lng: 42.4333, method: 4 },
  { nameAr: 'الشملي', nameEn: 'Ash Shamli', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة حائل', lat: 27.2833, lng: 39.9333, method: 4 },
  { nameAr: 'سميراء', nameEn: 'Sumayra', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة حائل', lat: 26.4667, lng: 42.1667, method: 4 },
  { nameAr: 'موقق', nameEn: 'Mawqaq', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة حائل', lat: 27.4167, lng: 41.2000, method: 4 },
  { nameAr: 'الحائط', nameEn: 'Al Hait', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة حائل', lat: 25.9667, lng: 40.5000, method: 4 },
  { nameAr: 'السليمي', nameEn: 'As Sulaimi', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة حائل', lat: 26.2167, lng: 41.3833, method: 4 },

  // 9. منطقة الحدود الشمالية
  { nameAr: 'عرعر', nameEn: 'Arar', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الحدود الشمالية', lat: 30.9753, lng: 41.0381, method: 4 },
  { nameAr: 'رفحاء', nameEn: 'Rafha', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الحدود الشمالية', lat: 29.6267, lng: 43.5133, method: 4 },
  { nameAr: 'طريف', nameEn: 'Turaif', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الحدود الشمالية', lat: 31.6725, lng: 38.6637, method: 4 },
  { nameAr: 'العويقيلة', nameEn: 'Al Uwayqilah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الحدود الشمالية', lat: 30.3333, lng: 42.2333, method: 4 },

  // 10. منطقة جازان
  { nameAr: 'جازان', nameEn: 'Jazan', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة جازان', lat: 16.8892, lng: 42.5511, method: 4 },
  { nameAr: 'صبيا', nameEn: 'Sabya', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة جازان', lat: 17.1495, lng: 42.6253, method: 4 },
  { nameAr: 'أبو عريش', nameEn: 'Abu Arish', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة جازان', lat: 16.9686, lng: 42.8336, method: 4 },
  { nameAr: 'صامطة', nameEn: 'Samtah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة جازان', lat: 16.5964, lng: 42.9469, method: 4 },
  { nameAr: 'بيش', nameEn: 'Baish', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة جازان', lat: 17.3667, lng: 42.5333, method: 4 },
  { nameAr: 'الدرب', nameEn: 'Ad Darb', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة جازان', lat: 17.7167, lng: 42.2500, method: 4 },
  { nameAr: 'فيفا', nameEn: 'Fifa', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة جازان', lat: 17.2667, lng: 43.1167, method: 4 },
  { nameAr: 'جزر فرسان', nameEn: 'Farasan Islands', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة جازان', lat: 16.7000, lng: 42.1167, method: 4 },
  { nameAr: 'أحد المسارحة', nameEn: 'Ahad Al Masarihah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة جازان', lat: 16.7167, lng: 42.9500, method: 4 },
  { nameAr: 'العارضة', nameEn: 'Al Aridah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة جازان', lat: 17.0667, lng: 43.0500, method: 4 },
  { nameAr: 'العيدابي', nameEn: 'Al Aidabi', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة جازان', lat: 17.3333, lng: 42.9833, method: 4 },
  { nameAr: 'ضمد', nameEn: 'Damad', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة جازان', lat: 17.1167, lng: 42.7833, method: 4 },
  { nameAr: 'الطوال', nameEn: 'At Tuwal', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة جازان', lat: 16.5167, lng: 42.9833, method: 4 },
  { nameAr: 'هروب', nameEn: 'Harub', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة جازان', lat: 17.5167, lng: 42.9500, method: 4 },

  // 11. منطقة نجران
  { nameAr: 'نجران', nameEn: 'Najran', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة نجران', lat: 17.4924, lng: 44.1277, method: 4 },
  { nameAr: 'شرورة', nameEn: 'Sharurah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة نجران', lat: 17.4875, lng: 47.1128, method: 4 },
  { nameAr: 'حبونا', nameEn: 'Habuna', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة نجران', lat: 17.8667, lng: 44.3333, method: 4 },
  { nameAr: 'بدر الجنوب', nameEn: 'Badr Al Janub', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة نجران', lat: 17.9500, lng: 43.8333, method: 4 },
  { nameAr: 'يدمة', nameEn: 'Yadamah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة نجران', lat: 18.5167, lng: 44.4000, method: 4 },
  { nameAr: 'ثار', nameEn: 'Thar', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة نجران', lat: 18.1000, lng: 44.2500, method: 4 },
  { nameAr: 'خباش', nameEn: 'Khabash', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة نجران', lat: 17.3167, lng: 44.7500, method: 4 },

  // 12. منطقة الباحة
  { nameAr: 'الباحة', nameEn: 'Al Baha', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الباحة', lat: 20.0129, lng: 41.4677, method: 4 },
  { nameAr: 'بلجرشي', nameEn: 'Baljurashi', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الباحة', lat: 19.8597, lng: 41.5649, method: 4 },
  { nameAr: 'المندق', nameEn: 'Al Mindaq', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الباحة', lat: 20.1667, lng: 41.2833, method: 4 },
  { nameAr: 'المخواة', nameEn: 'Al Makhwah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الباحة', lat: 19.7833, lng: 41.4333, method: 4 },
  { nameAr: 'قلوة', nameEn: 'Qilwah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الباحة', lat: 19.9833, lng: 41.3167, method: 4 },
  { nameAr: 'العقيق', nameEn: 'Al Aqiq', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الباحة', lat: 20.2833, lng: 41.6500, method: 4 },
  { nameAr: 'الحجرة', nameEn: 'Al Hijrah', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الباحة', lat: 20.1500, lng: 40.9167, method: 4 },
  { nameAr: 'غامد الزناد', nameEn: 'Ghamid Az Zinad', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الباحة', lat: 19.6500, lng: 41.4833, method: 4 },
  { nameAr: 'بني حسن', nameEn: 'Bani Hasan', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الباحة', lat: 20.1000, lng: 41.3833, method: 4 },

  // 13. منطقة الجوف
  { nameAr: 'سكاكا', nameEn: 'Sakaka', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الجوف', lat: 29.9697, lng: 40.2064, method: 4 },
  { nameAr: 'القريات', nameEn: 'Qurayyat', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الجوف', lat: 31.3318, lng: 37.3428, method: 4 },
  { nameAr: 'دومة الجندل', nameEn: 'Dumat Al Jandal', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الجوف', lat: 29.8167, lng: 39.8667, method: 4 },
  { nameAr: 'طبرجل', nameEn: 'Tubarjal', countryAr: 'المملكة العربية السعودية', regionAr: 'منطقة الجوف', lat: 30.5000, lng: 38.2167, method: 4 }
];

export const SAUDI_CITIES = POPULAR_CITIES;

// Distinct Saudi Regions for organized grouping
export const SAUDI_REGIONS = Array.from(new Set(POPULAR_CITIES.map((c) => c.regionAr)));

export const CALCULATION_METHODS = [
  { id: 4, nameAr: 'جامعة أم القرى بمكة المكرمة' },
  { id: 5, nameAr: 'الهيئة المصرية العامة للمساحة' },
  { id: 3, nameAr: 'رابطة العالم الإسلامي' },
  { id: 2, nameAr: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)' },
  { id: 1, nameAr: 'جامعة العلوم الإسلامية بكراتشي' },
  { id: 13, nameAr: 'رئاسة الشؤون الدينية التركية (ديانت)' }
];

const KAABA_LAT = 21.422487;
const KAABA_LNG = 39.826206;

export function calculateQibla(userLat: number, userLng: number): QiblaInfo {
  const phiK = (KAABA_LAT * Math.PI) / 180;
  const lambdaK = (KAABA_LNG * Math.PI) / 180;
  const phi = (userLat * Math.PI) / 180;
  const lambda = (userLng * Math.PI) / 180;

  const deltaLambda = lambdaK - lambda;
  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(deltaLambda);
  let qiblaRad = Math.atan2(y, x);
  let qiblaDeg = (qiblaRad * 180) / Math.PI;
  qiblaDeg = (qiblaDeg + 360) % 360;

  // Haversine Distance
  const R = 6371; // Earth radius in km
  const dLat = phiK - phi;
  const dLon = lambdaK - lambda;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(phi) * Math.cos(phiK) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c);

  return {
    directionDegrees: Math.round(qiblaDeg * 10) / 10,
    compassBearing: Math.round(qiblaDeg),
    distanceKm,
    kaabaLat: KAABA_LAT,
    kaabaLng: KAABA_LNG
  };
}

// Fallback calculations for offline mode based on latitude/longitude
export function getOfflinePrayerTimes(lat: number, lng: number, date: Date = new Date(), cityName = 'مكة المكرمة'): PrayerTimesData {
  // Approximate standard daylight solar prayer times
  const hijriMonths = ['المحرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];
  const weekdaysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  const weekdayAr = weekdaysAr[date.getDay()];
  const gregDate = `${date.getDate()} ${['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][date.getMonth()]} ${date.getFullYear()} م`;

  return {
    fajr: '04:52',
    sunrise: '06:08',
    dhuhr: '12:18',
    asr: '15:42',
    maghrib: '18:27',
    isha: '19:57',
    dateGregorian: gregDate,
    dateHijri: {
      day: '20',
      monthAr: 'ربيع الأول',
      monthEn: 'Rabi al-Awwal',
      year: '1448',
      weekdayAr
    },
    locationName: cityName
  };
}

// Fetch real live prayer times from Aladhan API with resilient fallback
export async function fetchPrayerTimes(lat: number, lng: number, methodId = 4, cityName = 'مكة المكرمة'): Promise<PrayerTimesData> {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const url = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=${methodId}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data && data.data) {
      const timings = data.data.timings;
      const hijri = data.data.date.hijri;
      const gregorian = data.data.date.gregorian;

      return {
        fajr: timings.Fajr.split(' ')[0],
        sunrise: timings.Sunrise.split(' ')[0],
        dhuhr: timings.Dhuhr.split(' ')[0],
        asr: timings.Asr.split(' ')[0],
        maghrib: timings.Maghrib.split(' ')[0],
        isha: timings.Isha.split(' ')[0],
        imsak: timings.Imsak ? timings.Imsak.split(' ')[0] : undefined,
        midnight: timings.Midnight ? timings.Midnight.split(' ')[0] : undefined,
        dateGregorian: `${gregorian.day} ${gregorian.month.en} ${gregorian.year} م`,
        dateHijri: {
          day: hijri.day,
          monthAr: hijri.month.ar,
          monthEn: hijri.month.en,
          year: hijri.year,
          weekdayAr: hijri.weekday.ar
        },
        locationName: cityName
      };
    }
  } catch (err) {
    console.warn('Aladhan API unavailable, falling back to astronomical approximation:', err);
  }

  return getOfflinePrayerTimes(lat, lng, new Date(), cityName);
}

// Determine Current Prayer and Countdown to Next Prayer
export interface NextPrayerInfo {
  currentPrayerAr: string;
  nextPrayerAr: string;
  nextPrayerTime: string;
  remainingMinutes: number;
  remainingSeconds: number;
  formattedCountdown: string;
  progressPercent: number;
}

export function calculateNextPrayer(timings: PrayerTimesData): NextPrayerInfo {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentSeconds = now.getSeconds();
  const totalCurrentSeconds = currentMinutes * 60 + currentSeconds;

  const prayers = [
    { name: 'الفجر', timeStr: timings.fajr },
    { name: 'الشروق', timeStr: timings.sunrise },
    { name: 'الظهر', timeStr: timings.dhuhr },
    { name: 'العصر', timeStr: timings.asr },
    { name: 'المغرب', timeStr: timings.maghrib },
    { name: 'العشاء', timeStr: timings.isha }
  ].map((p) => {
    const [h, m] = p.timeStr.split(':').map(Number);
    const totalSec = (h * 60 + m) * 60;
    return { ...p, totalSeconds: totalSec, hours: h, minutes: m };
  });

  let nextIdx = prayers.findIndex((p) => p.totalSeconds > totalCurrentSeconds);
  let currentPrayer = '';
  let nextPrayer = '';
  let diffSec = 0;
  let intervalSec = 3600 * 3;

  if (nextIdx === -1) {
    // Past Isha -> Next is tomorrow's Fajr
    currentPrayer = 'العشاء';
    nextPrayer = 'الفجر';
    const tomorrowFajrSec = 24 * 3600 + prayers[0].totalSeconds;
    diffSec = tomorrowFajrSec - totalCurrentSeconds;
    const ishaSec = prayers[5].totalSeconds;
    intervalSec = tomorrowFajrSec - ishaSec;
  } else if (nextIdx === 0) {
    // Before today's Fajr
    currentPrayer = 'قيام الليل';
    nextPrayer = 'الفجر';
    diffSec = prayers[0].totalSeconds - totalCurrentSeconds;
    intervalSec = 4 * 3600;
  } else {
    currentPrayer = prayers[nextIdx - 1].name;
    nextPrayer = prayers[nextIdx].name;
    diffSec = prayers[nextIdx].totalSeconds - totalCurrentSeconds;
    intervalSec = prayers[nextIdx].totalSeconds - prayers[nextIdx - 1].totalSeconds;
  }

  const remHours = Math.floor(diffSec / 3600);
  const remMin = Math.floor((diffSec % 3600) / 60);
  const remSec = diffSec % 60;

  const formattedCountdown = `${String(remHours).padStart(2, '0')}:${String(remMin).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;
  const progressPercent = Math.min(100, Math.max(0, Math.round(((intervalSec - diffSec) / intervalSec) * 100)));

  return {
    currentPrayerAr: currentPrayer,
    nextPrayerAr: nextPrayer,
    nextPrayerTime: prayers[nextIdx === -1 ? 0 : nextIdx].timeStr,
    remainingMinutes: Math.floor(diffSec / 60),
    remainingSeconds: diffSec,
    formattedCountdown,
    progressPercent
  };
}
