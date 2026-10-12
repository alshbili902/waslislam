export interface QuranDictionaryEntry {
  id: string;
  word: string; // e.g. "نَعْبُدُ"
  cleanWord: string; // normalized
  root: string; // e.g. "ع-ب-د"
  rootArabic: string; // "عبد"
  partOfSpeech: 'اسم' | 'فعل' | 'حرف' | 'مصدر';
  meaningAr: string;
  meaningEn: string;
  morphologyNote: string;
  surahNumber: number;
  ayahNumber: number;
  totalOccurrencesInQuran: number;
  relatedAyahs: {
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
    textSnippet: string;
  }[];
  lexicalSource: string;
}

export const QURAN_DICTIONARY_ENTRIES: QuranDictionaryEntry[] = [
  {
    id: 'dict-naabudu',
    word: 'نَعْبُدُ',
    cleanWord: 'نعبد',
    root: 'ع-ب-د',
    rootArabic: 'عبد',
    partOfSpeech: 'فعل',
    meaningAr: 'نخصك وحدك بأقصى غايات الخضوع والتذلل والمحبة، طاعةً لأمرك وابتغاءً لمرضاتك، فلا نعبد إلا إياك.',
    meaningEn: 'We worship and obey solely with the utmost humility, love, and submission.',
    morphologyNote: 'فعل مضارع مرفوع لتجرده عن الناصب والجازم، وعلامة رفعه الضمة الظاهرة، والفاعل ضمير مستتر تقديره (نحن).',
    surahNumber: 1,
    ayahNumber: 5,
    totalOccurrencesInQuran: 275,
    relatedAyahs: [
      { surahNumber: 2, surahName: 'البقرة', ayahNumber: 21, textSnippet: 'يَا أَيُّهَا النَّاسُ اعْبُدُوا رَبَّكُمُ الَّذِي خَلَقَكُمْ' },
      { surahNumber: 15, surahName: 'الحجر', ayahNumber: 99, textSnippet: 'وَاعْبُدْ رَبَّكَ حَتَّىٰ يَأْتِيَكَ الْيَقِينُ' },
      { surahNumber: 51, surahName: 'الذاريات', ayahNumber: 56, textSnippet: 'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ' }
    ],
    lexicalSource: 'مفردات ألفاظ القرآن للراغب الأصفهاني • كلمات القرآن للشيخ حسنين مخلوف'
  },
  {
    id: 'dict-nastaeen',
    word: 'نَسْتَعِينُ',
    cleanWord: 'نستعين',
    root: 'ع-و-ن',
    rootArabic: 'عون',
    partOfSpeech: 'فعل',
    meaningAr: 'نطلب منك وحدك العون والتأييد والتوفيق في جميع أمور ديننا ودنيانا، إذ لا حول ولا قوة إلا بك.',
    meaningEn: 'We ask for Your divine help, support, and guidance in all our matters.',
    morphologyNote: 'فعل مضارع من باب الاستفعال (استعان) يدل على طلب العون، مرفوع بالضمة.',
    surahNumber: 1,
    ayahNumber: 5,
    totalOccurrencesInQuran: 11,
    relatedAyahs: [
      { surahNumber: 2, surahName: 'البقرة', ayahNumber: 45, textSnippet: 'وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ وَإِنَّهَا لَكَبِيرَةٌ إِلَّا عَلَى الْخَاشِعِينَ' },
      { surahNumber: 7, surahName: 'الأعراف', ayahNumber: 128, textSnippet: 'قَالَ مُوسَىٰ لِقَوْمِهِ اسْتَعِينُوا بِاللَّهِ وَاصْبِرُوا' }
    ],
    lexicalSource: 'المعجم الاشتقاقي المؤصل لألفاظ القرآن الكريم • التفسير الميسر'
  },
  {
    id: 'dict-ihdina',
    word: 'اهْدِنَا',
    cleanWord: 'اهدنا',
    root: 'ه-د-ي',
    rootArabic: 'هدي',
    partOfSpeech: 'فعل',
    meaningAr: 'أرشدنا ووفقنا وثبتنا على الصراط المستقيم، ودلنا على طريق الحق والخير.',
    meaningEn: 'Guide us, direct us, and keep us firm upon the straight path.',
    morphologyNote: 'فعل دعاء وأمر من الله، مبني على حذف حرف العلة (الياء)، و(نا) ضمير متصل في محل نصب مفعول به.',
    surahNumber: 1,
    ayahNumber: 6,
    totalOccurrencesInQuran: 316,
    relatedAyahs: [
      { surahNumber: 2, surahName: 'البقرة', ayahNumber: 142, textSnippet: 'يَهْدِي مَن يَشَاءُ إِلَىٰ صِرَاطٍ مُّسْتَقِيمٍ' },
      { surahNumber: 6, surahName: 'الأنعام', ayahNumber: 161, textSnippet: 'قُلْ إِنَّنِي هَدَانِي رَبِّي إِلَىٰ صِرَاطٍ مُّسْتَقِيمٍ' }
    ],
    lexicalSource: 'مفردات ألفاظ القرآن للأصفهاني'
  },
  {
    id: 'dict-sirat',
    word: 'الصِّرَاطَ',
    cleanWord: 'الصراط',
    root: 'س-ر-ط',
    rootArabic: 'سرط',
    partOfSpeech: 'اسم',
    meaningAr: 'الطريق الواضح المستقيم الذي لا اعوجاج فيه، وهو دين الإسلام وكتاب الله وسنة نبيه ﷺ.',
    meaningEn: 'The clear, straight and upright path that has no deviation.',
    morphologyNote: 'اسم مفعول، مفعول به ثانٍ للفعل (اهدنا) منصوب وعلامة نصبه الفتحة.',
    surahNumber: 1,
    ayahNumber: 6,
    totalOccurrencesInQuran: 45,
    relatedAyahs: [
      { surahNumber: 3, surahName: 'آل عمران', ayahNumber: 51, textSnippet: 'إِنَّ اللَّهَ رَبِّي وَرَبُّكُمْ فَاعْبُدُوهُ ۗ هَٰذَا صِرَاطٌ مُّسْتَقِيمٌ' },
      { surahNumber: 42, surahName: 'الشورى', ayahNumber: 53, textSnippet: 'صِرَاطِ اللَّهِ الَّذِي لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ' }
    ],
    lexicalSource: 'معجم ألفاظ القرآن الكريم - مجمع اللغة العربية'
  },
  {
    id: 'dict-mustaqeem',
    word: 'الْمُسْتَقِيمَ',
    cleanWord: 'المستقيم',
    root: 'ق-و-م',
    rootArabic: 'قوم',
    partOfSpeech: 'اسم',
    meaningAr: 'القويم الذي لا ميل فيه ولا انحراف عن الحق والعدل.',
    meaningEn: 'The upright, sound, and unwavering without any crookedness.',
    morphologyNote: 'اسم فاعل من الفعل (استقام)، نعت لـ (الصراط) منصوب بالفتحة الظاهرة.',
    surahNumber: 1,
    ayahNumber: 6,
    totalOccurrencesInQuran: 660,
    relatedAyahs: [
      { surahNumber: 11, surahName: 'هود', ayahNumber: 112, textSnippet: 'فَاسْتَقِمْ كَمَا أُمِرْتَ وَمَن تَابَ مَعَكَ' },
      { surahNumber: 41, surahName: 'فصلت', ayahNumber: 30, textSnippet: 'إِنَّ الَّذِينَ قَالُوا رَبُّنَا اللَّهُ ثُمَّ اسْتَقَامُوا' }
    ],
    lexicalSource: 'مفردات ألفاظ القرآن للأصفهاني'
  },
  {
    id: 'dict-rayb',
    word: 'رَيْبَ',
    cleanWord: 'ريب',
    root: 'ر-ي-ب',
    rootArabic: 'ريب',
    partOfSpeech: 'اسم',
    meaningAr: 'الشك مع القلق والاضطراب؛ فالقرآن حق يقين لا شك فيه أنه منزل من عند الله.',
    meaningEn: 'Doubt, suspicion, or anxiety; affirming absolute divine certainty.',
    morphologyNote: 'اسم (لا) النافية للجنس، مبني على الفتح في محل نصب.',
    surahNumber: 2,
    ayahNumber: 2,
    totalOccurrencesInQuran: 36,
    relatedAyahs: [
      { surahNumber: 2, surahName: 'البقرة', ayahNumber: 23, textSnippet: 'وَإِن كُنتُمْ فِي رَيْبٍ مِّمَّا نَزَّلْنَا عَلَىٰ عَبْدِنَا' },
      { surahNumber: 22, surahName: 'الحج', ayahNumber: 5, textSnippet: 'يَا أَيُّهَا النَّاسُ إِن كُنتُمْ فِي رَيْبٍ مِّنَ الْبَعْثِ' }
    ],
    lexicalSource: 'لسان العرب • كلمات القرآن تفسير وبيان'
  },
  {
    id: 'dict-muttaqeen',
    word: 'الْمُتَّقِينَ',
    cleanWord: 'المتقين',
    root: 'و-ق-ي',
    rootArabic: 'وقي',
    partOfSpeech: 'اسم',
    meaningAr: 'الذين يجعلون بينهم وبين عذاب الله وقاية بفعل أوامره واجتناب نواهيه، خوفاً منه ورجاءً لثوابه.',
    meaningEn: 'The pious who guard themselves against Allah\'s displeasure by obeying His commands.',
    morphologyNote: 'جمع مذكر سالم لـ (متّقٍ)، اسم فاعل من (اتقى)، مجرور بالياء.',
    surahNumber: 2,
    ayahNumber: 2,
    totalOccurrencesInQuran: 258,
    relatedAyahs: [
      { surahNumber: 3, surahName: 'آل عمران', ayahNumber: 133, textSnippet: 'وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ أُعِدَّتْ لِلْمُتَّقِينَ' },
      { surahNumber: 49, surahName: 'الحجرات', ayahNumber: 13, textSnippet: 'إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ' }
    ],
    lexicalSource: 'مفردات ألفاظ القرآن للأصفهاني'
  },
  {
    id: 'dict-nur',
    word: 'نُورٌ',
    cleanWord: 'نور',
    root: 'ن-و-ر',
    rootArabic: 'نور',
    partOfSpeech: 'اسم',
    meaningAr: 'الضياء الساطع والهدى المبين الذي يكشف الظلمات ويهدي القلوب إلى الصراط المستقيم.',
    meaningEn: 'Radiant light and divine guidance illuminating darkness.',
    morphologyNote: 'اسم جامد، خبر مرفوع بالضمة الظاهرة.',
    surahNumber: 24,
    ayahNumber: 35,
    totalOccurrencesInQuran: 194,
    relatedAyahs: [
      { surahNumber: 24, surahName: 'النور', ayahNumber: 35, textSnippet: 'اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ' },
      { surahNumber: 5, surahName: 'المائدة', ayahNumber: 15, textSnippet: 'قَدْ جَاءَكُم مِّنَ اللَّهِ نُورٌ وَكِتَابٌ مُّبِينٌ' }
    ],
    lexicalSource: 'المعجم المفهرس لألفاظ القرآن الكريم'
  },
  {
    id: 'dict-kawthar',
    word: 'الْكَوْثَرَ',
    cleanWord: 'الكوثر',
    root: 'ك-ث-ر',
    rootArabic: 'كثر',
    partOfSpeech: 'اسم',
    meaningAr: 'الخير الكثير العميم في الدنيا والآخرة، ومنه نهر الكوثر الذي أعطاه الله لنبيه ﷺ في الجنة.',
    meaningEn: 'Abundant goodness, including the river of Al-Kawthar granted to the Prophet in Jannah.',
    morphologyNote: 'اسم على وزن فَوْعَل للمبالغة في الكثرة، مفعول به منصوب وعلامة نصبه الفتحة.',
    surahNumber: 108,
    ayahNumber: 1,
    totalOccurrencesInQuran: 1,
    relatedAyahs: [
      { surahNumber: 108, surahName: 'الكوثر', ayahNumber: 1, textSnippet: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ' }
    ],
    lexicalSource: 'مفردات الراغب الأصفهاني • صحيح البخاري في صفة الكوثر'
  },
  {
    id: 'dict-samad',
    word: 'الصَّمَدُ',
    cleanWord: 'الصمد',
    root: 'ص-م-د',
    rootArabic: 'صمد',
    partOfSpeech: 'اسم',
    meaningAr: 'السيد المطاع الكامل في سؤدده، الذي تصمد إليه الخلائق وتقصده في حوائجها ورغائبها.',
    meaningEn: 'The Self-Sufficient Master upon whom all creatures depend in every need.',
    morphologyNote: 'اسم فاعل مشبهة بالصفة، خبر مرفوع وعلامة رفعه الضمة.',
    surahNumber: 112,
    ayahNumber: 2,
    totalOccurrencesInQuran: 1,
    relatedAyahs: [
      { surahNumber: 112, surahName: 'الإخلاص', ayahNumber: 2, textSnippet: 'اللَّهُ الصَّمَدُ' }
    ],
    lexicalSource: 'مفردات ألفاظ القرآن للأصفهاني • لسان العرب'
  },
  {
    id: 'dict-falaq',
    word: 'الْفَلَقِ',
    cleanWord: 'الفلق',
    root: 'ف-ل-ق',
    rootArabic: 'فلق',
    partOfSpeech: 'اسم',
    meaningAr: 'الصبح إذا انشق نوره وانفلق عن ظلمة الليل، وقيل كل ما فلقه الله من الحب والنوى والخلائق.',
    meaningEn: 'The daybreak that cleaves through the darkness of night.',
    morphologyNote: 'اسم مصدر على وزن فَعَل، مضاف إليه مجرور بالكسرة.',
    surahNumber: 113,
    ayahNumber: 1,
    totalOccurrencesInQuran: 1,
    relatedAyahs: [
      { surahNumber: 113, surahName: 'الفلق', ayahNumber: 1, textSnippet: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ' },
      { surahNumber: 6, surahName: 'الأنعام', ayahNumber: 96, textSnippet: 'فَالِقُ الْإِصْبَاحِ وَجَعَلَ اللَّيْلَ سَكَنًا' }
    ],
    lexicalSource: 'مفردات ألفاظ القرآن للأصفهاني • كلمات القرآن لمخلوف'
  },
  {
    id: 'dict-waswas',
    word: 'الْوَسْوَاسِ',
    cleanWord: 'الوسواس',
    root: 'و-س-و-س',
    rootArabic: 'وسوس',
    partOfSpeech: 'اسم',
    meaningAr: 'الشيطان الذي يلقي الخواطر الرديئة في القلب بخفاء عند الغفلة، ويخنس عند ذكر الله.',
    meaningEn: 'The whisperer who casts evil suggestions into hearts secretly.',
    morphologyNote: 'اسم على وزن فَعْوال، مضاف إليه مجرور وعلامة جره الكسرة.',
    surahNumber: 114,
    ayahNumber: 4,
    totalOccurrencesInQuran: 1,
    relatedAyahs: [
      { surahNumber: 114, surahName: 'الناس', ayahNumber: 4, textSnippet: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ' }
    ],
    lexicalSource: 'مفردات ألفاظ القرآن للأصفهاني • التفسير الميسر'
  }
];
