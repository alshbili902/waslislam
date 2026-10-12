export interface HadithItem {
  id: string;
  arabic: string;
  english: string;
  narratorAr: string;
  narratorEn: string;
  source: string;
  hadithNumber: string;
  chapterAr: string;
  grade: string;
  tags: string[];
}

export const AUTHENTIC_HADITHS: HadithItem[] = [
  {
    id: 'hadith-niyyah',
    arabic: 'إنَّمَا الأَعْمَالُ بالنِّيَّاتِ، وإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوِ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ.',
    english: 'Actions are judged by motives, so each man will have what he intended. Thus, he whose migration was for the sake of Allah and His Messenger, his migration is for the sake of Allah and His Messenger; and he whose migration was to achieve some worldly benefit or to take some woman in marriage, his migration was for that for which he migrated.',
    narratorAr: 'عمر بن الخطاب رضي الله عنه',
    narratorEn: 'Umar ibn al-Khattab (may Allah be pleased with him)',
    source: 'صحيح البخاري (1) وصحيح مسلم (1907)',
    hadithNumber: '1',
    chapterAr: 'كتاب بدء الوحي والإخلاص',
    grade: 'صحيح متفق عليه',
    tags: ['النية', 'الإخلاص', 'العمل']
  },
  {
    id: 'hadith-deen-naseehah',
    arabic: 'الدِّينُ النَّصِيحَةُ. قُلْنَا: لِمَنْ؟ قَالَ: لِلَّهِ وَلِكِتَابِهِ وَلِرَسُولِهِ وَلأَئِمَّةِ الْمُسْلِمِينَ وَعَامَّتِهِمْ.',
    english: 'The religion is sincere advice. We said: To whom? He said: To Allah, His Book, His Messenger, the leaders of the Muslims, and their common folk.',
    narratorAr: 'تميم الداري رضي الله عنه',
    narratorEn: 'Tamim ad-Dari (may Allah be pleased with him)',
    source: 'صحيح مسلم (55)',
    hadithNumber: '55',
    chapterAr: 'كتاب الإيمان',
    grade: 'صحيح مسلم',
    tags: ['النصيحة', 'الأخلاق', 'الإيمان']
  },
  {
    id: 'hadith-love-for-brother',
    arabic: 'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ.',
    english: 'None of you truly believes until he loves for his brother what he loves for himself.',
    narratorAr: 'أنس بن مالك رضي الله عنه',
    narratorEn: 'Anas ibn Malik (may Allah be pleased with him)',
    source: 'صحيح البخاري (13) وصحيح مسلم (45)',
    hadithNumber: '13',
    chapterAr: 'كتاب الإيمان',
    grade: 'صحيح متفق عليه',
    tags: ['الإخوة', 'المحبة', 'الإيمان']
  },
  {
    id: 'hadith-good-speech',
    arabic: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ جَارَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ ضَيْفَهُ.',
    english: 'Whoever believes in Allah and the Last Day, let him speak good or remain silent; whoever believes in Allah and the Last Day, let him honor his neighbor; and whoever believes in Allah and the Last Day, let him honor his guest.',
    narratorAr: 'أبو هريرة رضي الله عنه',
    narratorEn: 'Abu Hurairah (may Allah be pleased with him)',
    source: 'صحيح البخاري (6018) وصحيح مسلم (47)',
    hadithNumber: '6018',
    chapterAr: 'كتاب الأدب',
    grade: 'صحيح متفق عليه',
    tags: ['حفظ اللسان', 'حق الجار', 'إكرام الضيف']
  },
  {
    id: 'hadith-mercy',
    arabic: 'الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ، ارْحَمُوا مَنْ فِي الأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ.',
    english: 'The merciful will be shown mercy by the Most Merciful. Be merciful to those on the earth, and the One in the heavens will have mercy upon you.',
    narratorAr: 'عبد الله بن عمرو رضي الله عنهما',
    narratorEn: 'Abdullah ibn Amr (may Allah be pleased with them)',
    source: 'سنن أبي داود (4941) والترمذي (1924)',
    hadithNumber: '1924',
    chapterAr: 'كتاب البر والصلة',
    grade: 'صحيح (الألباني)',
    tags: ['الرحمة', 'الإحسان', 'الأخلاق']
  },
  {
    id: 'hadith-kindness',
    arabic: 'إِنَّ الرِّفْقَ لَا يَكُونُ فِي شَيْءٍ إِلَّا زَانَهُ، وَلَا يُنْزَعُ مِنْ شَيْءٍ إِلَّا شَانَهُ.',
    english: 'Kindness is not found in anything except that it beautifies it, and it is not withdrawn from anything except that it defects it.',
    narratorAr: 'عائشة رضي الله عنها',
    narratorEn: 'Aisha (may Allah be pleased with her)',
    source: 'صحيح مسلم (2594)',
    hadithNumber: '2594',
    chapterAr: 'كتاب البر والصلة والآداب',
    grade: 'صحيح مسلم',
    tags: ['الرفق', 'الأخلاق', 'التعامل']
  },
  {
    id: 'hadith-quran-best',
    arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ القُرْآنَ وَعَلَّمَهُ.',
    english: 'The best among you are those who learn the Quran and teach it.',
    narratorAr: 'عثمان بن عفان رضي الله عنه',
    narratorEn: 'Uthman ibn Affan (may Allah be pleased with him)',
    source: 'صحيح البخاري (5027)',
    hadithNumber: '5027',
    chapterAr: 'كتاب فضائل القرآن',
    grade: 'صحيح البخاري',
    tags: ['فضل القرآن', 'طلب العلم', 'التعليم']
  },
  {
    id: 'hadith-smile-charity',
    arabic: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ.',
    english: 'Your smiling in the face of your brother is charity for you.',
    narratorAr: 'أبو ذر الغفاري رضي الله عنه',
    narratorEn: 'Abu Dharr al-Ghifari (may Allah be pleased with him)',
    source: 'جامع الترمذي (1956)',
    hadithNumber: '1956',
    chapterAr: 'كتاب البر والصلة',
    grade: 'حسن غريب (وصححه الألباني)',
    tags: ['الابتسامة', 'الصدقة', 'البشاشة']
  }
];
