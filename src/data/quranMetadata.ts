import { Reciter, SurahMeta, TafsirSource } from '../types';

export const RECITERS_LIST: Reciter[] = [
  {
    id: 'ar.alafasy',
    nameAr: 'مشاري بن راشد العفاسي',
    nameEn: 'Mishary Rashid Alafasy',
    subfolder: 'ar.alafasy',
    bitrate: '128'
  },
  {
    id: 'ar.abdulbasitmurattal',
    nameAr: 'عبد الباسط عبد الصمد (مرتل)',
    nameEn: 'Abdul Basit Murattal',
    subfolder: 'ar.abdulbasitmurattal',
    bitrate: '128'
  },
  {
    id: 'ar.husary',
    nameAr: 'محمود خليل الحصري',
    nameEn: 'Mahmoud Khalil Al-Hussary',
    subfolder: 'ar.husary',
    bitrate: '128'
  },
  {
    id: 'ar.minshawi',
    nameAr: 'محمد صديق المنشاوي (مرتل)',
    nameEn: 'Mohamed Siddiq Al-Minshawi',
    subfolder: 'ar.minshawi',
    bitrate: '128'
  },
  {
    id: 'ar.saadalghamdi',
    nameAr: 'سعد بن سعيد الغامدي',
    nameEn: 'Saad Al-Ghamdi',
    subfolder: 'ar.saadalghamdi',
    bitrate: '64'
  }
];

export const TAFSIR_SOURCES: TafsirSource[] = [
  {
    id: 'ar.muyassar',
    nameAr: 'التفسير الميسر',
    authorAr: 'نخبة من العلماء - مجمع الملك فهد لطباعة المصحف الشريف'
  },
  {
    id: 'ar.jalalayn',
    nameAr: 'تفسير الجلالين',
    authorAr: 'جلال الدين المحلي وجلال الدين السيوطي'
  },
  {
    id: 'ar.ibnkathir',
    nameAr: 'تفسير ابن كثير (مختصر)',
    authorAr: 'الحافظ عماد الدين إسماعيل بن عمر بن كثير'
  }
];

