export interface TafsirSourceInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  authorAr: string;
  centuryAr: string;
  institutionAr: string;
  styleDescriptionAr: string;
  referenceUrl?: string;
  verified: boolean;
}

export interface AyahTafsirComparisonRecord {
  surahNumber: number;
  ayahNumber: number;
  ayahText: string;
  tafsirs: Record<string, {
    sourceId: string;
    textAr: string;
    scholarlyFocusAr: string;
    volumePageRef?: string;
  }>;
}

export const AVAILABLE_TAFSIR_SOURCES: TafsirSourceInfo[] = [
  {
    id: 'muyassar',
    nameAr: 'التفسير الميسر',
    nameEn: 'Al-Tafsir Al-Muyassar',
    authorAr: 'نخبة من أساتذة التفسير',
    centuryAr: 'المعاصر',
    institutionAr: 'مجمع الملك فهد لطباعة المصحف الشريف بالمدينة المنورة',
    styleDescriptionAr: 'تفسير إجمالي واضح وموجز يعتمد المأثور واللغة العربية السليمة',
    referenceUrl: 'https://qurancomplex.gov.sa',
    verified: true
  },
  {
    id: 'ibn_kathir',
    nameAr: 'تفسير ابن كثير (تفسير القرآن العظيم)',
    nameEn: 'Tafsir Ibn Kathir',
    authorAr: 'الحافظ عماد الدين إسماعيل بن كثير (ت 774هـ)',
    centuryAr: 'القرن الثامن الهجري',
    institutionAr: 'أشهر وأصح كتب التفسير بالمأثور',
    styleDescriptionAr: 'تفسير القرآن بالقرآن، ثم بالسنة النبوية وأقوال الصحابة والتابعين مع بيان الأسانيد',
    referenceUrl: 'https://quran.ksu.edu.sa',
    verified: true
  },
  {
    id: 'saadi',
    nameAr: 'تفسير السعدي (تيسير الكريم الرحمن)',
    nameEn: 'Tafsir Al-Saadi',
    authorAr: 'الشيخ عبد الرحمن بن ناصر السعدي (ت 1376هـ)',
    centuryAr: 'القرن الرابع عشر الهجري',
    institutionAr: 'دار ابن الجوزي / مؤسسة الرسالة',
    styleDescriptionAr: 'تفسير إيماني تربوي يركز على مقاصد الآيات والهدايات العملية والأخلاقية',
    referenceUrl: 'https://quran.ksu.edu.sa',
    verified: true
  },
  {
    id: 'qurtubi',
    nameAr: 'تفسير القرطبي (الجامع لأحكام القرآن)',
    nameEn: 'Tafsir Al-Qurtubi',
    authorAr: 'الإمام أبو عبد الله محمد بن أحمد القرطبي (ت 671هـ)',
    centuryAr: 'القرن السابع الهجري',
    institutionAr: 'دار الفكر / دار الكتب العلمية',
    styleDescriptionAr: 'تفسير فقهي موسع يستنبط الأحكام الشرعية والفقهية المقارنة مع تحقيق اللغة والقراءات',
    referenceUrl: 'https://quran.ksu.edu.sa',
    verified: true
  },
  {
    id: 'jalalayn',
    nameAr: 'تفسير الجلالين',
    nameEn: 'Tafsir Al-Jalalayn',
    authorAr: 'جلال الدين المحلي وجلال الدين السيوطي (ت 911هـ)',
    centuryAr: 'القرن العاشر الهجري',
    institutionAr: 'دار الحديث بالقاهرة',
    styleDescriptionAr: 'تفسير موجز دقيق يذكر معاني المفردات ووجوه الإعراب الأساسية باختصار شديد',
    referenceUrl: 'https://quran.ksu.edu.sa',
    verified: true
  }
];

