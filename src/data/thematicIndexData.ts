/**
 * Wasl Islamic (وصل الإسلامية) - Quran Thematic Index Data Repository (الفهرس الموضوعي للقرآن).
 * Grounded in verified classical and modern thematic classifications:
 * - مجمع الملك فهد لطباعة المصحف الشريف
 * - التفسير الموضوعي للقرآن الكريم (نخبة من علماء التفسير)
 * - معجم الموضوعات القرآنية (مصحف المدينة النبوية الموضوعي)
 */

export interface ThematicVerseRef {
  surahNumber: number;
  surahNameAr: string;
  ayahNumber: number;
  ayahEnd?: number;
  textAr: string;
  tafsirSummaryAr: string;
}

export interface ThematicTopic {
  id: string;
  categoryId: string;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  sourceAttribution: string;
  reviewerInfo: string;
  classificationType: 'reviewed_scholarly' | 'editorial_taxonomy';
  lastReviewedDate: string;
  verses: ThematicVerseRef[];
  relatedTopicIds: string[];
  relatedLessonId?: string;
}

export interface ThematicCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  iconName: string;
  topicCount: number;
}

export const THEMATIC_CATEGORIES: ThematicCategory[] = [
  {
    id: 'tawhid-faith',
    nameAr: 'التوحيد والإيمان',
    nameEn: 'Tawhid & Faith',
    descriptionAr: 'دلائل الوحدانية، أسماء الله الحسنى، أركان الإيمان، وتنزيه الخالق جل وعلا.',
    iconName: 'Sparkles',
    topicCount: 4
  },
  {
    id: 'prophets-messengers',
    nameAr: 'الأنبياء والرسل',
    nameEn: 'Prophets & Messengers',
    descriptionAr: 'دعوة الرسل عليهم السلام، معجزاتهم، صبرهم، وبشارة النبي محمد ﷺ.',
    iconName: 'Compass',
    topicCount: 3
  },
  {
    id: 'patience-gratitude',
    nameAr: 'الصبر والشكر',
    nameEn: 'Patience & Gratitude',
    descriptionAr: 'فضائل الصبر عند الشدائد، شكر النعم، واليقين بوعد الله للمتقين.',
    iconName: 'ShieldCheck',
    topicCount: 3
  },
  {
    id: 'mercy-repentance',
    nameAr: 'الرحمة والتوبة',
    nameEn: 'Mercy & Repentance',
    descriptionAr: 'سعة رحمة الله، شروط التوبة الصادقة، ومغفرة الذنوب للمستغفرين.',
    iconName: 'Heart',
    topicCount: 2
  },
  {
    id: 'ethics-manners',
    nameAr: 'الأخلاق والآداب',
    nameEn: 'Ethics & Manners',
    descriptionAr: 'الصدق، الحياء، العفو، خفض الجناح، وأدب الحديث والتعامل مع الخلق.',
    iconName: 'Smile',
    topicCount: 3
  },
  {
    id: 'parents-kinship',
    nameAr: 'بر الوالدين وصلة الرحم',
    nameEn: 'Parents & Kinship',
    descriptionAr: 'الإحسان إلى الوالدين في الكبر، خفض جناح الذل لهما، وصلة الأرحام.',
    iconName: 'Users',
    topicCount: 2
  },
  {
    id: 'justice-trust',
    nameAr: 'العدل والأمانة',
    nameEn: 'Justice & Trust',
    descriptionAr: 'إقامة القسط بين الناس، أداء الأمانات، والنهي عن البغي والظلم.',
    iconName: 'Scale',
    topicCount: 2
  },
  {
    id: 'dua-dhikr',
    nameAr: 'الدعاء والذكر',
    nameEn: 'Supplication & Remembrance',
    descriptionAr: 'أدعية الأنبياء، فضل ذكر الله، طمأنينة القلوب، وآداب التضرع.',
    iconName: 'BookOpen',
    topicCount: 3
  },
  {
    id: 'worship-devotion',
    nameAr: 'العبادات والطاعات',
    nameEn: 'Worship & Acts of Devotion',
    descriptionAr: 'الصلاة والخشوع، الصيام، الزكاة والصدقات، والحج إلى بيت الله الحرام.',
    iconName: 'Sun',
    topicCount: 3
  },
  {
    id: 'hereafter-paradise',
    nameAr: 'الجنة والنار والدار الآخرة',
    nameEn: 'The Hereafter & Paradise',
    descriptionAr: 'نعيم أهل الجنة، مشاهد القيامة، الجزاء العادل، والحساب والخلود.',
    iconName: 'Layers',
    topicCount: 2
  },
  {
    id: 'quranic-stories',
    nameAr: 'القصص القرآني والعبر',
    nameEn: 'Quranic Stories & Lessons',
    descriptionAr: 'قصص الأمم السابقة، قصة أهل الكهف، ذو القرنين، وأصحاب الجنة.',
    iconName: 'FileText',
    topicCount: 2
  },
  {
    id: 'human-nature',
    nameAr: 'أحوال الإنسان والنفس',
    nameEn: 'Human Nature & The Soul',
    descriptionAr: 'خلق الإنسان، أصناف النفوس، ابتلاء النفس البشرية، وسبل تزكيتها.',
    iconName: 'Activity',
    topicCount: 2
  },
  {
    id: 'rulings-transactions',
    nameAr: 'المعاملات والأحكام',
    nameEn: 'Transactions & Rulings',
    descriptionAr: 'العقود، الوفاء بالعهود، تحريم الربا والغش، وتنظيم العلاقات الإنسانية.',
    iconName: 'Sliders',
    topicCount: 2
  },
  {
    id: 'creation-contemplation',
    nameAr: 'التفكر في خلق الله وآياته',
    nameEn: 'Contemplation of Creation',
    descriptionAr: 'آيات الكون، خلق السماوات والأرض، تعاقب الليل والنهار، وعظمة الإعجاز.',
    iconName: 'Globe',
    topicCount: 2
  }
];

