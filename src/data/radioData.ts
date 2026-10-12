export interface RadioStation {
  id: string;
  nameAr: string;
  nameEn: string;
  streamUrl: string;
  category: 'quran' | 'reciter' | 'tafsir';
  countryAr: string;
  descriptionAr: string;
}

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'cairo-quran',
    nameAr: 'إذاعة القرآن الكريم من القاهرة',
    nameEn: 'Cairo Quran Radio',
    streamUrl: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
    category: 'quran',
    countryAr: 'مصر',
    descriptionAr: 'البث المباشر لأعرق إذاعة قرآنية في العالم العربي تضم كبار القراء.'
  },
  {
    id: 'saudi-quran',
    nameAr: 'إذاعة نداء الإسلام من مكة المكرمة',
    nameEn: 'Nidaa Al-Islam (Makkah)',
    streamUrl: 'https://stream.zeno.fm/08w22y5t1k8uv',
    category: 'quran',
    countryAr: 'السعودية',
    descriptionAr: 'البث المباشر لأجمل التلاوات وبرامج الفتوى والتفسير من جوار البيت العتيق.'
  },
  {
    id: 'khushoo-recitations',
    nameAr: 'إذاعة تلاوات خاشعة',
    nameEn: 'Reverent Recitations Radio',
    streamUrl: 'https://backup.qurango.net/radio/tarateel',
    category: 'quran',
    countryAr: 'عام',
    descriptionAr: 'بث متواصل لتلاوات قرآنية مؤثرة وخاشعة بأصوات نخبة من القراء.'
  },
  {
    id: 'alafasy-radio',
    nameAr: 'إذاعة الشيخ مشاري راشد العفاسي',
    nameEn: 'Mishary Alafasy Radio',
    streamUrl: 'https://backup.qurango.net/radio/mishary_alafasi',
    category: 'reciter',
    countryAr: 'الكويت',
    descriptionAr: 'تلاوات كاملة للقرآن الكريم برواية حفص عن عاصم بصوت الشيخ مشاري العفاسي.'
  },
  {
    id: 'abdulbasit-radio',
    nameAr: 'إذاعة الشيخ عبد الباسط عبد الصمد (المصحف المرتل)',
    nameEn: 'Abdul Basit Murattal Radio',
    streamUrl: 'https://backup.qurango.net/radio/abdulbasit_abdulsamad_mojawwad',
    category: 'reciter',
    countryAr: 'مصر',
    descriptionAr: 'التلاوات الخالدة لصوت مكة الشيخ عبد الباسط عبد الصمد رحمه الله.'
  },
  {
    id: 'tafsir-radio',
    nameAr: 'إذاعة تفسير القرآن الكريم',
    nameEn: 'Quran Tafsir Radio',
    streamUrl: 'https://backup.qurango.net/radio/tafseer',
    category: 'tafsir',
    countryAr: 'عام',
    descriptionAr: 'بيان معاني آيات القرآن الكريم وتدبر أحكامه وإعجازه اللغوي والبياني.'
  }
];
