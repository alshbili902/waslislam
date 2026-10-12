export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  revelationOrder: number;
  juzStart: number;
}

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  translationEn: string;
  tafsirAr: string;
  audioUrl?: string;
}

export interface Reciter {
  id: string;
  nameAr: string;
  nameEn: string;
  subfolder: string;
  serverUrl: string;
  style: string;
}

export const RECITERS: Reciter[] = [
  {
    id: 'alafasy',
    nameAr: 'مشاري بن راشد العفاسي',
    nameEn: 'Mishary Rashid Alafasy',
    subfolder: 'Alafasy_128kbps',
    serverUrl: 'https://everyayah.com/data/Alafasy_128kbps',
    style: 'مرتل'
  },
  {
    id: 'abdulbasit_murattal',
    nameAr: 'عبد الباسط عبد الصمد',
    nameEn: 'Abdul Basit (Murattal)',
    subfolder: 'Abdul_Basit_Murattal_192kbps',
    serverUrl: 'https://everyayah.com/data/Abdul_Basit_Murattal_192kbps',
    style: 'مرتل'
  },
  {
    id: 'husary',
    nameAr: 'محمود خليل الحصري',
    nameEn: 'Mahmoud Khalil Al-Husary',
    subfolder: 'Husary_128kbps',
    serverUrl: 'https://everyayah.com/data/Husary_128kbps',
    style: 'معلم ومرتل'
  },
  {
    id: 'maher',
    nameAr: 'ماهر المعيقلي',
    nameEn: 'Maher Al-Muaiqly',
    subfolder: 'Maher_AlMuaiqly_64kbps',
    serverUrl: 'https://everyayah.com/data/Maher_AlMuaiqly_64kbps',
    style: 'مرتل'
  },
  {
    id: 'ghamadi',
    nameAr: 'سعد الغامدي',
    nameEn: 'Saad Al-Ghamdi',
    subfolder: 'Ghamadi_40kbps',
    serverUrl: 'https://everyayah.com/data/Ghamadi_40kbps',
    style: 'مرتل'
  }
];