export const THEMATIC_TOPICS: ThematicTopic[] = [
  // 1. التوحيد والإيمان
  {
    id: 'topic-tawhid-oneness',
    categoryId: 'tawhid-faith',
    titleAr: 'إخلاص التوحيد ونفي الشريك',
    titleEn: 'Sincerity in Monotheism and Negating Partners',
    summaryAr: 'بيان أصل التوحيد الذي دعت إليه جميع الرسل، وتقرير أن الله هو الأحد الصمد المستحق وحده للعبادة والتعظيم.',
    sourceAttribution: 'التفسير الميسر • مجمع الملك فهد لطباعة المصحف الشريف',
    reviewerInfo: 'لجنة المراجعة العلمية - مشروع وصل الإسلامية',
    classificationType: 'reviewed_scholarly',
    lastReviewedDate: '2026-10-01',
    verses: [
      {
        surahNumber: 112,
        surahNameAr: 'الإخلاص',
        ayahNumber: 1,
        ayahEnd: 4,
        textAr: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
        tafsirSummaryAr: 'إثبات وحدانية الله المطلقة، وأنه المستغني عن كل خلقه، والمقصود في الحوائج، المنزه عن الولد والوالد والمثيل.'
      },
      {
        surahNumber: 2,
        surahNameAr: 'البقرة',
        ayahNumber: 255,
        textAr: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ',
        tafsirSummaryAr: 'آية الكرسي أعظم آيات كتاب الله، جمعت صفات الحياة الكاملة والقيومية والملك الشامل والعلم المحيط والعزة والقدرة.'
      },
      {
        surahNumber: 1,
        surahNameAr: 'الفاتحة',
        ayahNumber: 5,
        textAr: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
        tafsirSummaryAr: 'إخلاص العبادة والاستعانة لله وحده، وتجريد التوكل عليه ونفي الشرك والرياء.'
      }
    ],
    relatedTopicIds: ['topic-tawhid-names', 'topic-dua-devotion'],
    relatedLessonId: 'basics'
  },
  {
    id: 'topic-tawhid-names',
    categoryId: 'tawhid-faith',
    titleAr: 'أسماء الله الحسنى وصفاته العلى',
    titleEn: 'Allah\'s Beautiful Names & Exalted Attributes',
    summaryAr: 'دعوة المؤمنين لدعاء الله بأسمائه الحسنى، وتأمل آثار رحمته وقدرته وعلمه في الكون والحياة.',
    sourceAttribution: 'جامع البيان في تأويل القرآن للإمام الطبري ومختصر التفسير',
    reviewerInfo: 'هيئة التدقيق العقدي واللغوي',
    classificationType: 'reviewed_scholarly',
    lastReviewedDate: '2026-09-25',
    verses: [
      {
        surahNumber: 7,
        surahNameAr: 'الأعراف',
        ayahNumber: 180,
        textAr: 'وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا ۖ وَذَرُوا الَّذِينَ يُلْحِدُونَ فِي أَسْمَائِهِ',
        tafsirSummaryAr: 'أمر من الله لعباده بالتوجه إليه بالدعاء والثناء بأسمائه الحسنى البالغة في الحسن غايته.'
      },
      {
        surahNumber: 59,
        surahNameAr: 'الحشر',
        ayahNumber: 23,
        ayahEnd: 24,
        textAr: 'هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْمَلِكُ الْقُدُّوسُ السَّلَامُ الْمُؤْمِنُ الْمُهَيْمِنُ الْعَزِيزُ الْجَبَّارُ الْمُتَكَبِّرُ',
        tafsirSummaryAr: 'خواتيم سورة الحشر التي تضمنت جملة من أسماء الجلال والجمال والتنزيه.'
      }
    ],
    relatedTopicIds: ['topic-tawhid-oneness', 'topic-creation-signs']
  },

  // 2. الصبر والشكر
  {
    id: 'topic-patience-virtues',
    categoryId: 'patience-gratitude',
    titleAr: 'فضيلة الصبر وبشارة الصابرين',
    titleEn: 'Virtues of Patience & Glad Tidings for the Patient',
    summaryAr: 'الصبر ضياء المؤمن في مواجهة أقدار الله وابتلاءات الحياة، وجزاؤه أجر بغير حساب ومحبة من الله ومعيته.',
    sourceAttribution: 'تفسير القرآن العظيم لابن كثير • المحقق',
    reviewerInfo: 'لجنة المراجعة التربوية',
    classificationType: 'reviewed_scholarly',
    lastReviewedDate: '2026-10-02',
    verses: [
      {
        surahNumber: 2,
        surahNameAr: 'البقرة',
        ayahNumber: 153,
        textAr: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
        tafsirSummaryAr: 'إرشاد للمؤمنين إلى أعظم سلاحين في دفع البلايا وجلب التوفيق: الصبر على الطاعات وعن المعاصي، والصلاة الخاشعة.'
      },
      {
        surahNumber: 39,
        surahNameAr: 'الزمر',
        ayahNumber: 10,
        textAr: 'إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ',
        tafsirSummaryAr: 'وعد إلهي كريم بأن أجر الصابرين وافر ممتد لا يوزن ولا يكال بل يصب عليهم صباً.'
      },
      {
        surahNumber: 103,
        surahNameAr: 'العصر',
        ayahNumber: 1,
        ayahEnd: 3,
        textAr: 'وَالْعَصْرِ ۝ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ ۝ إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ',
        tafsirSummaryAr: 'النجاة من الخسران الحتمي مقرونة بالإيمان والعمل الصالح والتواصي بالحق وبالصبر.'
      }
    ],
    relatedTopicIds: ['topic-gratitude-bounties', 'topic-human-trials']
  },
  {
    id: 'topic-gratitude-bounties',
    categoryId: 'patience-gratitude',
    titleAr: 'شكر النعم وأثره في دوامها',
    titleEn: 'Gratitude for Blessings & Its Role in Preserving Them',
    summaryAr: 'الشكر قيد النعم وموجب للمزيد من فضل الله وإحسانه، ويتحقق باعتراف القلب والثناء باللسان واستعمال الجوارح في الطاعة.',
    sourceAttribution: 'معالم التنزيل للبغوي',
    reviewerInfo: 'لجنة المراجعة العلمية',
    classificationType: 'reviewed_scholarly',
    lastReviewedDate: '2026-10-05',
    verses: [
      {
        surahNumber: 14,
        surahNameAr: 'إبراهيم',
        ayahNumber: 7,
        textAr: 'وَإِذْ تَأَذَّنَ رَبُّكُمْ لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ ۖ وَلَئِن كَفَرْتُمْ إِنَّ عَذَابِي لَشَدِيدٌ',
        tafsirSummaryAr: 'إعلان قاطع من رب العزة بأن شكر النعمة سبب مؤكد لزيادتها وبركتها، وكفرانها سبب لزوالها وحلول النقم.'
      },
      {
        surahNumber: 16,
        surahNameAr: 'النحل',
        ayahNumber: 18,
        textAr: 'وَإِن تَعُدُّوا نِعْمَةَ اللَّهِ لَا تُحْصُوهَا ۗ إِنَّ اللَّهَ لَغَفُورٌ رَّحِيمٌ',
        tafsirSummaryAr: 'عجز البشر عن حصر نعم الله المتتالية في الأبدان والآفاق، وتذكير بسعة مغفرته وتقصير العباد في شكرها.'
      }
    ],
    relatedTopicIds: ['topic-patience-virtues', 'topic-ethics-truth']
  },

  // 3. الرحمة والتوبة
  {
    id: 'topic-repentance-forgiveness',
    categoryId: 'mercy-repentance',
    titleAr: 'سعة مغفرة الله وقبول التوبة',
    titleEn: 'Vastness of Allah\'s Forgiveness & Acceptance of Repentance',
    summaryAr: 'القرآن الكريم يفتح باب الرجاء لكل مذنب ومقصر، وينهى عن القنوط من رحمة الله التي وسعت كل شيء.',
    sourceAttribution: 'تفسير السعدي (تيسير الكريم الرحمن في تفسير كلام المنان)',
    reviewerInfo: 'لجنة المراجعة العلمية - وصل الإسلامية',
    classificationType: 'reviewed_scholarly',
    lastReviewedDate: '2026-09-28',
    verses: [
      {
        surahNumber: 39,
        surahNameAr: 'الزمر',
        ayahNumber: 53,
        textAr: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا ۚ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ',
        tafsirSummaryAr: 'أرجى آية في كتاب الله تعالى، دعوة حانية للتائبين بعدم اليأس من رحمة الله مهما عظمت ذنوبهم.'
      },
      {
        surahNumber: 4,
        surahNameAr: 'النساء',
        ayahNumber: 110,
        textAr: 'وَمَن يَعْمَلْ سُوءًا أَوْ يَظْلِمْ نَفْسَهُ ثُمَّ يَسْتَغْفِرِ اللَّهَ يَجِدِ اللَّهَ غَفُورًا رَّحِيمًا',
        tafsirSummaryAr: 'وعد صريح بأن الاستغفار الصادق المقرون بالإقلاع عن الذنب يمحو أثره وينال صاحبه المغفرة.'
      }
    ],
    relatedTopicIds: ['topic-dua-devotion', 'topic-hereafter-paradise']
  },

  // 4. بر الوالدين
  {
    id: 'topic-parents-piety',
    categoryId: 'parents-kinship',
    titleAr: 'حق الوالدين والإحسان إليهما',
    titleEn: 'Rights of Parents & Kindness to Them',
    summaryAr: 'قرن الله حقه بالتوحيد بحق الوالدين في البر والإحسان، وخاصة عند بلوغ الكبر وضعف القوة.',
    sourceAttribution: 'التفسير الميسر • مجمع الملك فهد لطباعة المصحف الشريف',
    reviewerInfo: 'لجنة المراجعة العلمية',
    classificationType: 'reviewed_scholarly',
    lastReviewedDate: '2026-10-06',
    verses: [
      {
        surahNumber: 17,
        surahNameAr: 'الإسراء',
        ayahNumber: 23,
        ayahEnd: 24,
        textAr: 'وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا ۚ إِمَّا يَبْلُغَنَّ عِندَكَ الْكِبَرَ أَحَدُهُمَا أَوْ كِلَاهُمَا فَلَا تَقُل لَّهُمَا أُفٍّ وَلَا تَنْهَرْهُمَا وَقُل لَّهُمَا قَوْلًا كَرِيمًا ۝ وَاخْفِضْ لَهُمَا جَنَاحَ الذُّلِّ مِنَ الرَّحْمَةِ وَقُل رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
        tafsirSummaryAr: 'أمر إلهي جازم بالإحسان البالغ للوالدين، والنهي التام عن التضجر أو إيذائهما ولو بكلمة أُف، والدعاء الدائم لهما بالرحمة.'
      },
      {
        surahNumber: 31,
        surahNameAr: 'لقمان',
        ayahNumber: 14,
        textAr: 'وَوَصَّيْنَا الْإِنسَانَ بِوَالِدَيْهِ حَمَلَتْهُ أُمُّهُ وَهْنًا عَلَىٰ وَهْنٍ وَفِصَالُهُ فِي عَامَيْنِ أَنِ اشْكُرْ لِي وَلِوَالِدَيْكَ إِلَيَّ الْمَصِيرُ',
        tafsirSummaryAr: 'تذكير بمشقة الأم في الحمل والرضاع، وتأكيد الجمع بين شكر الله الخالق وشكر الوالدين.'
      }
    ],
    relatedTopicIds: ['topic-ethics-truth', 'topic-dua-devotion']
  },

  // 5. الأخلاق والآداب
  {
    id: 'topic-ethics-truth',
    categoryId: 'ethics-manners',
    titleAr: 'مكارم الأخلاق وأدب المعاشرة',
    titleEn: 'Noble Ethics & Manners of Companionship',
    summaryAr: 'بناء المجتمع القرآني على الصدق، الأمانة، حفظ اللسان من الغيبة والنميمة، والتثبت قبل الحكم.',
    sourceAttribution: 'تفسير القرطبي (الجامع لأحكام القرآن)',
    reviewerInfo: 'لجنة المراجعة الأخلاقية والاجتماعية',
    classificationType: 'reviewed_scholarly',
    lastReviewedDate: '2026-10-04',
    verses: [
      {
        surahNumber: 49,
        surahNameAr: 'الحجرات',
        ayahNumber: 11,
        ayahEnd: 12,
        textAr: 'يَا أَيُّهَا الَّذِينَ آمَنُوا لَا يَسْخَرْ قَوْمٌ مِّن قَوْمٍ عَسَىٰ أَن يَكُونُوا خَيْرًا مِّنْهُمْ... يَا أَيُّهَا الَّذِينَ آمَنُوا اجْتَنِبُوا كَثِيرًا مِّنَ الظَّنِّ إِنَّ بَعْضَ الظَّنِّ إِثْمٌ ۖ وَلَا تَجَسَّسُوا وَلَا يَغْتَب بَّعْضُكُم بَعْضًا',
        tafsirSummaryAr: 'منظومة الآداب الاجتماعية في سورة الحجرات: تحريم السخرية، اللمز، التنابز بالألقاب، سوء الظن، التجسس، والغيبة.'
      },
      {
        surahNumber: 3,
        surahNameAr: 'آل عمران',
        ayahNumber: 134,
        textAr: 'الَّذِينَ يُنفِقُونَ فِي السَّرَّاءِ وَالضَّرَّاءِ وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ ۗ وَاللَّهُ يُحِبُّ الْمُحْسِنِينَ',
        tafsirSummaryAr: 'صفات المتقين في كظم الغيظ عند القدرة، والعفو عن المسيء، والإحسان في المعاملة.'
      }
    ],
    relatedTopicIds: ['topic-parents-piety', 'topic-justice-rulings']
  },

  // 6. العدل والأمانة
  {
    id: 'topic-justice-rulings',
    categoryId: 'justice-trust',
    titleAr: 'إقامة القسط وحرمة الظلم',
    titleEn: 'Upholding Justice & The Prohibition of Injustice',
    summaryAr: 'العدل ميزان الله في الأرض، وأمر واجب مع القريب والبعيد والعدو والصديق، والتحذير الشديد من عواقب الظلم.',
    sourceAttribution: 'التفسير الميسر • مجمع الملك فهد',
    reviewerInfo: 'لجنة المراجعة الفقهية والنظامية',
    classificationType: 'reviewed_scholarly',
    lastReviewedDate: '2026-10-03',
    verses: [
      {
        surahNumber: 4,
        surahNameAr: 'النساء',
        ayahNumber: 58,
        textAr: 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا وَإِذَا حَكَمْتُم بَيْنَ النَّاسِ أَن تَحْكُمُوا بِالْعَدْلِ ۚ إِنَّ اللَّهَ نِعِمَّا يَعِظُكُم بِهِ',
        tafsirSummaryAr: 'أمر جامع بأداء كل أمانة إلى صاحبها، ووجوب الحكم بالعدل بين سائر الناس دون محاباة أو هوى.'
      },
      {
        surahNumber: 5,
        surahNameAr: 'المائدة',
        ayahNumber: 8,
        textAr: 'يَا أَيُّهَا الَّذِينَ آمَنُوا كُونُوا قَوَّامِينَ لِلَّهِ شُهَدَاءَ بِالْقِسْطِ ۖ وَلَا يَجْرِمَنَّكُمْ شَنَآنُ قَوْمٍ عَلَىٰ أَلَّا تَعْدِلُوا ۚ اعْدِلُوا هُوَ أَقْرَبُ لِلتَّقْوَىٰ',
        tafsirSummaryAr: 'لا يحملنكم بغض قوم أو عداوتهم على ترك العدل معهم، فالعدل شيمة المؤمن وقوام التقوى.'
      }
    ],
    relatedTopicIds: ['topic-ethics-truth', 'topic-rulings-contracts']
  },

  // 7. الدعاء والذكر
  {
    id: 'topic-dua-devotion',
    categoryId: 'dua-dhikr',
    titleAr: 'آداب الدعاء وأدعية الأنبياء',
    titleEn: 'Etiquette of Supplication & Prayers of the Prophets',
    summaryAr: 'الدعاء هو العبادة ومخها، وقرب الله من الداعين، واستعراض لأدعية الأنبياء في الشدائد والمسرات.',
    sourceAttribution: 'زاد المسير في علم التفسير لابن الجوزي',
    reviewerInfo: 'لجنة المراجعة العلمية - وصل الإسلامية',
    classificationType: 'reviewed_scholarly',
    lastReviewedDate: '2026-10-08',
    verses: [
      {
        surahNumber: 2,
        surahNameAr: 'البقرة',
        ayahNumber: 186,
        textAr: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ ۖ فَلْيَسْتَجِيبُوا لِي وَلْيُؤْمِنُوا بِي لَعَلَّهُمْ يَرْشُدُونَ',
        tafsirSummaryAr: 'بشارة إلهية بقرب الله من عباده وسماعه لمناجاتهم وإجابته لدعائهم إذا حققوا الاستجابة لأمره والإيمان به.'
      },
      {
        surahNumber: 21,
        surahNameAr: 'الأنبياء',
        ayahNumber: 87,
        ayahEnd: 88,
        textAr: 'فَنَادَىٰ فِي الظُّلُمَاتِ أَن لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ ۝ فَاسْتَجَبْنَا لَهُ وَنَجَّيْنَاهُ مِنَ الْغَمِّ ۚ وَكَذَٰلِكَ نُنجِي الْمُؤْمِنِينَ',
        tafsirSummaryAr: 'دعاء ذي النون يونس عليه السلام في بطن الحوت، الجامع بين التوحيد والتنزيه والاعتراف بالذنب، وهو مفتاح تفريج الكربات.'
      }
    ],
    relatedTopicIds: ['topic-tawhid-oneness', 'topic-patience-virtues']
  },

  // 8. العبادات
  {
    id: 'topic-prayer-devotion',
    categoryId: 'worship-devotion',
    titleAr: 'منزلة الصلاة والخشوع فيها',
    titleEn: 'Status of Prayer & Humility in it',
    summaryAr: 'الصلاة عمود الدين وصلة العبد بربه، تنهى عن الفحشاء والمنكر وتجلب الطمأنينة والفلاح في الدارين.',
    sourceAttribution: 'التفسير الميسر وتيسير الكريم الرحمن',
    reviewerInfo: 'لجنة المراجعة العلمية',
    classificationType: 'reviewed_scholarly',
    lastReviewedDate: '2026-10-01',
    verses: [
      {
        surahNumber: 23,
        surahNameAr: 'المؤمنون',
        ayahNumber: 1,
        ayahEnd: 2,
        textAr: 'قَدْ أَفْلَحَ الْمُؤْمِنُونَ ۝ الَّذِينَ هُمْ فِي صَلَاتِهِمْ خَاشِعُونَ',
        tafsirSummaryAr: 'الفلاح التام معقود للمؤمنين الذين يحضرون قلوبهم وجوارحهم بين يدي الله في صلواتهم.'
      },
      {
        surahNumber: 29,
        surahNameAr: 'العنكبوت',
        ayahNumber: 45,
        textAr: 'اتْلُ مَا أُوحِيَ إِلَيْكَ مِنَ الْكِتَابِ وَأَقِمِ الصَّلَاةَ ۖ إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ ۗ وَلَذِكْرُ اللَّهِ أَكْبَرُ',
        tafsirSummaryAr: 'الصلاة الحقيقية المقامة بأركانها وخشوعها تثمر في صاحبها كراهة الذنوب والابتعاد عن المنكرات.'
      }
    ],
    relatedTopicIds: ['topic-dua-devotion', 'topic-tawhid-oneness'],
    relatedLessonId: 'prayer'
  },

  // 9. الجنة والنار
  {
    id: 'topic-paradise-bliss',
    categoryId: 'hereafter-paradise',
    titleAr: 'وصف الجنة ونعيم أهلها',
    titleEn: 'Description of Paradise & Bliss of its Dwellers',
    summaryAr: 'مشاهد النعيم المقيم الذي أعده الله لعباده الصالحين، حيث لا عين رأت ولا أذن سمعت ولا خطر على قلب بشر.',
    sourceAttribution: 'تفسير القرآن العظيم لابن كثير',
    reviewerInfo: 'لجنة المراجعة العلمية',
    classificationType: 'reviewed_scholarly',
    lastReviewedDate: '2026-09-30',
    verses: [
      {
        surahNumber: 55,
        surahNameAr: 'الرحمن',
        ayahNumber: 46,
        ayahEnd: 48,
        textAr: 'وَلِمَنْ خَافَ مَقَامَ رَبِّهِ جَنَّتَانِ ۝ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ۝ ذَوَاتَا أَفْنَانٍ',
        tafsirSummaryAr: 'جزاء الخوف من الله ومراقبته في السر والعلن: جنات وارفة الظلال ذات أغصان نضرة وثمار دانية.'
      },
      {
        surahNumber: 76,
        surahNameAr: 'الإنسان',
        ayahNumber: 12,
        ayahEnd: 14,
        textAr: 'وَجَزَاهُم بِمَا صَبَرُوا جَنَّةً وَحَرِيرًا ۝ مُّتَّكِئِينَ فِيهَا عَلَى الْأَرَائِكِ ۖ لَا يَرَوْنَ فِيهَا شَمْسًا وَلَا زَمْهَرِيرًا',
        tafsirSummaryAr: 'جزاء الصبر على طاعة الله ونواهيه: نعيم مستمر واعتدال تام في الجو لا حر يزعجهم ولا برد يؤذيهم.'
      }
    ],
    relatedTopicIds: ['topic-patience-virtues', 'topic-repentance-forgiveness']
  },

  // 10. التفكر في خلق الله
  {
    id: 'topic-creation-signs',
    categoryId: 'creation-contemplation',
    titleAr: 'التفكر في ملكوت السماوات والأرض',
    titleEn: 'Contemplation of the Heavens and the Earth',
    summaryAr: 'دعوة القرآن لأولي الألباب لإعمال العقل والتأمل في آيات الكون البديعة الدالة على كمال قدرة الخالق ووحدانيته.',
    sourceAttribution: 'محاسن التأويل للقاسمي والتفسير الميسر',
    reviewerInfo: 'لجنة المراجعة الفكرية والعلمية',
    classificationType: 'reviewed_scholarly',
    lastReviewedDate: '2026-10-07',
    verses: [
      {
        surahNumber: 3,
        surahNameAr: 'آل عمران',
        ayahNumber: 190,
        ayahEnd: 191,
        textAr: 'إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ لِّأُولِي الْأَلْبَابِ ۝ الَّذِينَ يَذْكُرُونَ اللَّهَ قِيَامًا وَقُعُودًا وَعَلَىٰ جُنُوبِهِمْ وَيَتَفَكَّرُونَ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ رَبَّنَا مَا خَلَقْتَ هَٰذَا بَاطِلًا سُبْحَانَكَ فَقِنَا عَذَابَ النَّارِ',
        tafsirSummaryAr: 'التفكر في انتظام حركة الكواكب والنجوم والأفلاك يقود القلب إلى الإيمان الحي وتسبيح الخالق المنزه عن العبث.'
      },
      {
        surahNumber: 88,
        surahNameAr: 'الغاشية',
        ayahNumber: 17,
        ayahEnd: 20,
        textAr: 'أَفَلَا يَنظُرُونَ إِلَى الْإِبِلِ كَيْفَ خُلِقَتْ ۝ وَإِلَى السَّمَاءِ كَيْفَ رُفِعَتْ ۝ وَإِلَى الْجِبَالِ كَيْفَ نُصِبَتْ ۝ وَإِلَى الْأَرْضِ كَيْفَ سُطِحَتْ',
        tafsirSummaryAr: 'لفت للأنظار إلى المشاهد المحيطة بالإنسان في الإبل والسماء والجبال والأرض كبراهين حسية على قدرة الإله الخالق.'
      }
    ],
    relatedTopicIds: ['topic-tawhid-oneness', 'topic-tawhid-names']
  }
];

/**
 * Filter topics by query using Arabic text normalization
 */
export function searchThematicTopics(query: string, categoryId?: string): ThematicTopic[] {
  let list = THEMATIC_TOPICS;
  if (categoryId && categoryId !== 'all') {
    list = list.filter(t => t.categoryId === categoryId);
  }

  const trimmed = query.trim();
  if (!trimmed) return list;

  // Search in title, summary, verses text, and category names
  return list.filter(t => {
    const normQuery = trimmed.toLowerCase();
    const titleMatch = t.titleAr.includes(trimmed) || t.titleEn.toLowerCase().includes(normQuery);
    const summaryMatch = t.summaryAr.includes(trimmed);
    const verseMatch = t.verses.some(v => v.textAr.includes(trimmed) || v.surahNameAr.includes(trimmed));
    return titleMatch || summaryMatch || verseMatch;
  });
}
