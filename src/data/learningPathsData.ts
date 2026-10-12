/**
 * Wasl Islamic (وصل الإسلامية) - Guided Islamic Learning Paths Data Repository (المسارات التعليمية الموجهة).
 * Structured educational sequences organizing Quran study, Tafsir, Hadith, and worship fundamentals:
 * - مجمع الملك فهد لطباعة المصحف الشريف
 * - الرئاسة العامة للبحوث العلمية والإفتاء
 * - زاد المستقنع ومناهج المعاهد العلمية الشرعية
 */

export type PathStepType = 'reading' | 'quran_passage' | 'tafsir_study' | 'audio_listen' | 'reflection_quiz';

export interface PathStep {
  id: string;
  stepIndex: number;
  titleAr: string;
  lessonType: PathStepType;
  durationMinutes: number;
  contentSummaryAr: string;
  referenceSurah?: number;
  referenceAyah?: number;
  linkedAcademyLessonId?: string;
  reflectionQuestion?: string;
  sources: string[];
}

export interface GuidedLearningPath {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  category: 'quran' | 'seerah' | 'fiqh' | 'aqeedah' | 'manners' | 'new_muslim';
  categoryLabelAr: string;
  targetAudience: string;
  prerequisites: string;
  estimatedHours: number;
  iconName: string;
  isPublished: boolean;
  verifiedSources: string[];
  steps: PathStep[];
}