export const SURAH_LIST: SurahMeta[] = [
  { number: 1, name: "الفاتحة", englishName: "Al-Faatiha", englishNameTranslation: "The Opening", numberOfAyahs: 7, revelationType: "Meccan", revelationOrder: 5, juzStart: 1 },
  { number: 2, name: "البقرة", englishName: "Al-Baqara", englishNameTranslation: "The Cow", numberOfAyahs: 286, revelationType: "Medinan", revelationOrder: 87, juzStart: 1 },
  { number: 3, name: "آل عمران", englishName: "Aal-i-Imraan", englishNameTranslation: "The Family of Imraan", numberOfAyahs: 200, revelationType: "Medinan", revelationOrder: 89, juzStart: 3 },
  { number: 4, name: "النساء", englishName: "An-Nisaa", englishNameTranslation: "The Women", numberOfAyahs: 176, revelationType: "Medinan", revelationOrder: 92, juzStart: 4 },
  { number: 5, name: "المائدة", englishName: "Al-Maaida", englishNameTranslation: "The Table", numberOfAyahs: 120, revelationType: "Medinan", revelationOrder: 112, juzStart: 6 },
  { number: 6, name: "الأنعام", englishName: "Al-An'aam", englishNameTranslation: "The Cattle", numberOfAyahs: 165, revelationType: "Meccan", revelationOrder: 55, juzStart: 7 },
  { number: 7, name: "الأعراف", englishName: "Al-A'raaf", englishNameTranslation: "The Heights", numberOfAyahs: 206, revelationType: "Meccan", revelationOrder: 39, juzStart: 8 },
  { number: 8, name: "الأنفال", englishName: "Al-Anfaal", englishNameTranslation: "The Spoils of War", numberOfAyahs: 75, revelationType: "Medinan", revelationOrder: 88, juzStart: 9 },
  { number: 9, name: "التوبة", englishName: "At-Tawba", englishNameTranslation: "The Repentance", numberOfAyahs: 129, revelationType: "Medinan", revelationOrder: 113, juzStart: 10 },
  { number: 10, name: "يونس", englishName: "Yunus", englishNameTranslation: "Jonah", numberOfAyahs: 109, revelationType: "Meccan", revelationOrder: 51, juzStart: 11 },
  { number: 11, name: "هود", englishName: "Hud", englishNameTranslation: "Hud", numberOfAyahs: 123, revelationType: "Meccan", revelationOrder: 52, juzStart: 11 },
  { number: 12, name: "يوسف", englishName: "Yusuf", englishNameTranslation: "Joseph", numberOfAyahs: 111, revelationType: "Meccan", revelationOrder: 53, juzStart: 12 },
  { number: 13, name: "الرعد", englishName: "Ar-Ra'd", englishNameTranslation: "The Thunder", numberOfAyahs: 43, revelationType: "Medinan", revelationOrder: 96, juzStart: 13 },
  { number: 14, name: "إبراهيم", englishName: "Ibrahim", englishNameTranslation: "Abraham", numberOfAyahs: 52, revelationType: "Meccan", revelationOrder: 72, juzStart: 13 },
  { number: 15, name: "الحجر", englishName: "Al-Hijr", englishNameTranslation: "The Rocky Tract", numberOfAyahs: 99, revelationType: "Meccan", revelationOrder: 54, juzStart: 14 },
  { number: 16, name: "النحل", englishName: "An-Nahl", englishNameTranslation: "The Bees", numberOfAyahs: 128, revelationType: "Meccan", revelationOrder: 70, juzStart: 14 },
  { number: 17, name: "الإسراء", englishName: "Al-Israa", englishNameTranslation: "The Night Journey", numberOfAyahs: 111, revelationType: "Meccan", revelationOrder: 50, juzStart: 15 },
  { number: 18, name: "الكهف", englishName: "Al-Kahf", englishNameTranslation: "The Cave", numberOfAyahs: 110, revelationType: "Meccan", revelationOrder: 69, juzStart: 15 },
  { number: 19, name: "مريم", englishName: "Maryam", englishNameTranslation: "Mary", numberOfAyahs: 98, revelationType: "Meccan", revelationOrder: 44, juzStart: 16 },
  { number: 20, name: "طه", englishName: "Taa-Haa", englishNameTranslation: "Taa-Haa", numberOfAyahs: 135, revelationType: "Meccan", revelationOrder: 45, juzStart: 16 },
  { number: 21, name: "الأنبياء", englishName: "Al-Anbiyaa", englishNameTranslation: "The Prophets", numberOfAyahs: 112, revelationType: "Meccan", revelationOrder: 73, juzStart: 17 },
  { number: 22, name: "الحج", englishName: "Al-Hajj", englishNameTranslation: "The Pilgrimage", numberOfAyahs: 78, revelationType: "Medinan", revelationOrder: 103, juzStart: 17 },
  { number: 23, name: "المؤمنون", englishName: "Al-Muminoon", englishNameTranslation: "The Believers", numberOfAyahs: 118, revelationType: "Meccan", revelationOrder: 74, juzStart: 18 },
  { number: 24, name: "النور", englishName: "An-Noor", englishNameTranslation: "The Light", numberOfAyahs: 64, revelationType: "Medinan", revelationOrder: 102, juzStart: 18 },
  { number: 25, name: "الفرقان", englishName: "Al-Furqaan", englishNameTranslation: "The Criterion", numberOfAyahs: 77, revelationType: "Meccan", revelationOrder: 42, juzStart: 18 },
  { number: 26, name: "الشعراء", englishName: "Ash-Shu'araa", englishNameTranslation: "The Poets", numberOfAyahs: 227, revelationType: "Meccan", revelationOrder: 47, juzStart: 19 },
  { number: 27, name: "النمل", englishName: "An-Naml", englishNameTranslation: "The Ants", numberOfAyahs: 93, revelationType: "Meccan", revelationOrder: 48, juzStart: 19 },
  { number: 28, name: "القصص", englishName: "Al-Qasas", englishNameTranslation: "The Stories", numberOfAyahs: 88, revelationType: "Meccan", revelationOrder: 49, juzStart: 20 },
  { number: 29, name: "العنكبوت", englishName: "Al-Ankaboot", englishNameTranslation: "The Spider", numberOfAyahs: 69, revelationType: "Meccan", revelationOrder: 85, juzStart: 20 },
  { number: 30, name: "الروم", englishName: "Ar-Room", englishNameTranslation: "The Romans", numberOfAyahs: 60, revelationType: "Meccan", revelationOrder: 84, juzStart: 21 },
  { number: 31, name: "لقمان", englishName: "Luqman", englishNameTranslation: "Luqman", numberOfAyahs: 34, revelationType: "Meccan", revelationOrder: 57, juzStart: 21 },
  { number: 32, name: "السجدة", englishName: "As-Sajda", englishNameTranslation: "The Prostration", numberOfAyahs: 30, revelationType: "Meccan", revelationOrder: 75, juzStart: 21 },
  { number: 33, name: "الأحزاب", englishName: "Al-Ahzaab", englishNameTranslation: "The Clans", numberOfAyahs: 73, revelationType: "Medinan", revelationOrder: 90, juzStart: 21 },
  { number: 34, name: "سبأ", englishName: "Saba", englishNameTranslation: "Sheba", numberOfAyahs: 54, revelationType: "Meccan", revelationOrder: 58, juzStart: 22 },
  { number: 35, name: "فاطر", englishName: "Faatir", englishNameTranslation: "The Originator", numberOfAyahs: 45, revelationType: "Meccan", revelationOrder: 43, juzStart: 22 },
  { number: 36, name: "يس", englishName: "Yaseen", englishNameTranslation: "Yaseen", numberOfAyahs: 83, revelationType: "Meccan", revelationOrder: 41, juzStart: 22 },
  { number: 37, name: "الصافات", englishName: "As-Saaffaat", englishNameTranslation: "Those who set the Ranks", numberOfAyahs: 182, revelationType: "Meccan", revelationOrder: 56, juzStart: 23 },
  { number: 38, name: "ص", englishName: "Saad", englishNameTranslation: "Saad", numberOfAyahs: 88, revelationType: "Meccan", revelationOrder: 38, juzStart: 23 },
  { number: 39, name: "الزمر", englishName: "Az-Zumar", englishNameTranslation: "The Troops", numberOfAyahs: 75, revelationType: "Meccan", revelationOrder: 59, juzStart: 23 },
  { number: 40, name: "غافر", englishName: "Ghafir", englishNameTranslation: "The Forgiver", numberOfAyahs: 85, revelationType: "Meccan", revelationOrder: 60, juzStart: 24 },
  { number: 41, name: "فصلت", englishName: "Fussilat", englishNameTranslation: "Explained in Detail", numberOfAyahs: 54, revelationType: "Meccan", revelationOrder: 61, juzStart: 24 },
  { number: 42, name: "الشورى", englishName: "Ash-Shura", englishNameTranslation: "The Consultation", numberOfAyahs: 53, revelationType: "Meccan", revelationOrder: 62, juzStart: 25 },
  { number: 43, name: "الزخرف", englishName: "Az-Zukhruf", englishNameTranslation: "The Ornaments of Gold", numberOfAyahs: 89, revelationType: "Meccan", revelationOrder: 63, juzStart: 25 },
  { number: 44, name: "الدخان", englishName: "Ad-Dukhaan", englishNameTranslation: "The Smoke", numberOfAyahs: 59, revelationType: "Meccan", revelationOrder: 64, juzStart: 25 },
  { number: 45, name: "الجاثية", englishName: "Al-Jaathiya", englishNameTranslation: "Crouching", numberOfAyahs: 37, revelationType: "Meccan", revelationOrder: 65, juzStart: 25 },
  { number: 46, name: "الأحقاف", englishName: "Al-Ahqaf", englishNameTranslation: "The Wind-Curved Sandhills", numberOfAyahs: 35, revelationType: "Meccan", revelationOrder: 66, juzStart: 26 },
  { number: 47, name: "محمد", englishName: "Muhammad", englishNameTranslation: "Muhammad", numberOfAyahs: 38, revelationType: "Medinan", revelationOrder: 95, juzStart: 26 },
  { number: 48, name: "الفتح", englishName: "Al-Fath", englishNameTranslation: "The Victory", numberOfAyahs: 29, revelationType: "Medinan", revelationOrder: 111, juzStart: 26 },
  { number: 49, name: "الحجرات", englishName: "Al-Hujuraat", englishNameTranslation: "The Rooms", numberOfAyahs: 18, revelationType: "Medinan", revelationOrder: 106, juzStart: 26 },
  { number: 50, name: "ق", englishName: "Qaaf", englishNameTranslation: "Qaaf", numberOfAyahs: 45, revelationType: "Meccan", revelationOrder: 34, juzStart: 26 },
  { number: 51, name: "الذاريات", englishName: "Adh-Dhaariyat", englishNameTranslation: "The Winnowing Winds", numberOfAyahs: 60, revelationType: "Meccan", revelationOrder: 67, juzStart: 26 },
  { number: 52, name: "الطور", englishName: "At-Toor", englishNameTranslation: "The Mount", numberOfAyahs: 49, revelationType: "Meccan", revelationOrder: 76, juzStart: 27 },
  { number: 53, name: "النجم", englishName: "An-Najm", englishNameTranslation: "The Star", numberOfAyahs: 62, revelationType: "Meccan", revelationOrder: 23, juzStart: 27 },
  { number: 54, name: "القمر", englishName: "Al-Qamar", englishNameTranslation: "The Moon", numberOfAyahs: 55, revelationType: "Meccan", revelationOrder: 37, juzStart: 27 },
  { number: 55, name: "الرحمن", englishName: "Ar-Rahmaan", englishNameTranslation: "The Beneficent", numberOfAyahs: 78, revelationType: "Medinan", revelationOrder: 97, juzStart: 27 },
  { number: 56, name: "الواقعة", englishName: "Al-Waaqia", englishNameTranslation: "The Inevitable", numberOfAyahs: 96, revelationType: "Meccan", revelationOrder: 46, juzStart: 27 },
  { number: 57, name: "الحديد", englishName: "Al-Hadid", englishNameTranslation: "The Iron", numberOfAyahs: 29, revelationType: "Medinan", revelationOrder: 94, juzStart: 27 },
  { number: 58, name: "المجادلة", englishName: "Al-Mujaadila", englishNameTranslation: "The Pleading Woman", numberOfAyahs: 22, revelationType: "Medinan", revelationOrder: 105, juzStart: 28 },
  { number: 59, name: "الحشر", englishName: "Al-Hashr", englishNameTranslation: "The Exile", numberOfAyahs: 24, revelationType: "Medinan", revelationOrder: 101, juzStart: 28 },
  { number: 60, name: "الممتحنة", englishName: "Al-Mumtahana", englishNameTranslation: "She that is to be examined", numberOfAyahs: 13, revelationType: "Medinan", revelationOrder: 91, juzStart: 28 },
  { number: 61, name: "الصف", englishName: "As-Saff", englishNameTranslation: "The Ranks", numberOfAyahs: 14, revelationType: "Medinan", revelationOrder: 109, juzStart: 28 },
  { number: 62, name: "الجمعة", englishName: "Al-Jumu'a", englishNameTranslation: "Friday", numberOfAyahs: 11, revelationType: "Medinan", revelationOrder: 110, juzStart: 28 },
  { number: 63, name: "المنافقون", englishName: "Al-Munaafiqoon", englishNameTranslation: "The Hypocrites", numberOfAyahs: 11, revelationType: "Medinan", revelationOrder: 104, juzStart: 28 },
  { number: 64, name: "التغابن", englishName: "At-Taghaabun", englishNameTranslation: "Mutual Disillusion", numberOfAyahs: 18, revelationType: "Medinan", revelationOrder: 108, juzStart: 28 },
  { number: 65, name: "الطلاق", englishName: "At-Talaaq", englishNameTranslation: "Divorce", numberOfAyahs: 12, revelationType: "Medinan", revelationOrder: 99, juzStart: 28 },
  { number: 66, name: "التحريم", englishName: "At-Tahrim", englishNameTranslation: "The Prohibition", numberOfAyahs: 12, revelationType: "Medinan", revelationOrder: 107, juzStart: 28 },
  { number: 67, name: "الملك", englishName: "Al-Mulk", englishNameTranslation: "The Sovereignty", numberOfAyahs: 30, revelationType: "Meccan", revelationOrder: 77, juzStart: 29 },
  { number: 68, name: "القلم", englishName: "Al-Qalam", englishNameTranslation: "The Pen", numberOfAyahs: 52, revelationType: "Meccan", revelationOrder: 2, juzStart: 29 },
  { number: 69, name: "الحاقة", englishName: "Al-Haaqqa", englishNameTranslation: "The Reality", numberOfAyahs: 52, revelationType: "Meccan", revelationOrder: 78, juzStart: 29 },
  { number: 70, name: "المعارج", englishName: "Al-Ma'aarij", englishNameTranslation: "The Ascending Stairways", numberOfAyahs: 44, revelationType: "Meccan", revelationOrder: 79, juzStart: 29 },
  { number: 71, name: "نوح", englishName: "Nooh", englishNameTranslation: "Noah", numberOfAyahs: 28, revelationType: "Meccan", revelationOrder: 71, juzStart: 29 },
  { number: 72, name: "الجن", englishName: "Al-Jinn", englishNameTranslation: "The Jinn", numberOfAyahs: 28, revelationType: "Meccan", revelationOrder: 40, juzStart: 29 },
  { number: 73, name: "المزمل", englishName: "Al-Muzzammil", englishNameTranslation: "The Enshrouded One", numberOfAyahs: 20, revelationType: "Meccan", revelationOrder: 3, juzStart: 29 },
  { number: 74, name: "المدثر", englishName: "Al-Muddaththir", englishNameTranslation: "The Cloaked One", numberOfAyahs: 56, revelationType: "Meccan", revelationOrder: 4, juzStart: 29 },
  { number: 75, name: "القيامة", englishName: "Al-Qiyaama", englishNameTranslation: "The Resurrection", numberOfAyahs: 40, revelationType: "Meccan", revelationOrder: 31, juzStart: 29 },
  { number: 76, name: "الإنسان", englishName: "Al-Insaan", englishNameTranslation: "Man", numberOfAyahs: 31, revelationType: "Medinan", revelationOrder: 98, juzStart: 29 },
  { number: 77, name: "المرسلات", englishName: "Al-Mursalaat", englishNameTranslation: "The Emissaries", numberOfAyahs: 50, revelationType: "Meccan", revelationOrder: 33, juzStart: 29 },
  { number: 78, name: "النبأ", englishName: "An-Naba", englishNameTranslation: "The Tidings", numberOfAyahs: 40, revelationType: "Meccan", revelationOrder: 80, juzStart: 30 },
  { number: 79, name: "النازعات", englishName: "An-Naazi'aat", englishNameTranslation: "Those who drag forth", numberOfAyahs: 46, revelationType: "Meccan", revelationOrder: 81, juzStart: 30 },
  { number: 80, name: "عبس", englishName: "Abasa", englishNameTranslation: "He frowned", numberOfAyahs: 42, revelationType: "Meccan", revelationOrder: 24, juzStart: 30 },
  { number: 81, name: "التكوير", englishName: "At-Takwir", englishNameTranslation: "The Overthrowing", numberOfAyahs: 29, revelationType: "Meccan", revelationOrder: 7, juzStart: 30 },
  { number: 82, name: "الانفطار", englishName: "Al-Infitaar", englishNameTranslation: "The Cleaving", numberOfAyahs: 19, revelationType: "Meccan", revelationOrder: 82, juzStart: 30 },
  { number: 83, name: "المطففين", englishName: "Al-Mutaffifin", englishNameTranslation: "Defrauding", numberOfAyahs: 36, revelationType: "Meccan", revelationOrder: 86, juzStart: 30 },
  { number: 84, name: "الانشقاق", englishName: "Al-Inshiqaaq", englishNameTranslation: "The Splitting Open", numberOfAyahs: 25, revelationType: "Meccan", revelationOrder: 83, juzStart: 30 },
  { number: 85, name: "البروج", englishName: "Al-Burooj", englishNameTranslation: "The Mansions of the Stars", numberOfAyahs: 22, revelationType: "Meccan", revelationOrder: 27, juzStart: 30 },
  { number: 86, name: "الطارق", englishName: "At-Taariq", englishNameTranslation: "The Morning Star", numberOfAyahs: 17, revelationType: "Meccan", revelationOrder: 36, juzStart: 30 },
  { number: 87, name: "الأعلى", englishName: "Al-A'laa", englishNameTranslation: "The Most High", numberOfAyahs: 19, revelationType: "Meccan", revelationOrder: 8, juzStart: 30 },
  { number: 88, name: "الغاشية", englishName: "Al-Ghaashiya", englishNameTranslation: "The Overwhelming", numberOfAyahs: 26, revelationType: "Meccan", revelationOrder: 68, juzStart: 30 },
  { number: 89, name: "الفجر", englishName: "Al-Fajr", englishNameTranslation: "The Dawn", numberOfAyahs: 30, revelationType: "Meccan", revelationOrder: 10, juzStart: 30 },
  { number: 90, name: "البلد", englishName: "Al-Balad", englishNameTranslation: "The City", numberOfAyahs: 20, revelationType: "Meccan", revelationOrder: 35, juzStart: 30 },
  { number: 91, name: "الشمس", englishName: "Ash-Shams", englishNameTranslation: "The Sun", numberOfAyahs: 15, revelationType: "Meccan", revelationOrder: 26, juzStart: 30 },
  { number: 92, name: "الليل", englishName: "Al-Lail", englishNameTranslation: "The Night", numberOfAyahs: 21, revelationType: "Meccan", revelationOrder: 9, juzStart: 30 },
  { number: 93, name: "الضحى", englishName: "Ad-Dhuhaa", englishNameTranslation: "The Morning Hours", numberOfAyahs: 11, revelationType: "Meccan", revelationOrder: 11, juzStart: 30 },
  { number: 94, name: "الشرح", englishName: "Ash-Sharh", englishNameTranslation: "The Relief", numberOfAyahs: 8, revelationType: "Meccan", revelationOrder: 12, juzStart: 30 },
  { number: 95, name: "التين", englishName: "At-Tin", englishNameTranslation: "The Fig", numberOfAyahs: 8, revelationType: "Meccan", revelationOrder: 28, juzStart: 30 },
  { number: 96, name: "العلق", englishName: "Al-Alaq", englishNameTranslation: "The Clot", numberOfAyahs: 19, revelationType: "Meccan", revelationOrder: 1, juzStart: 30 },
  { number: 97, name: "القدر", englishName: "Al-Qadr", englishNameTranslation: "The Power", numberOfAyahs: 5, revelationType: "Meccan", revelationOrder: 25, juzStart: 30 },
  { number: 98, name: "البينة", englishName: "Al-Bayyina", englishNameTranslation: "The Clear Proof", numberOfAyahs: 8, revelationType: "Medinan", revelationOrder: 100, juzStart: 30 },
  { number: 99, name: "الزلزلة", englishName: "Az-Zalzala", englishNameTranslation: "The Earthquake", numberOfAyahs: 8, revelationType: "Medinan", revelationOrder: 93, juzStart: 30 },
  { number: 100, name: "العاديات", englishName: "Al-Aadiyaat", englishNameTranslation: "The Courser", numberOfAyahs: 11, revelationType: "Meccan", revelationOrder: 14, juzStart: 30 },
  { number: 101, name: "القارعة", englishName: "Al-Qaari'a", englishNameTranslation: "The Calamity", numberOfAyahs: 11, revelationType: "Meccan", revelationOrder: 30, juzStart: 30 },
  { number: 102, name: "التكاثر", englishName: "At-Takaathur", englishNameTranslation: "The Rivalry in World Increase", numberOfAyahs: 8, revelationType: "Meccan", revelationOrder: 16, juzStart: 30 },
  { number: 103, name: "العصر", englishName: "Al-Asr", englishNameTranslation: "The Declining Day", numberOfAyahs: 3, revelationType: "Meccan", revelationOrder: 13, juzStart: 30 },
  { number: 104, name: "الهمزة", englishName: "Al-Humaza", englishNameTranslation: "The Traducer", numberOfAyahs: 9, revelationType: "Meccan", revelationOrder: 32, juzStart: 30 },
  { number: 105, name: "الفيل", englishName: "Al-Fil", englishNameTranslation: "The Elephant", numberOfAyahs: 5, revelationType: "Meccan", revelationOrder: 19, juzStart: 30 },
  { number: 106, name: "قريش", englishName: "Quraish", englishNameTranslation: "Quraish", numberOfAyahs: 4, revelationType: "Meccan", revelationOrder: 29, juzStart: 30 },
  { number: 107, name: "الماعون", englishName: "Al-Maa'oon", englishNameTranslation: "The Small Kindnesses", numberOfAyahs: 7, revelationType: "Meccan", revelationOrder: 17, juzStart: 30 },
  { number: 108, name: "الكوثر", englishName: "Al-Kawthar", englishNameTranslation: "The Abundance", numberOfAyahs: 3, revelationType: "Meccan", revelationOrder: 15, juzStart: 30 },
  { number: 109, name: "الكافرون", englishName: "Al-Kaafiroon", englishNameTranslation: "The Disbelievers", numberOfAyahs: 6, revelationType: "Meccan", revelationOrder: 18, juzStart: 30 },
  { number: 110, name: "النصر", englishName: "An-Nasr", englishNameTranslation: "The Divine Support", numberOfAyahs: 3, revelationType: "Medinan", revelationOrder: 114, juzStart: 30 },
  { number: 111, name: "المسد", englishName: "Al-Masad", englishNameTranslation: "The Palm Fibre", numberOfAyahs: 5, revelationType: "Meccan", revelationOrder: 6, juzStart: 30 },
  { number: 112, name: "الإخلاص", englishName: "Al-Ikhlaas", englishNameTranslation: "The Sincerity", numberOfAyahs: 4, revelationType: "Meccan", revelationOrder: 22, juzStart: 30 },
  { number: 113, name: "الفلق", englishName: "Al-Falaq", englishNameTranslation: "The Daybreak", numberOfAyahs: 5, revelationType: "Meccan", revelationOrder: 20, juzStart: 30 },
  { number: 114, name: "الناس", englishName: "An-Naas", englishNameTranslation: "Mankind", numberOfAyahs: 6, revelationType: "Meccan", revelationOrder: 21, juzStart: 30 }
];

