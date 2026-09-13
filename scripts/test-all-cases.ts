import sharp from 'sharp';
import QRCode from 'qrcode';

interface CardTestCase {
  filename: string;
  sectionName: string;
  contentType: string;
  content: string;
  source?: string;
}

const testCases: CardTestCase[] = [
  {
    filename: 'public/test-case-1-short-dhikr.png',
    sectionName: 'أذكار الصباح',
    contentType: 'ذكر',
    content: '«أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ»',
    source: 'صحيح مسلم (٢٧٢٣)'
  },
  {
    filename: 'public/test-case-2-long-dhikr.png',
    sectionName: 'أذكار الصباح',
    contentType: 'ذكر',
    content: '«أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ»',
    source: 'صحيح مسلم (٢٧٢٣)'
  },
  {
    filename: 'public/test-case-3-short-hadith.png',
    sectionName: 'الأحاديث',
    contentType: 'حديث',
    content: '«إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى»',
    source: 'صحيح البخاري (١)'
  },
  {
    filename: 'public/test-case-4-long-hadith.png',
    sectionName: 'الأحاديث',
    contentType: 'حديث',
    content: '«إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوِ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ»',
    source: 'متفق عليه: البخاري (١) ومسلم (١٩٠٧)'
  },
  {
    filename: 'public/test-case-5-dua.png',
    sectionName: 'الأدعية',
    contentType: 'دعاء',
    content: '«رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ»',
    source: 'سورة البقرة • الآية ٢٠١'
  },
  {
    filename: 'public/test-case-6-ayah.png',
    sectionName: 'القرآن الكريم',
    contentType: 'آية',
    content: '﴿ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ﴾',
    source: 'سورة البقرة • الآية ٢٥٥'
  },
  {
    filename: 'public/test-case-7-custom-section.png',
    sectionName: 'أدعية السفر',
    contentType: 'دعاء',
    content: '«سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ»',
    source: 'صحيح مسلم (١٣٤٢)'
  },
  {
    filename: 'public/test-case-8-no-source.png',
    sectionName: 'الأذكار',
    contentType: 'ذكر',
    content: '«سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ»'
  },
  {
    filename: 'public/test-case-9-very-long.png',
    sectionName: 'أذكار المساء',
    contentType: 'ذكر',
    content: '«اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ»',
    source: 'صحيح البخاري (٦٣٠٦)'
  }
];

function wrapText(text: string, maxLineChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxLineChars) {
      lines.push(cur.trim());
      cur = w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur) lines.push(cur.trim());
  return lines;
}

function calculateLayout(text: string, hasSource: boolean) {
  // Available height between Cream Plaque (y=675) and Golden Divider (y=1095): 420px
  // Max width: 840px
  const sizes = [
    { fontSize: 44, lineHeight: 68, maxChars: 30 },
    { fontSize: 40, lineHeight: 62, maxChars: 34 },
    { fontSize: 36, lineHeight: 56, maxChars: 38 },
    { fontSize: 32, lineHeight: 50, maxChars: 44 },
    { fontSize: 28, lineHeight: 44, maxChars: 50 },
    { fontSize: 24, lineHeight: 38, maxChars: 56 }
  ];

  const maxZoneHeight = hasSource ? 350 : 390;

  for (const s of sizes) {
    const lines = wrapText(text, s.maxChars);
    const totalHeight = lines.length * s.lineHeight;
    if (totalHeight <= maxZoneHeight) {
      return { lines, ...s, totalHeight };
    }
  }

  // Fallback
  const fallback = sizes[sizes.length - 1];
  const lines = wrapText(text, fallback.maxChars);
  return { lines, ...fallback, totalHeight: lines.length * fallback.lineHeight };
}

async function runTests() {
  const qrBuffer = await QRCode.toBuffer('https://waslislam.fun', {
    margin: 1,
    width: 134,
    color: {
      dark: '#0e2b20',
      light: '#ffffff'
    }
  });

  const baseImg = await sharp('public/wasl-islamic-share-template@2x.png').toBuffer();
  const hijri = '١ ربيع الآخر ١٤٤٨ هـ';
  const countdown = 'بقي ١٤٩ يوماً';

  for (const tc of testCases) {
    const hasSource = Boolean(tc.source);
    const layout = calculateLayout(tc.content, hasSource);

    // Zone is from y = 675 to y = 1095 (height 420px, midpoint = 885)
    const sourceHeight = hasSource ? 45 : 0;
    const combinedHeight = layout.totalHeight + sourceHeight;
    const zoneCenterY = 882;
    const startY = Math.round(zoneCenterY - (combinedHeight / 2) + (layout.lineHeight / 2));
    const sourceY = startY + (layout.lines.length - 1) * layout.lineHeight + 50;

    const svg = `
      <svg width="1364" height="2048" xmlns="http://www.w3.org/2000/svg">
        <style>
          .section-name {
            font-family: 'Tajawal', sans-serif;
            font-size: 30px;
            font-weight: 800;
            fill: #fef9c3;
            text-anchor: middle;
            dominant-baseline: central;
            direction: rtl;
          }
          .content-type {
            font-family: 'Tajawal', sans-serif;
            font-size: 23px;
            font-weight: 800;
            fill: #064e3b;
            text-anchor: middle;
            dominant-baseline: central;
            direction: rtl;
          }
          .main-text {
            font-family: 'Amiri', 'Traditional Arabic', serif;
            font-size: ${layout.fontSize}px;
            font-weight: bold;
            fill: #064e3b;
            text-anchor: middle;
            direction: rtl;
          }
          .source-text {
            font-family: 'Tajawal', sans-serif;
            font-size: 21px;
            font-weight: 700;
            fill: #b45309;
            text-anchor: middle;
            direction: rtl;
          }
          .pill {
            font-family: 'Tajawal', sans-serif;
            font-size: 23px;
            font-weight: 800;
            fill: #064e3b;
            text-anchor: middle;
            dominant-baseline: central;
            direction: rtl;
          }
        </style>

        <!-- 1. Section Name inside Green Plaque -->
        <text x="682" y="515" class="section-name">${tc.sectionName}</text>

        <!-- 2. Content Type inside Cream Plaque -->
        <text x="682" y="638" class="content-type">${tc.contentType}</text>

        <!-- 3. Main Text centered in the white arch zone -->
        ${layout.lines
          .map((line, idx) => `<text x="682" y="${startY + idx * layout.lineHeight}" class="main-text">${line}</text>`)
          .join('\n')}

        <!-- 4. Source text above golden divider if present -->
        ${hasSource ? `<text x="682" y="${sourceY}" class="source-text">— ${tc.source} —</text>` : ''}

        <!-- 5. Date Pill -->
        <text x="508" y="1675" class="pill">${hijri}</text>

        <!-- 6. Ramadan Countdown Pill -->
        <text x="856" y="1675" class="pill">${countdown}</text>
      </svg>
    `;

    await sharp(baseImg)
      .composite([
        { input: qrBuffer, top: 1724, left: 128 },
        { input: Buffer.from(svg), top: 0, left: 0 }
      ])
      .png({ quality: 100 })
      .toFile(tc.filename);

    console.log(`Saved ${tc.filename}`);
  }
}

runTests().catch(console.error);