// Complete 114 Surahs Metadata
export const SURAHS_LIST: SurahMeta[] = [
  { number: 1, name: 'الفَاتِحَة', englishName: 'Al-Faatiha', englishNameTranslation: 'The Opening', numberOfAyahs: 7, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 1, juz: 1 },
  { number: 2, name: 'البَقَرَة', englishName: 'Al-Baqara', englishNameTranslation: 'The Cow', numberOfAyahs: 286, revelationType: 'Medinan', revelationTypeAr: 'مدنية', page: 2, juz: 1 },
  { number: 3, name: 'آل عِمْرَان', englishName: 'Aal-i-Imraan', englishNameTranslation: 'The Family of Imran', numberOfAyahs: 200, revelationType: 'Medinan', revelationTypeAr: 'مدنية', page: 50, juz: 3 },
  { number: 4, name: 'النِّسَاء', englishName: 'An-Nisaa', englishNameTranslation: 'The Women', numberOfAyahs: 176, revelationType: 'Medinan', revelationTypeAr: 'مدنية', page: 77, juz: 4 },
  { number: 5, name: 'المَائِدَة', englishName: 'Al-Maaida', englishNameTranslation: 'The Table Spread', numberOfAyahs: 120, revelationType: 'Medinan', revelationTypeAr: 'مدنية', page: 106, juz: 6 },
  { number: 6, name: 'الأَنْعَام', englishName: 'Al-An\'aam', englishNameTranslation: 'The Cattle', numberOfAyahs: 165, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 128, juz: 7 },
  { number: 7, name: 'الأَعْرَاف', englishName: 'Al-A\'raaf', englishNameTranslation: 'The Heights', numberOfAyahs: 206, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 151, juz: 8 },
  { number: 8, name: 'الأَنْفَال', englishName: 'Al-Anfaal', englishNameTranslation: 'The Spoils of War', numberOfAyahs: 75, revelationType: 'Medinan', revelationTypeAr: 'مدنية', page: 177, juz: 9 },
  { number: 9, name: 'التَّوْبَة', englishName: 'At-Tawba', englishNameTranslation: 'The Repentance', numberOfAyahs: 129, revelationType: 'Medinan', revelationTypeAr: 'مدنية', page: 187, juz: 10 },
  { number: 10, name: 'يُونُس', englishName: 'Yunus', englishNameTranslation: 'Jonah', numberOfAyahs: 109, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 208, juz: 11 },
  { number: 11, name: 'هُود', englishName: 'Hud', englishNameTranslation: 'Hud', numberOfAyahs: 123, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 221, juz: 11 },
  { number: 12, name: 'يُوسُف', englishName: 'Yusuf', englishNameTranslation: 'Joseph', numberOfAyahs: 111, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 235, juz: 12 },
  { number: 13, name: 'الرَّعْد', englishName: 'Ar-Ra\'d', englishNameTranslation: 'The Thunder', numberOfAyahs: 43, revelationType: 'Medinan', revelationTypeAr: 'مدنية', page: 249, juz: 13 },
  { number: 14, name: 'إِبْرَاهِيم', englishName: 'Ibrahim', englishNameTranslation: 'Abraham', numberOfAyahs: 52, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 255, juz: 13 },
  { number: 15, name: 'الحِجْر', englishName: 'Al-Hijr', englishNameTranslation: 'The Rocky Tract', numberOfAyahs: 99, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 262, juz: 14 },
  { number: 16, name: 'النَّحْل', englishName: 'An-Nahl', englishNameTranslation: 'The Bee', numberOfAyahs: 128, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 267, juz: 14 },
  { number: 17, name: 'الإِسْرَاء', englishName: 'Al-Israa', englishNameTranslation: 'The Night Journey', numberOfAyahs: 111, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 282, juz: 15 },
  { number: 18, name: 'الكَهْف', englishName: 'Al-Kahf', englishNameTranslation: 'The Cave', numberOfAyahs: 110, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 293, juz: 15 },
  { number: 19, name: 'مَرْيَم', englishName: 'Maryam', englishNameTranslation: 'Mary', numberOfAyahs: 98, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 305, juz: 16 },
  { number: 20, name: 'طه', englishName: 'Taa-Haa', englishNameTranslation: 'Ta-Ha', numberOfAyahs: 135, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 312, juz: 16 },
  { number: 21, name: 'الأَنْبِيَاء', englishName: 'Al-Anbiyaa', englishNameTranslation: 'The Prophets', numberOfAyahs: 112, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 322, juz: 17 },
  { number: 22, name: 'الحَجّ', englishName: 'Al-Hajj', englishNameTranslation: 'The Pilgrimage', numberOfAyahs: 78, revelationType: 'Medinan', revelationTypeAr: 'مدنية', page: 332, juz: 17 },
  { number: 23, name: 'المُؤْمِنُون', englishName: 'Al-Muminoon', englishNameTranslation: 'The Believers', numberOfAyahs: 118, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 342, juz: 18 },
  { number: 24, name: 'النُّور', englishName: 'An-Noor', englishNameTranslation: 'The Light', numberOfAyahs: 64, revelationType: 'Medinan', revelationTypeAr: 'مدنية', page: 350, juz: 18 },
  { number: 25, name: 'الفُرْقَان', englishName: 'Al-Furqaan', englishNameTranslation: 'The Criterion', numberOfAyahs: 77, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 359, juz: 18 },
  { number: 26, name: 'الشُّعَرَاء', englishName: 'Ash-Shu\'araa', englishNameTranslation: 'The Poets', numberOfAyahs: 227, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 367, juz: 19 },
  { number: 27, name: 'النَّمْل', englishName: 'An-Naml', englishNameTranslation: 'The Ant', numberOfAyahs: 93, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 377, juz: 19 },
  { number: 28, name: 'القَصَص', englishName: 'Al-Qasas', englishNameTranslation: 'The Stories', numberOfAyahs: 88, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 385, juz: 20 },
  { number: 29, name: 'العَنْكَبُوت', englishName: 'Al-Ankaboot', englishNameTranslation: 'The Spider', numberOfAyahs: 69, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 396, juz: 20 },
  { number: 30, name: 'الرُّوم', englishName: 'Ar-Room', englishNameTranslation: 'The Romans', numberOfAyahs: 60, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 404, juz: 21 },
  { number: 31, name: 'لُقْمَان', englishName: 'Luqman', englishNameTranslation: 'Luqman', numberOfAyahs: 34, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 411, juz: 21 },
  { number: 32, name: 'السَّجْدَة', englishName: 'As-Sajda', englishNameTranslation: 'The Prostration', numberOfAyahs: 30, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 415, juz: 21 },
  { number: 33, name: 'الأَحْزَاب', englishName: 'Al-Ahzaab', englishNameTranslation: 'The Clans', numberOfAyahs: 73, revelationType: 'Medinan', revelationTypeAr: 'مدنية', page: 418, juz: 21 },
  { number: 34, name: 'سَبَأ', englishName: 'Saba', englishNameTranslation: 'Sheba', numberOfAyahs: 54, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 428, juz: 22 },
  { number: 35, name: 'فَاطِر', englishName: 'Faatir', englishNameTranslation: 'The Originator', numberOfAyahs: 45, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 434, juz: 22 },
  { number: 36, name: 'يس', englishName: 'Yaseen', englishNameTranslation: 'Ya-Sin', numberOfAyahs: 83, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 440, juz: 22 },
  { number: 37, name: 'الصَّافَّات', englishName: 'As-Saaffaat', englishNameTranslation: 'Those who set the Ranks', numberOfAyahs: 182, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 446, juz: 23 },
  { number: 38, name: 'ص', englishName: 'Saad', englishNameTranslation: 'Sad', numberOfAyahs: 88, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 453, juz: 23 },
  { number: 39, name: 'الزُّمَر', englishName: 'Az-Zumar', englishNameTranslation: 'The Troops', numberOfAyahs: 75, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 458, juz: 23 },
  { number: 40, name: 'غَافِر', englishName: 'Ghafir', englishNameTranslation: 'The Forgiver', numberOfAyahs: 85, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 467, juz: 24 },
  { number: 41, name: 'فُصِّلَت', englishName: 'Fussilat', englishNameTranslation: 'Explained in Detail', numberOfAyahs: 54, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 477, juz: 24 },
  { number: 42, name: 'الشُّورَى', englishName: 'Ash-Shura', englishNameTranslation: 'Consultation', numberOfAyahs: 53, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 483, juz: 25 },
  { number: 43, name: 'الزُّخْرُف', englishName: 'Az-Zukhruf', englishNameTranslation: 'The Ornaments of Gold', numberOfAyahs: 89, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 489, juz: 25 },
  { number: 44, name: 'الدُّخَان', englishName: 'Ad-Dukhaan', englishNameTranslation: 'The Smoke', numberOfAyahs: 59, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 496, juz: 25 },
  { number: 45, name: 'الجَاثِيَة', englishName: 'Al-Jaathiya', englishNameTranslation: 'The Crouching', numberOfAyahs: 37, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 499, juz: 25 },
  { number: 46, name: 'الأَحْقَاف', englishName: 'Al-Ahqaaf', englishNameTranslation: 'The Wind-Curved Sandhills', numberOfAyahs: 35, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 502, juz: 26 },
  { number: 47, name: 'مُحَمَّد', englishName: 'Muhammad', englishNameTranslation: 'Muhammad', numberOfAyahs: 38, revelationType: 'Medinan', revelationTypeAr: 'مدنية', page: 507, juz: 26 },
  { number: 48, name: 'الفَتْح', englishName: 'Al-Fath', englishNameTranslation: 'The Victory', numberOfAyahs: 29, revelationType: 'Medinan', revelationTypeAr: 'مدنية', page: 511, juz: 26 },
  { number: 49, name: 'الحُجُرَات', englishName: 'Al-Hujuraat', englishNameTranslation: 'The Rooms', numberOfAyahs: 18, revelationType: 'Medinan', revelationTypeAr: 'مدنية', page: 515, juz: 26 },
  { number: 50, name: 'ق', englishName: 'Qaaf', englishNameTranslation: 'Qaf', numberOfAyahs: 45, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 518, juz: 26 },
  { number: 51, name: 'الذَّارِيَات', englishName: 'Adh-Dhaariyat', englishNameTranslation: 'The Winnowing Winds', numberOfAyahs: 60, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 520, juz: 26 },
  { number: 52, name: 'الطُّور', englishName: 'At-Toor', englishNameTranslation: 'The Mount', numberOfAyahs: 49, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 523, juz: 27 },
  { number: 53, name: 'النَّجْم', englishName: 'An-Najm', englishNameTranslation: 'The Star', numberOfAyahs: 62, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 526, juz: 27 },
  { number: 54, name: 'القَمَر', englishName: 'Al-Qamar', englishNameTranslation: 'The Moon', numberOfAyahs: 55, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 528, juz: 27 },
  { number: 55, name: 'الرَّحْمَن', englishName: 'Ar-Rahmaan', englishNameTranslation: 'The Beneficent', numberOfAyahs: 78, revelationType: 'Medinan', revelationTypeAr: 'مدنية', page: 531, juz: 27 },
  { number: 56, name: 'الوَاقِعَة', englishName: 'Al-Waaqia', englishNameTranslation: 'The Inevitable', numberOfAyahs: 96, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 534, juz: 27 },
  { number: 57, name: 'الحَدِيد', englishName: 'Al-Hadid', englishNameTranslation: 'The Iron', numberOfAyahs: 29, revelationType: 'Medinan', revelationTypeAr: 'مدنية', page: 537, juz: 27 },
  { number: 58, name: 'المُجَادِلَة', englishName: 'Al-Mujaadila', englishNameTranslation: 'The Pleading Woman', numberOfAyahs: 22, revelationType: 'Medinan', revelationTypeAr: 'مدنية', page: 542, juz: 28 },
  { number: 59, name: 'الحَشْر', englishName: 'Al-Hashr', englishNameTranslation: 'The Exile', numberOfAyahs: 24, revelationType: 'Medinan', revelationTypeAr: 'مدنية', page: 545, juz: 28 },
  { number: 60, name: 'المُمْتَحَنَة', englishName: 'Al-Mumtahana', englishNameTranslation: 'She that is to be examined', numberOfAyahs: 13, revelationType: 'Medinan', revelationTypeAr: 'مدنية', page: 549, juz: 28 },
  { number: 61, name: 'الصَّفّ', englishName: 'As-Saff', englishNameTranslation: 'The Ranks', numberOfAyahs: 14, revelationType: 'Medinan', revelationTypeAr: 'مدنية', page: 551, juz: 28 },
  { number: 62, name: 'الجُمُعَة', englishName: 'Al-Jumu\'a', englishNameTranslation: 'Friday', numberOfAyahs: 11, revelationType: 'Medinan', revelationTypeAr: 'مدنية', page: 553, juz: 28 },
  { number: 63, name: 'المُنَافِقُون', englishName: 'Al-Munaafiqoon', englishNameTranslation: 'The Hypocrites', numberOfAyahs: 11, revelationType: 'Medinan', revelationTypeAr: 'مدنية', page: 554, juz: 28 },
  { number: 64, name: 'التَّغَابُن', englishName: 'At-Taghaabun', englishNameTranslation: 'Mutual Disillusion', numberOfAyahs: 18, revelationType: 'Medinan', revelationTypeAr: 'مدنية', page: 556, juz: 28 },
  { number: 65, name: 'الطَّلَاق', englishName: 'At-Talaaq', englishNameTranslation: 'Divorce', numberOfAyahs: 12, revelationType: 'Medinan', revelationTypeAr: 'مدنية', page: 558, juz: 28 },
  { number: 66, name: 'التَّحْرِيم', englishName: 'At-Tahrim', englishNameTranslation: 'The Prohibition', numberOfAyahs: 12, revelationType: 'Medinan', revelationTypeAr: 'مدنية', page: 560, juz: 28 },
  { number: 67, name: 'المُلْك', englishName: 'Al-Mulk', englishNameTranslation: 'The Sovereignty', numberOfAyahs: 30, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 562, juz: 29 },
  { number: 68, name: 'القَلَم', englishName: 'Al-Qalam', englishNameTranslation: 'The Pen', numberOfAyahs: 52, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 564, juz: 29 },
  { number: 69, name: 'الحَاقَّة', englishName: 'Al-Haaqqa', englishNameTranslation: 'The Reality', numberOfAyahs: 52, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 566, juz: 29 },
  { number: 70, name: 'المَعَارِج', englishName: 'Al-Ma\'aarij', englishNameTranslation: 'The Ascending Stairways', numberOfAyahs: 44, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 568, juz: 29 },
  { number: 71, name: 'نُوح', englishName: 'Nooh', englishNameTranslation: 'Noah', numberOfAyahs: 28, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 570, juz: 29 },
  { number: 72, name: 'الجِنّ', englishName: 'Al-Jinn', englishNameTranslation: 'The Jinn', numberOfAyahs: 28, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 572, juz: 29 },
  { number: 73, name: 'المُزَّمِّل', englishName: 'Al-Muzzammil', englishNameTranslation: 'The Enshrouded One', numberOfAyahs: 20, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 574, juz: 29 },
  { number: 74, name: 'المُدَّثِّر', englishName: 'Al-Muddaththir', englishNameTranslation: 'The Cloaked One', numberOfAyahs: 56, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 575, juz: 29 },
  { number: 75, name: 'القِيَامَة', englishName: 'Al-Qiyaama', englishNameTranslation: 'The Resurrection', numberOfAyahs: 40, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 577, juz: 29 },
  { number: 76, name: 'الإِنْسَان', englishName: 'Al-Insaan', englishNameTranslation: 'Man', numberOfAyahs: 31, revelationType: 'Medinan', revelationTypeAr: 'مدنية', page: 578, juz: 29 },
  { number: 77, name: 'المُرْسَلَات', englishName: 'Al-Mursalaat', englishNameTranslation: 'The Emissaries', numberOfAyahs: 50, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 580, juz: 29 },
  { number: 78, name: 'النَّبَأ', englishName: 'An-Naba', englishNameTranslation: 'The Tidings', numberOfAyahs: 40, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 582, juz: 30 },
  { number: 79, name: 'النَّازِعَات', englishName: 'An-Naazi\'aat', englishNameTranslation: 'Those who drag forth', numberOfAyahs: 46, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 583, juz: 30 },
  { number: 80, name: 'عَبَسَ', englishName: 'Abasa', englishNameTranslation: 'He frowned', numberOfAyahs: 42, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 585, juz: 30 },
  { number: 81, name: 'التَّكْوِير', englishName: 'At-Takwir', englishNameTranslation: 'The Overthrowing', numberOfAyahs: 29, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 586, juz: 30 },
  { number: 82, name: 'الانْفِطَار', englishName: 'Al-Infitaar', englishNameTranslation: 'The Cleaving', numberOfAyahs: 19, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 587, juz: 30 },
  { number: 83, name: 'المُطَفِّفِين', englishName: 'Al-Mutaffifin', englishNameTranslation: 'Defrauding', numberOfAyahs: 36, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 587, juz: 30 },
  { number: 84, name: 'الانْشِقَاق', englishName: 'Al-Inshiqaaq', englishNameTranslation: 'The Splitting Open', numberOfAyahs: 25, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 589, juz: 30 },
  { number: 85, name: 'البُرُوج', englishName: 'Al-Burooj', englishNameTranslation: 'The Mansions of the Stars', numberOfAyahs: 22, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 590, juz: 30 },
  { number: 86, name: 'الطَّارِق', englishName: 'At-Taariq', englishNameTranslation: 'The Morning Star', numberOfAyahs: 17, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 591, juz: 30 },
  { number: 87, name: 'الأَعْلَى', englishName: 'Al-A\'laa', englishNameTranslation: 'The Most High', numberOfAyahs: 19, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 591, juz: 30 },
  { number: 88, name: 'الغَاشِيَة', englishName: 'Al-Ghaashiya', englishNameTranslation: 'The Overwhelming', numberOfAyahs: 26, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 592, juz: 30 },
  { number: 89, name: 'الفَجْر', englishName: 'Al-Fajr', englishNameTranslation: 'The Dawn', numberOfAyahs: 30, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 593, juz: 30 },
  { number: 90, name: 'البَلَد', englishName: 'Al-Balad', englishNameTranslation: 'The City', numberOfAyahs: 20, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 594, juz: 30 },
  { number: 91, name: 'الشَّمْس', englishName: 'Ash-Shams', englishNameTranslation: 'The Sun', numberOfAyahs: 15, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 595, juz: 30 },
  { number: 92, name: 'اللَّيْل', englishName: 'Al-Lail', englishNameTranslation: 'The Night', numberOfAyahs: 21, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 595, juz: 30 },
  { number: 93, name: 'الضُّحَى', englishName: 'Ad-Dhuhaa', englishNameTranslation: 'The Morning Hours', numberOfAyahs: 11, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 596, juz: 30 },
  { number: 94, name: 'الشَّرْح', englishName: 'Ash-Sharh', englishNameTranslation: 'The Relief', numberOfAyahs: 8, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 596, juz: 30 },
  { number: 95, name: 'التِّين', englishName: 'At-Tin', englishNameTranslation: 'The Fig', numberOfAyahs: 8, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 597, juz: 30 },
  { number: 96, name: 'العَلَق', englishName: 'Al-Alaq', englishNameTranslation: 'The Clot', numberOfAyahs: 19, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 597, juz: 30 },
  { number: 97, name: 'القَدْر', englishName: 'Al-Qadr', englishNameTranslation: 'The Power', numberOfAyahs: 5, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 598, juz: 30 },
  { number: 98, name: 'البَيِّنَة', englishName: 'Al-Bayyina', englishNameTranslation: 'The Clear Proof', numberOfAyahs: 8, revelationType: 'Medinan', revelationTypeAr: 'مدنية', page: 598, juz: 30 },
  { number: 99, name: 'الزَّلْزَلَة', englishName: 'Az-Zalzala', englishNameTranslation: 'The Earthquake', numberOfAyahs: 8, revelationType: 'Medinan', revelationTypeAr: 'مدنية', page: 599, juz: 30 },
  { number: 100, name: 'العَادِيَات', englishName: 'Al-Aadiyaat', englishNameTranslation: 'The Courser', numberOfAyahs: 11, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 599, juz: 30 },
  { number: 101, name: 'القَارِعَة', englishName: 'Al-Qaari\'a', englishNameTranslation: 'The Calamity', numberOfAyahs: 11, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 600, juz: 30 },
  { number: 102, name: 'التَّكَاثُر', englishName: 'At-Takaathur', englishNameTranslation: 'The Rivalry in World Increase', numberOfAyahs: 8, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 600, juz: 30 },
  { number: 103, name: 'العَصْر', englishName: 'Al-Asr', englishNameTranslation: 'The Declining Day', numberOfAyahs: 3, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 601, juz: 30 },
  { number: 104, name: 'الهُمَزَة', englishName: 'Al-Humaza', englishNameTranslation: 'The Traducer', numberOfAyahs: 9, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 601, juz: 30 },
  { number: 105, name: 'الفِيل', englishName: 'Al-Feel', englishNameTranslation: 'The Elephant', numberOfAyahs: 5, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 601, juz: 30 },
  { number: 106, name: 'قُرَيْش', englishName: 'Quraish', englishNameTranslation: 'Quraysh', numberOfAyahs: 4, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 602, juz: 30 },
  { number: 107, name: 'المَاعُون', englishName: 'Al-Maa\'oon', englishNameTranslation: 'The Small Kindness', numberOfAyahs: 7, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 602, juz: 30 },
  { number: 108, name: 'الكَوْثَر', englishName: 'Al-Kawthar', englishNameTranslation: 'The Abundance', numberOfAyahs: 3, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 602, juz: 30 },
  { number: 109, name: 'الكَافِرُون', englishName: 'Al-Kaafiroon', englishNameTranslation: 'The Disbelievers', numberOfAyahs: 6, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 603, juz: 30 },
  { number: 110, name: 'النَّصْر', englishName: 'An-Nasr', englishNameTranslation: 'The Divine Support', numberOfAyahs: 3, revelationType: 'Medinan', revelationTypeAr: 'مدنية', page: 603, juz: 30 },
  { number: 111, name: 'المَسَد', englishName: 'Al-Masad', englishNameTranslation: 'The Palm Fibre', numberOfAyahs: 5, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 603, juz: 30 },
  { number: 112, name: 'الإِخْلَاص', englishName: 'Al-Ikhlaas', englishNameTranslation: 'The Sincerity', numberOfAyahs: 4, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 604, juz: 30 },
  { number: 113, name: 'الفَلَق', englishName: 'Al-Falaq', englishNameTranslation: 'The Daybreak', numberOfAyahs: 5, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 604, juz: 30 },
  { number: 114, name: 'النَّاس', englishName: 'An-Naas', englishNameTranslation: 'Mankind', numberOfAyahs: 6, revelationType: 'Meccan', revelationTypeAr: 'مكية', page: 604, juz: 30 }
];

