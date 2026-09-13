import sharp from 'sharp';
import QRCode from 'qrcode';

interface CardSample {
  filename: string;
  sectionName: string;
  contentType: string;
  content: string;
  source?: string;
  fontSize?: number;
}

const samples: CardSample[] = [
  {
    filename: 'public/sample-azkar-card.png',
    sectionName: 'أذكار الصباح',
    contentType: 'ذكر',
    content: '«أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ»',
    source: 'صحيح مسلم (٢٧٢٣)',
    fontSize: 40
  },
  {
    filename: 'public/sample-quran-card.png',
    sectionName: 'القرآن الكريم',
    contentType: 'آية',
    content: '﴿ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ﴾',
    source: 'سورة البقرة • الآية ٢٥٥',
    fontSize: 44
  },
  {
    filename: 'public/sample-hadith-card.png',
    sectionName: 'الأحاديث',
    contentType: 'حديث',
    content: '«إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ»',
    source: 'صحيح البخاري (١)',
    fontSize: 40
  },
  {
    filename: 'public/sample-dua-card.png',
    sectionName: 'الأدعية',
    contentType: 'دعاء',
    content: '«رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ»',
    source: 'سورة البقرة • الآية ٢٠١',
    fontSize: 46
  },
  {
    filename: 'public/sample-custom-section-card.png',
    sectionName: 'أدعية السفر',
    contentType: 'دعاء',
    content: '«سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ، اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى»',
    source: 'صحيح مسلم (١٣٤٢)',
    fontSize: 38
  }
];

async function generateAllSamples() {
  const qrBuffer = await QRCode.toBuffer('https://waslislam.fun', {
    margin: 1,
    width: 134,
    color: {
      dark: '#0e2b20',
      light: '#ffffff'
    }
  });

  const baseImg = await sharp('public/share-template.png')
    .resize(1364, 2048, { fit: 'fill' })
    .toBuffer();

  const hijri = '١ ربيع الآخر ١٤٤٨ هـ';
  const countdown = 'بقي ١٤٩ يوماً';

  for (const sample of samples) {
    const words = sample.content.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    for (const w of words) {
      if ((currentLine + ' ' + w).trim().length > 34) {
        lines.push(currentLine.trim());
        currentLine = w;
      } else {
        currentLine = (currentLine + ' ' + w).trim();
      }
    }
    if (currentLine) lines.push(currentLine.trim());

    const fontSize = sample.fontSize || 40;
    const lineHeight = Math.round(fontSize * 1.55);
    const textHeight = lines.length * lineHeight;

    const headerHeight = 99;
    const hasSource = Boolean(sample.source);
    const sourceHeight = hasSource ? 60 : 0;
    const totalBlockHeight = headerHeight + textHeight + sourceHeight;

    // Anchor composite group around y = 890
    const blockStartY = Math.max(520, Math.round(890 - (totalBlockHeight / 2)));
    const sectionY = blockStartY + 20;
    const typeY = sectionY + 28;
    const textStartY = blockStartY + headerHeight + (lineHeight / 2);
    const sourceY = blockStartY + headerHeight + textHeight + 35;

    const textSvg = `
      <svg width="1364" height="2048" xmlns="http://www.w3.org/2000/svg">
        <style>
          .section-title {
            font-family: 'Tajawal', sans-serif;
            font-size: 26px;
            font-weight: 800;
            fill: #064e3b;
            text-anchor: middle;
            letter-spacing: 0.5px;
            direction: rtl;
          }
          .content-type {
            font-family: 'Tajawal', sans-serif;
            font-size: 19px;
            font-weight: 700;
            fill: #b45309;
            text-anchor: middle;
            direction: rtl;
          }
          .main-text {
            font-family: 'Amiri', 'Traditional Arabic', serif;
            font-size: ${fontSize}px;
            font-weight: bold;
            fill: #064e3b;
            text-anchor: middle;
            direction: rtl;
          }
          .source {
            font-family: 'Tajawal', sans-serif;
            font-size: 22px;
            font-weight: 700;
            fill: #b45309;
            text-anchor: middle;
            direction: rtl;
          }
          .pill {
            font-family: 'Tajawal', sans-serif;
            font-size: 22px;
            font-weight: 800;
            fill: #064e3b;
            text-anchor: middle;
            dominant-baseline: central;
            direction: rtl;
          }
        </style>

        <!-- 1. Section Name -->
        <text x="682" y="${sectionY}" class="section-title">✦ ${sample.sectionName} ✦</text>

        <!-- 2. Content Type -->
        <text x="682" y="${typeY}" class="content-type">${sample.contentType}</text>

        <!-- 3. Main Text Lines -->
        ${lines
          .map((line, idx) => `<text x="682" y="${textStartY + idx * lineHeight}" class="main-text">${line}</text>`)
          .join('\n')}

        <!-- 4. Source Badge -->
        ${hasSource ? `<text x="682" y="${sourceY}" class="source">— ${sample.source} —</text>` : ''}

        <!-- Date Pill -->
        <text x="508" y="1666" class="pill">${hijri}</text>

        <!-- Ramadan Countdown Pill -->
        <text x="856" y="1666" class="pill">${countdown}</text>
      </svg>
    `;

    await sharp(baseImg)
      .composite([
        { input: qrBuffer, top: 1724, left: 128 },
        { input: Buffer.from(textSvg), top: 0, left: 0 }
      ])
      .png({ quality: 100 })
      .toFile(sample.filename);

    console.log(`Saved ${sample.filename}`);
  }
}

generateAllSamples().catch(console.error);
