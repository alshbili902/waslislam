import { SURAHS_LIST } from './quranMetadata';
import { QuranAudioSurah, QuranAudioReciter, QuranReciterMoshaf } from '../types/quranAudio';
import { normalizeArabicText } from '../services/quranService';

// Standard 1 to 114 Surah Numbers Array
export const ALL_SURAH_NUMBERS = Array.from({ length: 114 }, (_, i) => i + 1);

// All 114 Verified Surahs with normalized names and metadata
export const VERIFIED_QURAN_SURAHS: QuranAudioSurah[] = SURAHS_LIST.map((s) => ({
  number: s.number,
  name: s.name,
  nameWithoutTashkeel: normalizeArabicText(s.name),
  englishName: s.englishName,
  englishNameTranslation: s.englishNameTranslation,
  numberOfAyahs: s.numberOfAyahs,
  revelationType: s.revelationType,
  revelationTypeAr: s.revelationTypeAr as 'مكية' | 'مدنية',
  page: s.page,
  juz: s.juz
}));

// Curated verified Reciters from legitimate mp3quran.net official CDN
export const INITIAL_VERIFIED_RECITERS: QuranAudioReciter[] = [
  {
    id: 'alafasy',
    numericId: 123,
    nameAr: 'مشاري بن راشد العفاسي',
    nameEn: 'Mishary Rashid Alafasy',
    letter: 'م',
    bioAr: 'إمام المسجد الكبير بدولة الكويت وقارئ معتمد ذو صوت عذب وإتقان متقن لأحكام التلاوة.',
    riwayah: 'حفص عن عاصم',
    isFeatured: true,
    isActive: true,
    totalSurahs: 114,
    moshafList: [
      {
        id: 1,
        nameAr: 'حفص عن عاصم - مرتل',
        riwayahName: 'حفص عن عاصم',
        serverUrl: 'https://server8.mp3quran.net/afs/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      }
    ]
  },
  {
    id: 'abdulbasit-murattal',
    numericId: 51,
    nameAr: 'عبد الباسط عبد الصمد (مرتل)',
    nameEn: 'Abdul Basit Murattal',
    letter: 'ع',
    bioAr: 'شيخ القراء وأحد أعلام التلاوة التاريخيين في العالم الإسلامي، تميز بجمال النبرة ودقة الأداء.',
    riwayah: 'حفص عن عاصم',
    isFeatured: true,
    isActive: true,
    totalSurahs: 114,
    moshafList: [
      {
        id: 1,
        nameAr: 'حفص عن عاصم - مرتل',
        riwayahName: 'حفص عن عاصم',
        serverUrl: 'https://server7.mp3quran.net/basit/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      },
      {
        id: 2,
        nameAr: 'ورش عن نافع - مرتل',
        riwayahName: 'ورش عن نافع',
        serverUrl: 'https://server7.mp3quran.net/basit/Rewayat-Warsh-A-n-Nafi/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      }
    ]
  },
  {
    id: 'abdulbasit-mujawwad',
    numericId: 51,
    nameAr: 'عبد الباسط عبد الصمد (المصحف المجود)',
    nameEn: 'Abdul Basit Mujawwad',
    letter: 'ع',
    bioAr: 'تلاوات خاشعة من المصحف المجود بصوت القارئ الشيخ عبد الباسط عبد الصمد رحمه الله.',
    riwayah: 'المصحف المجود',
    isFeatured: true,
    isActive: true,
    totalSurahs: 114,
    moshafList: [
      {
        id: 3,
        nameAr: 'المصحف المجود',
        riwayahName: 'المصحف المجود',
        serverUrl: 'https://server7.mp3quran.net/basit/Almusshaf-Al-Mojawwad/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      }
    ]
  },
  {
    id: 'minshawi-murattal',
    numericId: 112,
    nameAr: 'محمد صديق المنشاوي (مرتل)',
    nameEn: 'Mohamed Siddiq Al-Minshawi',
    letter: 'م',
    bioAr: 'القارئ الباكي، تميز بصوت شجي حزين يبعث على التدبر والخشوع التام في آيات كتاب الله.',
    riwayah: 'حفص عن عاصم',
    isFeatured: true,
    isActive: true,
    totalSurahs: 114,
    moshafList: [
      {
        id: 1,
        nameAr: 'حفص عن عاصم - مرتل',
        riwayahName: 'حفص عن عاصم',
        serverUrl: 'https://server10.mp3quran.net/minsh/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      }
    ]
  },
  {
    id: 'minshawi-mujawwad',
    numericId: 112,
    nameAr: 'محمد صديق المنشاوي (مجود)',
    nameEn: 'Mohamed Siddiq Al-Minshawi (Mujawwad)',
    letter: 'م',
    bioAr: 'المصحف المجود بصوت الشيخ محمد صديق المنشاوي، قمة في الأداء والخشوع.',
    riwayah: 'المصحف المجود',
    isFeatured: false,
    isActive: true,
    totalSurahs: 114,
    moshafList: [
      {
        id: 2,
        nameAr: 'المصحف المجود',
        riwayahName: 'المصحف المجود',
        serverUrl: 'https://server10.mp3quran.net/minsh/Almusshaf-Al-Mojawwad/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      }
    ]
  },
  {
    id: 'hussary-murattal',
    numericId: 118,
    nameAr: 'محمود خليل الحصري (مرتل)',
    nameEn: 'Mahmoud Khalil Al-Hussary',
    letter: 'م',
    bioAr: 'شيخ عموم المقارئ المصرية، مرجع الأمة في ضبط مخارج الحروف وأحكام التجويد والترتيل.',
    riwayah: 'حفص عن عاصم',
    isFeatured: true,
    isActive: true,
    totalSurahs: 114,
    moshafList: [
      {
        id: 1,
        nameAr: 'حفص عن عاصم - مرتل',
        riwayahName: 'حفص عن عاصم',
        serverUrl: 'https://server13.mp3quran.net/husr/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      },
      {
        id: 2,
        nameAr: 'ورش عن نافع - مرتل',
        riwayahName: 'ورش عن نافع',
        serverUrl: 'https://server13.mp3quran.net/husr/Rewayat-Warsh-A-n-Nafi/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      },
      {
        id: 3,
        nameAr: 'قالون عن نافع - مرتل',
        riwayahName: 'قالون عن نافع',
        serverUrl: 'https://server13.mp3quran.net/husr/Rewayat-Qalon-A-n-Nafi/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      },
      {
        id: 4,
        nameAr: 'الدوري عن أبي عمرو - مرتل',
        riwayahName: 'الدوري عن أبي عمرو',
        serverUrl: 'https://server13.mp3quran.net/husr/Rewayat-Aldori-A-n-Abi-Amr/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      }
    ]
  },
  {
    id: 'sudais',
    numericId: 54,
    nameAr: 'عبد الرحمن السديس',
    nameEn: 'Abdul Rahman Al-Sudais',
    letter: 'ع',
    bioAr: 'إمام وخطيب المسجد الحرام ورئيس الشؤون الدينية بالمسجد الحرام والمسجد النبوي.',
    riwayah: 'حفص عن عاصم',
    isFeatured: true,
    isActive: true,
    totalSurahs: 114,
    moshafList: [
      {
        id: 1,
        nameAr: 'حفص عن عاصم - مرتل',
        riwayahName: 'حفص عن عاصم',
        serverUrl: 'https://server11.mp3quran.net/sds/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      }
    ]
  },
  {
    id: 'shuraim',
    numericId: 31,
    nameAr: 'سعود بن إبراهيم الشريم',
    nameEn: 'Saud Al-Shuraim',
    letter: 'س',
    bioAr: 'إمام وخطيب المسجد الحرام سابقاً، تميز بنبرته المهيبة وتلاوته المتقنة المؤثرة.',
    riwayah: 'حفص عن عاصم',
    isFeatured: true,
    isActive: true,
    totalSurahs: 114,
    moshafList: [
      {
        id: 1,
        nameAr: 'حفص عن عاصم - مرتل',
        riwayahName: 'حفص عن عاصم',
        serverUrl: 'https://server7.mp3quran.net/shur/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      }
    ]
  },
  {
    id: 'maher',
    numericId: 102,
    nameAr: 'ماهر بن حمد المعيقلي',
    nameEn: 'Maher Al-Muaiqly',
    letter: 'م',
    bioAr: 'إمام وخطيب المسجد الحرام بمكة المكرمة، صاحب الصوت الرخيم والشعبية الواسعة.',
    riwayah: 'حفص عن عاصم',
    isFeatured: true,
    isActive: true,
    totalSurahs: 114,
    moshafList: [
      {
        id: 1,
        nameAr: 'حفص عن عاصم - مرتل',
        riwayahName: 'حفص عن عاصم',
        serverUrl: 'https://server12.mp3quran.net/maher/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      },
      {
        id: 2,
        nameAr: 'المصحف المجود',
        riwayahName: 'المصحف المجود',
        serverUrl: 'https://server12.mp3quran.net/maher/Almusshaf-Al-Mojawwad/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      }
    ]
  },
  {
    id: 'saad-ghamdi',
    numericId: 30,
    nameAr: 'سعد بن سعيد الغامدي',
    nameEn: 'Saad Al-Ghamdi',
    letter: 'س',
    bioAr: 'قارئ وإمام سعودي معتمد، تميز بتلاوته المريحة الهادئة التي دخلت قلوب الملايين.',
    riwayah: 'حفص عن عاصم',
    isFeatured: true,
    isActive: true,
    totalSurahs: 114,
    moshafList: [
      {
        id: 1,
        nameAr: 'حفص عن عاصم - مرتل',
        riwayahName: 'حفص عن عاصم',
        serverUrl: 'https://server7.mp3quran.net/s_gmd/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      }
    ]
  },
  {
    id: 'yasser-dossari',
    numericId: 92,
    nameAr: 'ياسر بن راشد الدوسري',
    nameEn: 'Yasser Al-Dossari',
    letter: 'ي',
    bioAr: 'إمام وخطيب المسجد الحرام، اشتهر بحسن الصوت وتنوع المقامات والخشوع البين.',
    riwayah: 'حفص عن عاصم',
    isFeatured: true,
    isActive: true,
    totalSurahs: 114,
    moshafList: [
      {
        id: 1,
        nameAr: 'حفص عن عاصم - مرتل',
        riwayahName: 'حفص عن عاصم',
        serverUrl: 'https://server11.mp3quran.net/yasser/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      }
    ]
  },
  {
    id: 'nasser-qatami',
    numericId: 86,
    nameAr: 'ناصر بن علي القطامي',
    nameEn: 'Nasser Al-Qatami',
    letter: 'ن',
    bioAr: 'قارئ وإمام في مدينة الرياض، معروف بتلاوته الباكية الخاشعة المؤثرة.',
    riwayah: 'حفص عن عاصم',
    isFeatured: true,
    isActive: true,
    totalSurahs: 114,
    moshafList: [
      {
        id: 1,
        nameAr: 'حفص عن عاصم - مرتل',
        riwayahName: 'حفص عن عاصم',
        serverUrl: 'https://server6.mp3quran.net/qtm/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      }
    ]
  },
  {
    id: 'ajmy',
    numericId: 5,
    nameAr: 'أحمد بن علي العجمي',
    nameEn: 'Ahmed Al-Ajmy',
    letter: 'أ',
    bioAr: 'قارئ سعودي شهير، تميز بقوة الصوت ووضوح المخارج وحضور التلاوة المؤثر.',
    riwayah: 'حفص عن عاصم',
    isFeatured: true,
    isActive: true,
    totalSurahs: 114,
    moshafList: [
      {
        id: 1,
        nameAr: 'حفص عن عاصم - مرتل',
        riwayahName: 'حفص عن عاصم',
        serverUrl: 'https://server10.mp3quran.net/ajm/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      }
    ]
  },
  {
    id: 'shatri',
    numericId: 4,
    nameAr: 'أبو بكر الشاطري',
    nameEn: 'Abu Bakr Al-Shatri',
    letter: 'أ',
    bioAr: 'قارئ يمني مقيم في السعودية، عُرف بتلاوته الهادئة الخاشعة المتميزة.',
    riwayah: 'حفص عن عاصم',
    isFeatured: false,
    isActive: true,
    totalSurahs: 114,
    moshafList: [
      {
        id: 1,
        nameAr: 'حفص عن عاصم - مرتل',
        riwayahName: 'حفص عن عاصم',
        serverUrl: 'https://server11.mp3quran.net/shatri/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      }
    ]
  },
  {
    id: 'hudhaify',
    numericId: 74,
    nameAr: 'علي بن عبد الرحمن الحذيفي',
    nameEn: 'Ali Al-Hudhaify',
    letter: 'ع',
    bioAr: 'إمام وخطيب المسجد النبوي الشريف، وأحد كبار العلماء والقراء المتقنين في العصر الحديث.',
    riwayah: 'حفص عن عاصم',
    isFeatured: false,
    isActive: true,
    totalSurahs: 114,
    moshafList: [
      {
        id: 1,
        nameAr: 'حفص عن عاصم - مرتل',
        riwayahName: 'حفص عن عاصم',
        serverUrl: 'https://server9.mp3quran.net/hthfi/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      },
      {
        id: 2,
        nameAr: 'قالون عن نافع - مرتل',
        riwayahName: 'قالون عن نافع',
        serverUrl: 'https://server9.mp3quran.net/huthifi_qalon/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      }
    ]
  },
  {
    id: 'khaled-jleel',
    numericId: 20,
    nameAr: 'خالد الجليل',
    nameEn: 'Khaled Al-Jalil',
    letter: 'خ',
    bioAr: 'إمام جامع الملك خالد بالرياض، اشتهر بتلاوات مؤثرة من صلاة التراويح والقيام.',
    riwayah: 'حفص عن عاصم',
    isFeatured: false,
    isActive: true,
    totalSurahs: 114,
    moshafList: [
      {
        id: 1,
        nameAr: 'حفص عن عاصم - مرتل',
        riwayahName: 'حفص عن عاصم',
        serverUrl: 'https://server10.mp3quran.net/jleel/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      }
    ]
  },
  {
    id: 'idrees-abkar',
    numericId: 12,
    nameAr: 'إدريس أبكر',
    nameEn: 'Idrees Abkar',
    letter: 'إ',
    bioAr: 'قارئ وإمام جامع الشيخ زايد الكبير بأبوظبي، صاحب الصوت الحنون الباكي في التلاوة والدعاء.',
    riwayah: 'حفص عن عاصم',
    isFeatured: false,
    isActive: true,
    totalSurahs: 114,
    moshafList: [
      {
        id: 1,
        nameAr: 'حفص عن عاصم - مرتل',
        riwayahName: 'حفص عن عاصم',
        serverUrl: 'https://server6.mp3quran.net/abkr/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      }
    ]
  },
  {
    id: 'ali-jaber',
    numericId: 76,
    nameAr: 'علي عبد الله جابر',
    nameEn: 'Ali Jaber',
    letter: 'ع',
    bioAr: 'إمام المسجد الحرام الأسبق رحمه الله، صاحب التلاوة الحجازية العذبة الخالدة.',
    riwayah: 'حفص عن عاصم',
    isFeatured: false,
    isActive: true,
    totalSurahs: 114,
    moshafList: [
      {
        id: 1,
        nameAr: 'حفص عن عاصم - مرتل',
        riwayahName: 'حفص عن عاصم',
        serverUrl: 'https://server11.mp3quran.net/a_jbr/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      }
    ]
  },
  {
    id: 'mohamed-ayyub',
    numericId: 109,
    nameAr: 'محمد أيوب',
    nameEn: 'Mohamed Ayyub',
    letter: 'م',
    bioAr: 'إمام المسجد النبوي الشريف رحمه الله، تميز بطريقة حجازية فريدة وإتقان عجيب.',
    riwayah: 'حفص عن عاصم',
    isFeatured: false,
    isActive: true,
    totalSurahs: 114,
    moshafList: [
      {
        id: 1,
        nameAr: 'حفص عن عاصم - مرتل',
        riwayahName: 'حفص عن عاصم',
        serverUrl: 'https://server8.mp3quran.net/ayyub/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      }
    ]
  },
  {
    id: 'abdulrasheed-soufi',
    numericId: 64,
    nameAr: 'عبد الرشيد صوفي',
    nameEn: 'Abdul Rasheed Soufi',
    letter: 'ع',
    bioAr: 'عالم وقارئ مشهور بضبط القراءات العشر وتلاوة القرآن بالروايات المتواترة بدقة بالغة.',
    riwayah: 'السوسي عن أبي عمرو',
    isFeatured: true,
    isActive: true,
    totalSurahs: 114,
    moshafList: [
      {
        id: 1,
        nameAr: 'السوسي عن أبي عمرو - مرتل',
        riwayahName: 'السوسي عن أبي عمرو',
        serverUrl: 'https://server16.mp3quran.net/soufi/Rewayat-Assosi-A-n-Abi-Amr/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      },
      {
        id: 2,
        nameAr: 'خلف عن حمزة - مرتل',
        riwayahName: 'خلف عن حمزة',
        serverUrl: 'https://server16.mp3quran.net/soufi/Rewayat-Khalaf-A-n-Hamzah/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      },
      {
        id: 3,
        nameAr: 'حفص عن عاصم - مرتل',
        riwayahName: 'حفص عن عاصم',
        serverUrl: 'https://server16.mp3quran.net/soufi/Rewayat-Hafs-A-n-Assem/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      }
    ]
  },
  {
    id: 'ibrahim-dosari',
    numericId: 178,
    nameAr: 'إبراهيم بن سعيد الدوسري',
    nameEn: 'Ibrahim Al-Dossari',
    letter: 'إ',
    bioAr: 'أستاذ القراءات بجامعة الإمام محمد بن سعود الإسلامية، متخصص في القراءات والروايات القرآنية.',
    riwayah: 'ورش عن نافع',
    isFeatured: false,
    isActive: true,
    totalSurahs: 114,
    moshafList: [
      {
        id: 1,
        nameAr: 'ورش عن نافع - مرتل',
        riwayahName: 'ورش عن نافع',
        serverUrl: 'https://server10.mp3quran.net/ibrahim_dosri/Rewayat-Warsh-A-n-Nafi/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      },
      {
        id: 2,
        nameAr: 'حفص عن عاصم - مرتل',
        riwayahName: 'حفص عن عاصم',
        serverUrl: 'https://server10.mp3quran.net/ibrahim_dosri/Rewayat-Hafs-A-n-Assem/',
        surahTotal: 114,
        surahList: ALL_SURAH_NUMBERS
      }
    ]
  }
];

// Verified Riwayaat options for UI filtering
export const VERIFIED_RIWAYAAT_LIST = [
  'الكل',
  'حفص عن عاصم',
  'ورش عن نافع',
  'قالون عن نافع',
  'المصحف المجود',
  'السوسي عن أبي عمرو',
  'الدوري عن أبي عمرو',
  'خلف عن حمزة'
];