export const INITIAL_LEARNING_PATHS: GuidedLearningPath[] = [
  // 1. فهم مقاصد سورة الفاتحة وقصار السور
  {
    id: 'path-fatihah-short-surahs',
    titleAr: 'فهم مقاصد سورة الفاتحة وقصار السور',
    titleEn: 'Understanding Al-Fatihah & Short Surahs',
    descriptionAr: 'مسار تربوي إيماني يتناول أسرار سورة الفاتحة وقصار السور (الإخلاص، الفلق، الناس، الكوثر، العصر) وتدبر معانيها في الصلاة اليومية.',
    category: 'quran',
    categoryLabelAr: 'علوم وتدبر القرآن',
    targetAudience: 'عامة المسلمين والمصلين والراغبين في تحسين الخشوع في الصلاة',
    prerequisites: 'القدرة على القراءة بالعربية أو الاستماع للشرح',
    estimatedHours: 2.5,
    iconName: 'BookOpen',
    isPublished: true,
    verifiedSources: ['التفسير الميسر', 'تفسير السعدي', 'التحرير والتنوير لابن عاشور'],
    steps: [
      {
        id: 'step-fatihah-intro',
        stepIndex: 1,
        titleAr: 'عظمة سورة الفاتحة وأسماؤها وفضائلها',
        lessonType: 'reading',
        durationMinutes: 15,
        contentSummaryAr: 'الفاتحة هي أم القرآن والسبع المثاني والشفاء، فرض الله قراءتها في كل ركعة، وتضمنت مجمل مقاصد القرآن وأصول التوحيد.',
        referenceSurah: 1,
        referenceAyah: 1,
        reflectionQuestion: 'كيف تستحضر في صلاتك مناجاة الله لك عند قولك: الحمد لله رب العالمين؟',
        sources: ['صحيح مسلم • حديث قسمت الصلاة بيني وبين عبدي نصفين']
      },
      {
        id: 'step-fatihah-verses',
        stepIndex: 2,
        titleAr: 'تدبر آيات الفاتحة السبع آية آية',
        lessonType: 'quran_passage',
        durationMinutes: 20,
        contentSummaryAr: 'شرح معاني الاستعانة، والحمد، والصراط المستقيم، ومعرفة صفات المنعم عليهم والمغضوب عليهم والضالين.',
        referenceSurah: 1,
        referenceAyah: 5,
        reflectionQuestion: 'لماذا قُدمت العبادة على الاستعانة في قوله تعالى: (إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ)؟',
        sources: ['التفسير الميسر • مجمع الملك فهد']
      },
      {
        id: 'step-surah-ikhlas',
        stepIndex: 3,
        titleAr: 'سورة الإخلاص: ثلث القرآن وعقيدة التنزيه',
        lessonType: 'tafsir_study',
        durationMinutes: 20,
        contentSummaryAr: 'بيان معنى الأحدية والصمدية ونفي الولد والشريك والكفء، وسر كونها تعدل ثلث القرآن.',
        referenceSurah: 112,
        referenceAyah: 1,
        reflectionQuestion: 'ما معنى اسم الله (الصَّمَدُ) وكيف يعيش المؤمن به في حياته؟',
        sources: ['جامع البيان للطبري وتفسير ابن كثير']
      },
      {
        id: 'step-muawwidhatayn',
        stepIndex: 4,
        titleAr: 'المعوذتان (الفلق والناس): درع المؤمن من كل شر',
        lessonType: 'reading',
        durationMinutes: 20,
        contentSummaryAr: 'الاستعاذة برب الفلق من شر ما خلق، وبالناس ملك الناس إله الناس من الوسواس الخناس وأثرها في الحصن اليومي.',
        referenceSurah: 113,
        referenceAyah: 1,
        reflectionQuestion: 'كيف يحصن المسلم نفسه وأهله بالمعوذتين صباحاً ومساءً وعند النوم؟',
        sources: ['صحيح البخاري • هدي النبي ﷺ في التعويذ']
      }
    ]
  },

  // 2. فقه الطهارة والصلاة خطوة بخطوة
  {
    id: 'path-prayer-fiqh',
    titleAr: 'فقه الطهارة والصلاة خطوة بخطوة',
    titleEn: 'Fiqh of Purification & Prayer Step-by-Step',
    descriptionAr: 'دليل عملي تطبيقي يتعلم فيه المسلم صفة الوضوء الصحيحة وأركان الصلاة وسننها ومبطلاتها وسجود السهو وفق السنة النبوية الثابتة.',
    category: 'fiqh',
    categoryLabelAr: 'الفقه والعبادات',
    targetAudience: 'المسلمون الراغبون في تصحيح عباداتهم اليومية والناشئة',
    prerequisites: 'لا توجد متطلبات مسبقة',
    estimatedHours: 3.0,
    iconName: 'Compass',
    isPublished: true,
    verifiedSources: ['زاد المستقنع', 'صفة صلاة النبي ﷺ للألباني', 'فتاوى اللجنة الدائمة'],
    steps: [
      {
        id: 'step-wudu-basics',
        stepIndex: 1,
        titleAr: 'صفة الوضوء النبوي وشروطه ونواقضه',
        lessonType: 'reading',
        durationMinutes: 20,
        contentSummaryAr: 'النية، التسمية، غسل الكفين، المضمضة والاستنشاق، غسل الوجه واليدين إلى المرفقين، مسح الرأس، وغسل الرجلين للكعبين.',
        linkedAcademyLessonId: 'prayer',
        reflectionQuestion: 'ما هي النواقص الشائعة في إسباغ الوضوء وكيف نتجنب الإسراف في الماء؟',
        sources: ['صحيح البخاري • حديث عثمان في صفة وضوء النبي ﷺ']
      },
      {
        id: 'step-prayer-conditions',
        stepIndex: 2,
        titleAr: 'شروط صحة الصلاة وأوقاتها المفروضة',
        lessonType: 'reading',
        durationMinutes: 20,
        contentSummaryAr: 'دخول الوقت، الطهارة من الحدث والخبث، ستر العورة، استقبال القبلة، والنية الجازمة.',
        reflectionQuestion: 'كيف يتصرف المسلم إذا اشتبه عليه اتجاه القبلة أثناء السفر؟',
        sources: ['المغني لابن قدامة']
      },
      {
        id: 'step-prayer-performance',
        stepIndex: 3,
        titleAr: 'صفة صلاة النبي ﷺ من التكبير إلى التسليم',
        lessonType: 'reading',
        durationMinutes: 25,
        contentSummaryAr: 'تكبيرة الإحرام، دعاء الاستفتاح، الركوع والطمأنينة فيه، الرفع والاعتدال، السجود التام، والتشهد والسلام.',
        reflectionQuestion: 'ما هو ضابط الطمأنينة التي هي ركن من أركان الصلاة؟',
        sources: ['صحيح البخاري • حديث المسيء صلاته']
      },
      {
        id: 'step-sujud-sahw',
        stepIndex: 4,
        titleAr: 'أحكام سجود السهو ومواضعه المشروعة',
        lessonType: 'reflection_quiz',
        durationMinutes: 15,
        contentSummaryAr: 'أسباب سجود السهو: الزيادة، النقصان، والشك؛ ومتى يسجد المصلي قبل السلام ومتى يسجد بعده.',
        reflectionQuestion: 'إذا شك المصلي هل صلى ثلاثاً أم أربعاً، فماذا يفعل؟',
        sources: ['صحيح مسلم • أحاديث سجود السهو']
      }
    ]
  },

  // 3. معالم السيرة النبوية والأسوة الحسنة
  {
    id: 'path-prophet-seerah',
    titleAr: 'معالم السيرة النبوية والأسوة الحسنة',
    titleEn: 'Milestones of Prophetic Biography & Model Conduct',
    descriptionAr: 'رحلة إيمانية في سيرة الحبيب المصطفى ﷺ من المولد الشريف والبعثة المباركة والهجرة إلى تأسيس دولة المدينة ووفاته ﷺ.',
    category: 'seerah',
    categoryLabelAr: 'السيرة والتاريخ الإسلامي',
    targetAudience: 'المحبون لسيرة النبي ﷺ والباحثون عن القدوة الصالحة في المعاملات والأخلاق',
    prerequisites: 'محبة المعرفة والاطلاع',
    estimatedHours: 4.0,
    iconName: 'Sparkles',
    isPublished: true,
    verifiedSources: ['الرحيق المختوم للمباركفوري', 'السيرة النبوية لابن هشام', 'صحيح السيرة النبوية'],
    steps: [
      {
        id: 'step-seerah-birth-mission',
        stepIndex: 1,
        titleAr: 'المولد النبوي والنشأة وحادثة شق الصدر والغار',
        lessonType: 'reading',
        durationMinutes: 25,
        contentSummaryAr: 'نشأة النبي ﷺ يتيماً، صدقه وأمانته قبل البعثة، وتعبده في غار حراء ونزول الوحي الأول (اقرأ باسم ربك الذي خلق).',
        referenceSurah: 96,
        referenceAyah: 1,
        reflectionQuestion: 'ما العبرة من تهيئة الله لرسوله بالصدق والأمانة قبل تكليفه بالنبوة؟',
        sources: ['صحيح البخاري • بدء الوحي']
      },
      {
        id: 'step-seerah-dawah-makkah',
        stepIndex: 2,
        titleAr: 'الدعوة المكية والصبر على أذى قريش والهجرة للحبشة',
        lessonType: 'reading',
        durationMinutes: 25,
        contentSummaryAr: 'المرحلة السرية والجهر بالدعوة، ثبات الصحابة أمام التعذيب، عام الحزن ورحلة الطائف والإسراء والمعراج.',
        reflectionQuestion: 'كيف كان موقف النبي ﷺ حين عرض عليه ملك الجبال أن يطبق على أهل الطائف الأخشبين؟',
        sources: ['الرحيق المختوم']
      },
      {
        id: 'step-seerah-hijrah-madinah',
        stepIndex: 3,
        titleAr: 'الهجرة النبوية وبناء المجتمع المدني المسلم',
        lessonType: 'reading',
        durationMinutes: 30,
        contentSummaryAr: 'التخطيط المحكم للهجرة، بناء المسجد النبوي، المؤاخاة بين المهاجرين والأنصار، وكتابة وثيقة المدينة.',
        reflectionQuestion: 'ما هي الأسس التي أقام عليها النبي ﷺ المجتمع في المدينة المنورة؟',
        sources: ['السيرة النبوية لابن هشام']
      }
    ]
  },

  // 4. دليل المسلم الجديد: الأساسيات والثوابت
  {
    id: 'path-new-muslim',
    titleAr: 'دليل المسلم الجديد: العقيدة والفرائض',
    titleEn: 'New Muslim Essentials & Islamic Foundations',
    descriptionAr: 'مسار مبسط وميسر مصمم للمسلمين الجدد والراغبين في تعلم أركان الإسلام الخمسة وأركان الإيمان الستة بلغة واضحة وخطوات عملية.',
    category: 'new_muslim',
    categoryLabelAr: 'دليل المسلم الجديد',
    targetAudience: 'المسلمون الجدد والمهتمون بالتعرف على ثوابت الدين الحنيف',
    prerequisites: 'الرغبة الصادقة في التعلم',
    estimatedHours: 2.0,
    iconName: 'ShieldCheck',
    isPublished: true,
    verifiedSources: ['أصول الإيمان لنخبة من العلماء', 'كتيب المسلم الجديد باللغات العالمية'],
    steps: [
      {
        id: 'step-shahadah-pillars',
        stepIndex: 1,
        titleAr: 'معنى الشهادتين وأركان الإسلام الخمسة',
        lessonType: 'reading',
        durationMinutes: 15,
        contentSummaryAr: 'معنى لا إله إلا الله محمد رسول الله، وإقام الصلاة، وإيتاء الزكاة، وصوم رمضان، وحج البيت لمن استطاع إليه سبيلاً.',
        linkedAcademyLessonId: 'basics',
        reflectionQuestion: 'ماذا يترتب على إعلان الشهادتين في حياة الإنسان اليومية؟',
        sources: ['صحيح البخاري وصحيح مسلم • حديث بني الإسلام على خمس']
      },
      {
        id: 'step-six-pillars-faith',
        stepIndex: 2,
        titleAr: 'أركان الإيمان الستة: الإيمان بالله وملائكته وكتبه ورسله واليوم الآخر والقدر',
        lessonType: 'reading',
        durationMinutes: 20,
        contentSummaryAr: 'شرح موجز لأركان الإيمان الستة وأثر الإيمان بالقدر خيره وشره في تحقيق السكينة النفسية.',
        reflectionQuestion: 'كيف يمنح الإيمان باليوم الآخر والقدر طمأنينة للمؤمن عند وقوع المصائب؟',
        sources: ['حديث جبريل المشهور في صحيح مسلم']
      }
    ]
  },

  // 5. التعرف على مفردات وغريب القرآن الكريم
  {
    id: 'path-quran-vocabulary',
    titleAr: 'التعرف على مفردات وغريب القرآن الكريم',
    titleEn: 'Understanding Quranic Vocabulary & Rare Terms',
    descriptionAr: 'منهج تطبيقي يعنى بإيضاح الكلمات القرآنية الجليلة وبيان دلالاتها اللغوية والسياقية لتمكين القارئ من فهم كلام ربه بيسر.',
    category: 'quran',
    categoryLabelAr: 'علوم وتدبر القرآن',
    targetAudience: 'قراء القرآن الكريم وطلاب العلم وحفظة كتاب الله',
    prerequisites: 'قراءة القرآن الكريم',
    estimatedHours: 3.0,
    iconName: 'BookOpen',
    isPublished: true,
    verifiedSources: ['المفردات في غريب القرآن للراغب الأصفهاني', 'كلمات القرآن تفسير وبيان للشيخ حسنين مخلوف'],
    steps: [
      {
        id: 'step-vocab-method',
        stepIndex: 1,
        titleAr: 'أهمية معرفة غريب القرآن ومصادره المعتمدة',
        lessonType: 'reading',
        durationMinutes: 20,
        contentSummaryAr: 'معرفة غريب القرآن شرط لازم لفهم المعاني، مع استعراض منهج أئمة اللغة والتفسير.',
        reflectionQuestion: 'كيف يسهم فهم المفردة القرآنية في تدبر الآية ككل؟',
        sources: ['مقدمة المفردات للأصفهاني']
      },
      {
        id: 'step-vocab-common-roots',
        stepIndex: 2,
        titleAr: 'الجذور القرآنية الأكثر تكراراً ودلالاتها',
        lessonType: 'reading',
        durationMinutes: 25,
        contentSummaryAr: 'دراسة جذور الرحمة والهدى والعلم والتقوى وتصريفاتها في السور المختلفة.',
        reflectionQuestion: 'ما الفرق بين الرحمن والرحيم من حيث الصيغة والدلالة؟',
        sources: ['معجم ألفاظ القرآن الكريم لمجمع اللغة العربية']
      }
    ]
  },

  // 6. مدخل إلى علوم القرآن الكريم ورسم المصحف
  {
    id: 'path-quran-sciences-intro',
    titleAr: 'مدخل إلى علوم القرآن الكريم وتاريخ المصحف',
    titleEn: 'Introduction to Quranic Sciences & Manuscript History',
    descriptionAr: 'إطلالة شاملة على علوم القرآن: نزول الوحي، أسباب النزول، المكي والمدني، جمع القرآن في عهد أبي بكر وعثمان رضي الله عنهما، وإعجاز القرآن.',
    category: 'quran',
    categoryLabelAr: 'علوم وتدبر القرآن',
    targetAudience: 'المسلمون الراغبون في تعميق معرفتهم بكتاب الله وتاريخ تدوينه',
    prerequisites: 'لا يوجد',
    estimatedHours: 3.5,
    iconName: 'Compass',
    isPublished: true,
    verifiedSources: ['الإتقان في علوم القرآن للسيوطي', 'مباحث في علوم القرآن لمناع القطان'],
    steps: [
      {
        id: 'step-quran-wahy-descent',
        stepIndex: 1,
        titleAr: 'كيفية نزول الوحي والفرق بين المكي والمدني',
        lessonType: 'reading',
        durationMinutes: 25,
        contentSummaryAr: 'نزول القرآن منجماً لحكمة تثبيت الفؤاد، وضوابط التمييز بين السور المكية والمدنية.',
        reflectionQuestion: 'ما هي الحكمة من نزول القرآن مفرقاً على مدى 23 سنة؟',
        sources: ['مباحث في علوم القرآن']
      },
      {
        id: 'step-quran-compilation',
        stepIndex: 2,
        titleAr: 'جمع القرآن في عهد الصحابة ورسم المصحف العثماني',
        lessonType: 'reading',
        durationMinutes: 30,
        contentSummaryAr: 'مراحل حفظ القرآن في الصدور والسطور، وجمع الصديق ونسخ عثمان وتوزيعه على الأمصار.',
        reflectionQuestion: 'كيف تجلى حفظ الله لكتابه في عناية الصحابة بضبط المصحف؟',
        sources: ['صحيح البخاري • كتاب فضائل القرآن']
      }
    ]
  },

  // 7. حصن المسلم: فقه الأذكار والأدعية النبوية
  {
    id: 'path-adhkar-supplications',
    titleAr: 'حصن المسلم: فقه الأذكار والأدعية النبوية',
    titleEn: 'Fortress of the Muslim: Prophetic Adhkar & Supplications',
    descriptionAr: 'مسار عملي لحفظ وممارسة أذكار الصباح والمساء، أذكار النوم والاستيقاظ، وأدعية الأحوال المختلفة المستقاة من صحيح السنة.',
    category: 'fiqh',
    categoryLabelAr: 'الفقه والعبادات',
    targetAudience: 'كل مسلم حريص على إحياء سنة الذكر وحفظ قلبه ويومه',
    prerequisites: 'حفظ الفاتحة',
    estimatedHours: 2.0,
    iconName: 'ShieldCheck',
    isPublished: true,
    verifiedSources: ['الأذكار للإمام النووي', 'صحيح الكلم الطيب لابن تيمية بتحقيق الألباني'],
    steps: [
      {
        id: 'step-adhkar-virtues',
        stepIndex: 1,
        titleAr: 'فضل الذكر وحضور القلب وآداب الدعاء المستجاب',
        lessonType: 'reading',
        durationMinutes: 15,
        contentSummaryAr: 'منزلة الذاكرين الله كثيراً والذاكرات، وشروط إجابة الدعاء وموانعها.',
        reflectionQuestion: 'ما هو أثر المداومة على أذكار الصباح والمساء في السكينة النفسية؟',
        sources: ['صحيح البخاري • باب فضل ذكر الله']
      },
      {
        id: 'step-adhkar-morning-evening',
        stepIndex: 2,
        titleAr: 'الورد اليومي: أذكار الصباح والمساء وفضائلها',
        lessonType: 'reading',
        durationMinutes: 20,
        contentSummaryAr: 'استعراض الأذكار الجامعة: سيد الاستغفار، آية الكرسي، المعوذات، ورضيت بالله رباً.',
        reflectionQuestion: 'لماذا سمي دعاء "اللهم أنت ربي لا إله إلا أنت..." بسيد الاستغفار؟',
        sources: ['صحيح البخاري (6306)']
      }
    ]
  },

  // 8. فقه مناسك الحج والعمرة والزيارة
  {
    id: 'path-hajj-umrah-guide',
    titleAr: 'فقه مناسك الحج والعمرة والزيارة',
    titleEn: 'Fiqh of Hajj & Umrah Pilgrimage Step-by-Step',
    descriptionAr: 'دليل شامل لكل ما يحتاجه المعتمر والحاج من الإحرام والميقات حتى طواف الوداع مدعماً بالأدلة والتحذير من الأخطاء الشائعة.',
    category: 'fiqh',
    categoryLabelAr: 'الفقه والعبادات',
    targetAudience: 'قاصدو الحج والعمرة والراغبون في تعلم فقه المناسك',
    prerequisites: 'الإسلام ومعرفة أركان الصلاة',
    estimatedHours: 3.0,
    iconName: 'Compass',
    isPublished: true,
    verifiedSources: ['التحقيق والإيضاح لكثير من مسائل الحج والعمرة للشيخ ابن باز', 'مناسك الحج والعمرة للألباني'],
    steps: [
      {
        id: 'step-umrah-pillars',
        stepIndex: 1,
        titleAr: 'صفة العمرة خطوة بخطوة من الميقات إلى التحلل',
        lessonType: 'reading',
        durationMinutes: 25,
        contentSummaryAr: 'أركان العمرة الأربعة: الإحرام من الميقات، الطواف بالبيت، السعي بين الصفا والمروة، والحلق أو التقصير.',
        reflectionQuestion: 'ماذا يشترط لصحة الطواف بالبيت العتيق؟',
        sources: ['صحيح مسلم • حديث جابر الطويل في صفة حجة النبي ﷺ']
      },
      {
        id: 'step-hajj-journey',
        stepIndex: 2,
        titleAr: 'رحلة الحج: يوم التروية وعرفة ومزدلفة وأيام التشريق',
        lessonType: 'reading',
        durationMinutes: 30,
        contentSummaryAr: 'مناسك الحج يوماً بيوم من اليوم الثامن من ذي الحجة حتى طواف الوداع.',
        reflectionQuestion: 'ما هو الركن الأعظم في الحج الذي لا يصح الحج بدونه؟',
        sources: ['صحيح البخاري وصحيح مسلم']
      }
    ]
  },

  // 9. موضوع قرآني: الصبر والشكر في كتاب الله
  {
    id: 'path-quranic-topic-patience',
    titleAr: 'موضوع قرآني: الصبر والشكر في كتاب الله',
    titleEn: 'Quranic Theme: Patience & Gratitude in Allah\'s Book',
    descriptionAr: 'دراسة موضوعية استقرائية لآيات الصبر والشكر في القرآن الكريم، وكيف قسم العلماء الإيمان إلى نصفين: نصف صبر ونصف شكر.',
    category: 'quran',
    categoryLabelAr: 'علوم وتدبر القرآن',
    targetAudience: 'عموم المسلمين الساعين للثبات وتنمية الرضا بقضاء الله',
    prerequisites: 'لا يوجد',
    estimatedHours: 2.5,
    iconName: 'BookOpen',
    isPublished: true,
    verifiedSources: ['عدة الصابرين وذخيرة الشاكرين لابن القيم', 'التفسير الموضوعي للقرآن الكريم'],
    steps: [
      {
        id: 'step-patience-types',
        stepIndex: 1,
        titleAr: 'أقسام الصبر الثلاثة ومقامات الصابرين في القرآن',
        lessonType: 'reading',
        durationMinutes: 20,
        contentSummaryAr: 'الصبر على طاعة الله، والصبر عن معصية الله، والصبر على أقدار الله المؤلمة، مع الاستشهاد بآيات الصبر.',
        reflectionQuestion: 'أي أقسام الصبر الثلاثة أعظم أجراً ولماذا؟',
        sources: ['عدة الصابرين لابن القيم']
      },
      {
        id: 'step-gratitude-levels',
        stepIndex: 2,
        titleAr: 'حقيقة الشكر بالقلب واللسان والجوارح',
        lessonType: 'reading',
        durationMinutes: 20,
        contentSummaryAr: 'قوله تعالى: (اعْمَلُوا آلَ دَاوُودَ شُكْرًا)، وكيف يقيد الشكر النعم ويزيدها (لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ).',
        reflectionQuestion: 'كيف يكون شكر النعمة بالجوارح وليس باللسان فحسب؟',
        sources: ['تفسير ابن كثير • سورة إبراهيم']
      }
    ]
  },

  // 10. مكارم الأخلاق والآداب الإسلامية
  {
    id: 'path-prophetic-manners',
    titleAr: 'مكارم الأخلاق والآداب الإسلامية',
    titleEn: 'Noble Islamic Ethics & Prophetic Etiquettes',
    descriptionAr: 'منهاج تربوي مستمد من القرآن والسنة يعنى بتزكية النفس بالصدق والأمانة والوفاء والحياء وحسن الخلق مع الناس كافة.',
    category: 'manners',
    categoryLabelAr: 'التربية وتزكية النفس',
    targetAudience: 'الناشئة والكبار والراغبون في تحسين المعاملات',
    prerequisites: 'لا يوجد',
    estimatedHours: 2.5,
    iconName: 'Sparkles',
    isPublished: true,
    verifiedSources: ['الأدب المفرد للإمام البخاري', 'رياض الصالحين للإمام النووي'],
    steps: [
      {
        id: 'step-manners-rank',
        stepIndex: 1,
        titleAr: 'مكانة حسن الخلق في ميزان الشريعة',
        lessonType: 'reading',
        durationMinutes: 15,
        contentSummaryAr: 'حديث: (إنما بعثت لأتمم صالح الأخلاق)، وأثقل شيء في ميزان العبد يوم القيامة.',
        reflectionQuestion: 'كيف يثبت حسن الخلق صدق تدين المرء في واقعه العملي؟',
        sources: ['مسند أحمد والأدب المفرد']
      },
      {
        id: 'step-manners-practical',
        stepIndex: 2,
        titleAr: 'آداب التعامل: اللسان، الاستئذان، وإفشاء السلام',
        lessonType: 'reading',
        durationMinutes: 20,
        contentSummaryAr: 'ضبط اللسان عن الغيبة والنميمة، بر الوالدين، صلة الرحم، وحق الجار في الإسلام.',
        reflectionQuestion: 'ما أثر حفظ اللسان في سلامة المجتمع وصلاح القلوب؟',
        sources: ['رياض الصالحين • باب حفظ اللسان']
      }
    ]
  }
];