// Juz Data (1 to 30)
export const JUZ_LIST = Array.from({ length: 30 }, (_, i) => ({
  number: i + 1,
  nameAr: `الجزء ${i + 1}`,
  startSurah: i === 0 ? 'الفاتحة' : i === 1 ? 'البقرة' : i === 29 ? 'النبأ' : `السورة المقابلة`
}));

// Fallback verified Quran Ayahs for offline mode
export const OFFLINE_SURAHS: Record<number, { ayahs: { numberInSurah: number; text: string; tafsir?: string }[] }> = {
  1: {
    ayahs: [
      { numberInSurah: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', tafsir: 'أبتدئ قراءتي مستعينا بالله، الرحمن الذي وسعت رحمته كل شيء، الرحيم بالمؤمنين.' },
      { numberInSurah: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', tafsir: 'الثناء الكامل المطلق لله وحده، مالك ومربي جميع الخلائق بنعمه.' },
      { numberInSurah: 3, text: 'الرَّحْمَٰنِ الرَّحِيمِ', tafsir: 'ذو الرحمة الواسعة العظيمة التي وسعت جميع خلقه، الرحيم بالمؤمنين خصوصا.' },
      { numberInSurah: 4, text: 'مَالِكِ يَوْمِ الدِّينِ', tafsir: 'المتفرد بالتصرف والملك في يوم القيامة والجزاء والحساب.' },
      { numberInSurah: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', tafsir: 'نخصك وحدك بالعبادة، ونطلب العون منك وحدك في جميع شؤوننا.' },
      { numberInSurah: 6, text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', tafsir: 'دلنا وأرشدنا ووفقنا وثبتنا على الطريق المستقيم الواضح الموصل إليك.' },
      { numberInSurah: 7, text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', tafsir: 'طريق النبيين والصديقين والشهداء والصالحين، لا طريق اليهود الذين عرفوا الحق وتركوه، ولا النصارى الذين عبدوا الله بجهل.' }
    ]
  },
  112: {
    ayahs: [
      { numberInSurah: 1, text: 'قُلْ هُوَ اللَّهُ أَحَدٌ', tafsir: 'قل أيها الرسول: هو الله المتفرد بالألوهية والربوبية والأسماء والصفات، لا شريك له.' },
      { numberInSurah: 2, text: 'اللَّهُ الصَّمَدُ', tafsir: 'المقصود في قضاء جميع الحوائج والرغائب سبحانه.' },
      { numberInSurah: 3, text: 'لَمْ يَلِدْ وَلَمْ يُولَدْ', tafsir: 'ليس له ولد ولا والد ولا صاحبة، لكمال غناه وأزليته.' },
      { numberInSurah: 4, text: 'وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ', tafsir: 'وليس له مماثل ولا نظير ولا شبيه في ذاته ولا في صفاته ولا في أفعاله.' }
    ]
  },
  113: {
    ayahs: [
      { numberInSurah: 1, text: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', tafsir: 'قل أعتصم وأتحصن برب الصبح الذي ينفلق عنه ظلام الليل.' },
      { numberInSurah: 2, text: 'مِنْ شَرِّ مَا خَلَقَ', tafsir: 'من شر كل مخلوق فيه شر من الإنس والجن والحيوان وغيرها.' },
      { numberInSurah: 3, text: 'وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ', tafsir: 'ومن شر الليل إذا أقبل بظلامه وتغلغل.' },
      { numberInSurah: 4, text: 'وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ', tafsir: 'ومن شر السواحر اللاتي ينفثن في عقد السحر للإضرار بالناس.' },
      { numberInSurah: 5, text: 'وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ', tafsir: 'ومن شر كل حاسد يتمنى زوال النعمة عن غيره ويسعى في ذلك.' }
    ]
  },
  114: {
    ayahs: [
      { numberInSurah: 1, text: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', tafsir: 'قل أعتصم وألتجئ برب الناس وخالقهم ومدبر أمورهم.' },
      { numberInSurah: 2, text: 'مَلِكِ النَّاسِ', tafsir: 'ملكهم المتصرف فيهم بما يشاء، لا ملك سواه.' },
      { numberInSurah: 3, text: 'إِلَٰهِ النَّاسِ', tafsir: 'معبودهم الحق الذي لا معبود سواه ولا يستحق العبادة غيره.' },
      { numberInSurah: 4, text: 'مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ', tafsir: 'من شر الشيطان الذي يلقي الشبهات والوساوس في القلوب عند الغفلة، ويخنس عند ذكر الله.' },
      { numberInSurah: 5, text: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ', tafsir: 'الذي يبث الشرور والشكوك في صدور بني آدم.' },
      { numberInSurah: 6, text: 'مِنَ الْجِنَّةِ وَالنَّاسِ', tafsir: 'من شياطين الإنس والجن.' }
    ]
  }
};