/**
 * Built-in verified offline Surahs data with complete authentic Uthmani text,
 * authentic English Saheeh International translation, and authentic Tafsir Al-Muyassar.
 */
export const VERIFIED_OFFLINE_SURAHS: Record<number, Ayah[]> = {
  // Surah Al-Fatihah
  1: [
    {
      number: 1,
      numberInSurah: 1,
      text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      translationEn: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
      tafsirAr: "أبتدئ قراءتي مستعينًا باسم الله مستحضرًا صفات رحمته الواسعة والخاصة بعباده المؤمنين."
    },
    {
      number: 2,
      numberInSurah: 2,
      text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
      translationEn: "[All] praise is [due] to Allah, Lord of the worlds -",
      tafsirAr: "الثناء التام الكامل لله وحده، الخالق المدبر لجميع المخلوقات والمربي لهم بنعمه."
    },
    {
      number: 3,
      numberInSurah: 3,
      text: "الرَّحْمَٰنِ الرَّحِيمِ",
      translationEn: "The Entirely Merciful, the Especially Merciful,",
      tafsirAr: "الذي وسعت رحمته كل شيء في الدنيا، ورحمته الخاصة بالمؤمنين في الآخرة."
    },
    {
      number: 4,
      numberInSurah: 4,
      text: "مَالِكِ يَوْمِ الدِّينِ",
      translationEn: "Sovereign of the Day of Recompense.",
      tafsirAr: "المتصرف وحده بالعدل والرحمة في يوم الجزاء والحساب وهو يوم القيامة."
    },
    {
      number: 5,
      numberInSurah: 5,
      text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
      translationEn: "It is You we worship and You we ask for help.",
      tafsirAr: "نخصك وحدك بالعبادة والخضوع، ونخصك وحدك بطلب العون في كل شؤوننا."
    },
    {
      number: 6,
      numberInSurah: 6,
      text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
      translationEn: "Guide us to the straight path -",
      tafsirAr: "وفقنا وأرشدنا وثبتنا على الطريق الواضح الحق، وهو دين الإسلام."
    },
    {
      number: 7,
      numberInSurah: 7,
      text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
      translationEn: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
      tafsirAr: "طريق النبيين والصديقين والشهداء والصالحين، غير طريق المغضوب عليهم (اليهود ومن شابههم) ولا الضالين (النصارى ومن تاه عن الحق)."
    }
  ],
  // Surah Al-Ikhlas
  112: [
    {
      number: 6222,
      numberInSurah: 1,
      text: "قُلْ هُوَ اللَّهُ أَحَدٌ",
      translationEn: "Say, \"He is Allah, [who is] One,",
      tafsirAr: "قل أيها الرسول للناس: الله هو الأحد المنفرد بالألوهية والربوبية والأسماء والصفات، لا شريك له."
    },
    {
      number: 6223,
      numberInSurah: 2,
      text: "اللَّهُ الصَّمَدُ",
      translationEn: "Allah, the Eternal Refuge.",
      tafsirAr: "الله المستغني عن خلقه، الذي تصمد وتقصد إليه الخلائق كلها في حوائجها ورغائبها."
    },
    {
      number: 6224,
      numberInSurah: 3,
      text: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
      translationEn: "He neither begets nor is born,",
      tafsirAr: "تنزه سبحانه عن الولد والوالد والصاحبة، لكمال غناه وأزليته."
    },
    {
      number: 6225,
      numberInSurah: 4,
      text: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
      translationEn: "Nor is there to Him any equivalent.\"",
      tafsirAr: "وليس له مكافئ ولا مماثل ولا شبيه من خلقه بأي وجه من الوجوه."
    }
  ],
  // Surah Al-Falaq
  113: [
    {
      number: 6226,
      numberInSurah: 1,
      text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
      translationEn: "Say, \"I seek refuge in the Lord of daybreak",
      tafsirAr: "قل: أعتصم وألتجئ برب الصبح الذي يفلق الظلام بنوره."
    },
    {
      number: 6227,
      numberInSurah: 2,
      text: "مِن شَرِّ مَا خَلَقَ",
      translationEn: "From the evil of that which He created",
      tafsirAr: "من شر جميع المخلوقات والمؤذيات التي خلقها."
    },
    {
      number: 6228,
      numberInSurah: 3,
      text: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
      translationEn: "And from the evil of darkness when it settles",
      tafsirAr: "ومن شر الليل الشديد الظلمة إذا دخل وغمر الكون بما فيه من الشرور."
    },
    {
      number: 6229,
      numberInSurah: 4,
      text: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ",
      translationEn: "And from the evil of the blowers in knots",
      tafsirAr: "ومن شر الساحرات والنفوس الخبيثة اللاتي ينفثن في عقد السحر للإضرار بالناس."
    },
    {
      number: 6230,
      numberInSurah: 5,
      text: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
      translationEn: "And from the evil of an envier when he envies.\"",
      tafsirAr: "ومن شر الحاسد الذي يتمنى زوال نعمة الله عن غيره ويسعى في إيذائه."
    }
  ],
  // Surah An-Nas
  114: [
    {
      number: 6231,
      numberInSurah: 1,
      text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
      translationEn: "Say, \"I seek refuge in the Lord of mankind,",
      tafsirAr: "قل: ألتجئ وأتحصن برب البشر وخالقهم ورازقهم."
    },
    {
      number: 6232,
      numberInSurah: 2,
      text: "مَلِكِ النَّاسِ",
      translationEn: "The Sovereign of mankind.",
      tafsirAr: "الملك المتصرف المطلق في جميع أمورهم وذواتهم."
    },
    {
      number: 6233,
      numberInSurah: 3,
      text: "إِلَٰهِ النَّاسِ",
      translationEn: "The God of mankind,",
      tafsirAr: "معبودهم الحق الذي لا إله غيره ولا معبود سواه."
    },
    {
      number: 6234,
      numberInSurah: 4,
      text: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ",
      translationEn: "From the evil of the retreating whisperer -",
      tafsirAr: "من شر الشيطان الذي يوسوس في الصدور، وينخنس ويختفي إذا ذُكر الله تعالى."
    },
    {
      number: 6235,
      numberInSurah: 5,
      text: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ",
      translationEn: "Who whispers [evil] into the breasts of mankind -",
      tafsirAr: "الذي يلقي الشبهات والشهوات والوساوس في قلوب الناس."
    },
    {
      number: 6236,
      numberInSurah: 6,
      text: "مِنَ الْجِنَّةِ وَالنَّاسِ",
      translationEn: "From among the jinn and mankind.\"",
      tafsirAr: "من شياطين الإنس والجن الذين يوسوسون ويضلون الخلق."
    }
  ],
  // Surah Al-Asr
  103: [
    {
      number: 6177,
      numberInSurah: 1,
      text: "وَالْعَصْرِ",
      translationEn: "By time,",
      tafsirAr: "أقسم الله تعالى بالدهر والزمان لما فيه من العبر والدلالة على قدرة الخالق."
    },
    {
      number: 6178,
      numberInSurah: 2,
      text: "إِنَّ الْإِنسَانَ لَفِي خُسْرٍ",
      translationEn: "Indeed, mankind is in loss,",
      tafsirAr: "إن كل إنسان في هلكة وخسران ونقصان."
    },
    {
      number: 6179,
      numberInSurah: 3,
      text: "إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ",
      translationEn: "Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.",
      tafsirAr: "إلا الذين جمعوا بين الإيمان والعمل الصالح، وتواصوا باتباع الحق والصبر على طاعة الله وأقداره."
    }
  ],
  // Surah Al-Kawthar
  108: [
    {
      number: 6205,
      numberInSurah: 1,
      text: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ",
      translationEn: "Indeed, We have granted you, [O Muhammad], al-Kawthar.",
      tafsirAr: "إنا أعطيناك أيها النبي الخير الكثير في الدنيا والآخرة ومنه نهر الكوثر في الجنة."
    },
    {
      number: 6206,
      numberInSurah: 2,
      text: "فَصَلِّ لِرَبِّكَ وَانْحَرْ",
      translationEn: "So pray to your Lord and sacrifice [to Him alone].",
      tafsirAr: "فأخلص لربك صلاتك كلها وذبحك وأضحيتك لا للأصنام."
    },
    {
      number: 6207,
      numberInSurah: 3,
      text: "إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ",
      translationEn: "Indeed, your enemy is the one cut off.",
      tafsirAr: "إن مبغضك وكاره ما جئت به هو المنقطع أثره، المقطوع من كل خير."
    }
  ]
};

/**
 * Format Ayah audio URL for specific reciter and ayah
 * Format: serverUrl / {surahPadded}{ayahPadded}.mp3 e.g. 001001.mp3
 */
export function getAyahAudioUrl(reciterId: string, surahNum: number, ayahNum: number): string {
  const reciter = RECITERS.find(r => r.id === reciterId) || RECITERS[0];
  const sStr = String(surahNum).padStart(3, '0');
  const aStr = String(ayahNum).padStart(3, '0');
  return `${reciter.serverUrl}/${sStr}${aStr}.mp3`;
}
