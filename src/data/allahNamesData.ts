export interface AllahName {
  id: number;
  arabic: string;
  transliteration: string;
  meaningAr: string;
  quranicEvidenceAr: string;
}

export const ALLAH_NAMES: AllahName[] = [
  { id: 1, arabic: "الرَّحْمَٰنُ", transliteration: "Ar-Rahman", meaningAr: "الذي وسعت رحمته جميع الخلائق في الدنيا وأفاض عليهم من نعمه وإحسانه.", quranicEvidenceAr: "الرَّحْمَٰنُ عَلَى الْعَرْشِ اسْتَوَى [طه: 5]" },
  { id: 2, arabic: "الرَّحِيمُ", transliteration: "Ar-Raheem", meaningAr: "الذي يرحم المؤمنين رحمة خاصة في الدنيا والآخرة بهدايتهم وإثابتهم.", quranicEvidenceAr: "وَكَانَ بِالْمُؤْمِنِينَ رَحِيمًا [الأحزاب: 43]" },
  { id: 3, arabic: "الْمَلِكُ", transliteration: "Al-Malik", meaningAr: "المالك لجميع الأشياء، المتصرف فيها بلا ممانعة، له الملك كله في السماوات والأرض.", quranicEvidenceAr: "فَتَعَالَى اللَّهُ الْمَلِكُ الْحَقُّ [طه: 114]" },
  { id: 4, arabic: "الْقُدُّوسُ", transliteration: "Al-Quddoos", meaningAr: "المنزه والمطهر عن كل عيب ونقص ومثيل، المستحق لصفات الكمال المطلق.", quranicEvidenceAr: "الْمَلِكِ الْقُدُّوسِ الْعَزِيزِ الْحَكِيمِ [الجمعة: 1]" },
  { id: 5, arabic: "السَّلَامُ", transliteration: "As-Salam", meaningAr: "الذي سلم من كل عيب ونقص، والذي يُسلِّم عباده من الآفات والمكاره.", quranicEvidenceAr: "السَّلَامُ الْمُؤْمِنُ الْمُهَيْمِنُ [الحشر: 23]" },
  { id: 6, arabic: "الْمُؤْمِنُ", transliteration: "Al-Mu'min", meaningAr: "المصدق لرسله وأنبيائه بالمعجزات، والذي يؤمن عباده من ظلمه وخوفهم.", quranicEvidenceAr: "السَّلَامُ الْمُؤْمِنُ الْمُهَيْمِنُ [الحشر: 23]" },
  { id: 7, arabic: "الْمُهَيْمِنُ", transliteration: "Al-Muhaymin", meaningAr: "الشاهد والرقيب على خلقه، الحافظ لأعمالهم، القائم بأرزاقهم.", quranicEvidenceAr: "الْمُؤْمِنُ الْمُهَيْمِنُ الْعَزِيزُ [الحشر: 23]" },
  { id: 8, arabic: "الْعَزِيزُ", transliteration: "Al-Azeez", meaningAr: "القوي الغالب الذي لا يُغلب، وله العزة كلها: عزة القوة والغلبة والامتناع.", quranicEvidenceAr: "وَهُوَ الْعَزِيزُ الْحَكِيمُ [إبراهيم: 4]" },
  { id: 9, arabic: "الْجَبَّارُ", transliteration: "Al-Jabbar", meaningAr: "الذي يجبر قلوب المنكسرين، ويغني الفقير، ويجبر الكسير، وله العلو والقهر.", quranicEvidenceAr: "الْعَزِيزُ الْجَبَّارُ الْمُتَكَبِّرُ [الحشر: 23]" },
  { id: 10, arabic: "الْمُتَكَبِّرُ", transliteration: "Al-Mutakabbir", meaningAr: "المتعالي عن كل سوء ونقص، المتعظم بصفات الكبرياء والعظمة والجلال.", quranicEvidenceAr: "الْجَبَّارُ الْمُتَكَبِّرُ [الحشر: 23]" },
  { id: 11, arabic: "الْخَالِقُ", transliteration: "Al-Khaliq", meaningAr: "الموجد للأشياء من العدم على غير مثال سابق، المقدر للمخلوقات.", quranicEvidenceAr: "هُوَ اللَّهُ الْخَالِقُ الْبَارِئُ [الحشر: 24]" },
  { id: 12, arabic: "الْبَارِئُ", transliteration: "Al-Bari'", meaningAr: "الذي فطر وبرأ الخلائق وميز بعضها عن بعض بصور وهيئات متقنة.", quranicEvidenceAr: "هُوَ اللَّهُ الْخَالِقُ الْبَارِئُ الْمُصَوِّرُ [الحشر: 24]" },
  { id: 13, arabic: "الْمُصَوِّرُ", transliteration: "Al-Musawwir", meaningAr: "الذي شكّل وأعطى كل مخلوق صورته وهيئته الخاصة بحكمته.", quranicEvidenceAr: "هُوَ اللَّهُ الْخَالِقُ الْبَارِئُ الْمُصَوِّرُ [الحشر: 24]" },
  { id: 14, arabic: "الْغَفَّارُ", transliteration: "Al-Ghaffar", meaningAr: "الذي يستر ذنوب عباده مرة بعد مرة، ويتجاوز عن سيئاتهم برحمته.", quranicEvidenceAr: "وَإِنِّي لَغَفَّارٌ لِّمَن تَابَ وَآمَنَ [طه: 82]" },
  { id: 15, arabic: "الْقَهَّارُ", transliteration: "Al-Qahhar", meaningAr: "الذي خضعت لسطوته وقدرته الخلائق كلها، وذلت له الرقاب.", quranicEvidenceAr: "وَهُوَ الْوَاحِدُ الْقَهَّارُ [الرعد: 16]" },
  { id: 16, arabic: "الْوَهَّابُ", transliteration: "Al-Wahhab", meaningAr: "كثير العطايا والمنن بغير عوض ولا مسألة، يجود على عباده تفضلاً.", quranicEvidenceAr: "أَمْ عِندَهُمْ خَزَائِنُ رَحْمَةِ رَبِّكَ الْعَزِيزِ الْوَهَّابِ [ص: 9]" },
  { id: 17, arabic: "الرَّزَّاقُ", transliteration: "Ar-Razzaq", meaningAr: "المتكفل بأرزاق العباد، الذي يسوق لكل كائن قوته وما يقيم حياته.", quranicEvidenceAr: "إِنَّ اللَّهَ هُوَ الرَّزَّاقُ ذُو الْقُوَّةِ الْمَتِينُ [الذاريات: 58]" },
  { id: 18, arabic: "الْفَتَّاحُ", transliteration: "Al-Fattah", meaningAr: "الذي يقضي بين عباده بالعدل، ويفتح أبواب رحمته ورزقه وخيراته.", quranicEvidenceAr: "وَهُوَ الْفَتَّاحُ الْعَلِيمُ [سبأ: 26]" },
  { id: 19, arabic: "الْعَلِيمُ", transliteration: "Al-Aleem", meaningAr: "المحيط بكل شيء ظاهراً وباطناً، أولاً وآخراً، لا يخفى عليه مثقال ذرة.", quranicEvidenceAr: "إِنَّ اللَّهَ بِكُلِّ شَيْءٍ عَلِيمٌ [العنكبوت: 62]" },
  { id: 20, arabic: "الْحَكِيمُ", transliteration: "Al-Hakeem", meaningAr: "الذي يضع الأمور في مواضعها الصحيحة، له الحكمة البالغة في خلقه وشرعه.", quranicEvidenceAr: "وَهُوَ الْعَزِيزُ الْحَكِيمُ [الحشر: 1]" },
  { id: 21, arabic: "الْحَيُّ", transliteration: "Al-Hayy", meaningAr: "صاحب الحياة الدائمة الكاملة التي لم تسبق بعدم ولا يلحقها زوال.", quranicEvidenceAr: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ [البقرة: 255]" },
  { id: 22, arabic: "الْقَيُّومُ", transliteration: "Al-Qayyoom", meaningAr: "القائم بنفسه فلا يحتاج لأحد، والمقيم لجميع خلقه وحافظهم ومدبرهم.", quranicEvidenceAr: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ [البقرة: 255]" },
  { id: 23, arabic: "السَّمِيعُ", transliteration: "As-Samee'", meaningAr: "الذي يسمع كل الأصوات وسرائر القلوب، لا يشغله سمع عن سمع.", quranicEvidenceAr: "وَهُوَ السَّمِيعُ الْعَلِيمُ [البقرة: 137]" },
  { id: 24, arabic: "الْبَصِيرُ", transliteration: "Al-Baseer", meaningAr: "الذي يرى كل دقيق وجليل في الأرض والسماء، ويبصر خفايا الأمور.", quranicEvidenceAr: "إِنَّ اللَّهَ بِمَا تَعْمَلُونَ بَصِيرٌ [البقرة: 110]" },
  { id: 25, arabic: "الشَّكُورُ", transliteration: "Ash-Shakoor", meaningAr: "الذي يجازي على العمل القليل بالثواب الجزيل، ويضاعف الحسنات.", quranicEvidenceAr: "إِنَّ رَبَّنَا لَغَفُورٌ شَكُورٌ [فاطر: 34]" },
  { id: 26, arabic: "الْوَدُودُ", transliteration: "Al-Wadood", meaningAr: "المحب لأوليائه والمحبوب في قلوب عباده الصالحين، صاحب اللطف والمودة.", quranicEvidenceAr: "وَهُوَ الْغَفُورُ الْوَدُودُ [البروج: 14]" },
  { id: 27, arabic: "النُّورُ", transliteration: "An-Noor", meaningAr: "الذي بنوره أشرقت السماوات والأرض، وهادي أهل الإيمان للحق.", quranicEvidenceAr: "اللَّهُ نُورُ السَّمَاوَاتِ وَالأَرْضِ [النور: 35]" }
];