export const TAFSIR_COMPARISON_DATA: AyahTafsirComparisonRecord[] = [
  {
    surahNumber: 1,
    ayahNumber: 5,
    ayahText: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    tafsirs: {
      muyassar: {
        sourceId: 'muyassar',
        textAr: 'إنا نخصك وحدك بالعبادة، ونستعين بك وحدك في جميع أمورنا، فالأمر كله بيدك لا يملك منه أحد مثقال ذرة.',
        scholarlyFocusAr: 'إفراد الله تعالى بالعبادة والاستعانة مع التبرؤ من الحول والقوة.',
        volumePageRef: 'التفسير الميسر، ص 1'
      },
      ibn_kathir: {
        sourceId: 'ibn_kathir',
        textAr: 'قدّم العبادة على الاستعانة لأن العبادة لله هي الغاية التي خُلق العباد لأجلها، والاستعانة وسيلة إليها. وتحول الكلام من الغيبة (الحمد لله رب العالمين) إلى الخطاب بكاف الخطاب (إياك نعبد) استشعاراً لحضور العبد بين يدي ربه ومناجاته له.',
        scholarlyFocusAr: 'لطيفة بلاغية في الالتفات وتقديم حق الله على حاجة العبد.',
        volumePageRef: 'تفسير القرآن العظيم، ج 1، ص 134'
      },
      saadi: {
        sourceId: 'saadi',
        textAr: 'جمع بين العبادة والاستعانة لأن مدار العبودية والإخلاص عليهما؛ فالعبادة تبرؤ من الشرك، والاستعانة تبرؤ من الحول والقوة والتفويض إلى الله عز وجل، وتقديمهما على المعمول يفيد الحصر والاختصاص.',
        scholarlyFocusAr: 'التربية الإيمانية على الجمع بين العمل والتوكل.',
        volumePageRef: 'تيسير الكريم الرحمن، ص 39'
      },
      qurtubi: {
        sourceId: 'qurtubi',
        textAr: 'فيه دليل على أن العبد لا يستقل بفعله بل هو محتاج إلى معونة الله وتوفيقه في كل طرفة عين، وفيه الرد على القدرية والمعتزلة في زعمهم استقلال العبد بالخلق والفعل دون معونة ربه.',
        scholarlyFocusAr: 'المسألة الفقهية والعقدية في توفيق الله وإعانته.',
        volumePageRef: 'الجامع لأحكام القرآن، ج 1، ص 146'
      },
      jalalayn: {
        sourceId: 'jalalayn',
        textAr: '(إياك نعبد) نخصك بالعبادة من توحيد وغيره، (وإياك نستعين) نطلب معونتك على عبادتك وغيرها.',
        scholarlyFocusAr: 'بيان المعنى المعجمي والإعرابي الموجز.',
        volumePageRef: 'تفسير الجلالين، ص 1'
      }
    }
  },
  {
    surahNumber: 2,
    ayahNumber: 255,
    ayahText: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ',
    tafsirs: {
      muyassar: {
        sourceId: 'muyassar',
        textAr: 'الله الذي لا يستحق الألوهية والعبادة بحق إلا هو وحده، الحي في ذاته حياة كاملة لا نقص فيها، القيوم الذي قام بنفسه واستغنى عن خلقه، وقام بجميع المخلوقات فدبرها، لا يغلبه نعاس ولا نوم لكمال حياته وقيوميته.',
        scholarlyFocusAr: 'إثبات صفتي الحياة والقيومية ونفي الآفات.',
        volumePageRef: 'التفسير الميسر، ص 42'
      },
      ibn_kathir: {
        sourceId: 'ibn_kathir',
        textAr: 'هذه آية الكرسي ولها شأن عظيم، وقد صح الحديث عن رسول الله ﷺ بأنها أعظم آية في كتاب الله تعالى؛ لاشتمالها على أسماء الله الحسنى وصفاته العلا؛ فـ (الحي) الباقي الذي لا يموت، و(القيوم) القائم بحفظ الخلائق وأرزاقهم.',
        scholarlyFocusAr: 'تخريج فضل الآية النبوي والتحقيق في الأسماء الحسنى.',
        volumePageRef: 'تفسير القرآن العظيم، ج 1، ص 672'
      },
      saadi: {
        sourceId: 'saadi',
        textAr: 'اشتملت هذه الآية على توحيد الإلهية وتوحيد الربوبية والأسماء والصفات؛ فـ (الحي القيوم) اسمان يدور عليهما سائر الأسماء؛ فالحي متضمن لجميع صفات الذات، والقيوم متضمن لجميع صفات الأفعال.',
        scholarlyFocusAr: 'قاعدة في اشتمال اسمي الحي القيوم على سائر الأسماء والصفات.',
        volumePageRef: 'تيسير الكريم الرحمن، ص 110'
      },
      qurtubi: {
        sourceId: 'qurtubi',
        textAr: 'السِّنَة: النعاس، وهو ما يتقدم النوم من الفتور في الحواس، والنوم: الاستغراق الذي يغلب على العقل والتمييز. ونفيهما عن الله تعالى تنزيه واجب لأن النوم أخو الموت، والله منزه عن الموت والعجز.',
        scholarlyFocusAr: 'التحقيق اللغوي في الفرق بين السِّنة والنوم ودلالته العقدية.',
        volumePageRef: 'الجامع لأحكام القرآن، ج 3، ص 268'
      },
      jalalayn: {
        sourceId: 'jalalayn',
        textAr: '(الله لا إله) لا معبود بحق في الوجود (إلا هو الحي) الدائم البقاء (القيوم) المبالغ في القيام بتدبير خلقه (لا تأخذه سنة) نعاس (ولا نوم).',
        scholarlyFocusAr: 'إيضاح موجز للألفاظ بدقة بالغة.',
        volumePageRef: 'تفسير الجلالين، ص 42'
      }
    }
  },
  {
    surahNumber: 112,
    ayahNumber: 1,
    ayahText: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
    tafsirs: {
      muyassar: {
        sourceId: 'muyassar',
        textAr: 'قل -أيها الرسول- للمشركين السائلين عن ربك: هو الله الواحد الأحد الذي لا شريك له، ولا شبيه ولا نظير.',
        scholarlyFocusAr: 'تقرير التوحيد الخالص ونفي الشركاء والأنداد.',
        volumePageRef: 'التفسير الميسر، ص 604'
      },
      ibn_kathir: {
        sourceId: 'ibn_kathir',
        textAr: 'أي: هو الواحد الأحد، الذي لا نظير له، ولا وزير، ولا شبيه، ولا عديل، ولا يطلق هذا اللفظ على أحد في الإثبات إلا على الله عز وجل، لأنه الكامل في جميع صفاته وأفعاله.',
        scholarlyFocusAr: 'التحقيق العقدي في خصوصية لفظ الأحد لله تعالى.',
        volumePageRef: 'تفسير القرآن العظيم، ج 4، ص 570'
      },
      saadi: {
        sourceId: 'saadi',
        textAr: 'أي: منفرد بالكمال، له الأسماء الحسنى والصفات الكاملة العليا، والأفعال المقدسة، التي لا يشاركه فيها مشارك.',
        scholarlyFocusAr: 'بيان توحيد الأسماء والصفات وكمال الربوبية.',
        volumePageRef: 'تيسير الكريم الرحمن، ص 938'
      },
      qurtubi: {
        sourceId: 'qurtubi',
        textAr: 'أحد: أي واحد لا ثاني له، ولا يتجزأ ولا ينقسم، وليس كمثله شيء. و(أحد) أبلغ من (واحد) في نفي الشركاء والأجزاء.',
        scholarlyFocusAr: 'التحقيق اللغوي والبياني في الفرق بين الأحد والواحد.',
        volumePageRef: 'الجامع لأحكام القرآن، ج 20، ص 244'
      },
      jalalayn: {
        sourceId: 'jalalayn',
        textAr: '(قل هو الله أحد) بدل أو خبر، أي لا نظير له ولا شريك.',
        scholarlyFocusAr: 'الإعراب والإيجاز الدلالي.',
        volumePageRef: 'تفسير الجلالين، ص 604'
      }
    }
  }
];
