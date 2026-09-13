import sharp from 'sharp';

async function testAllCoords() {
  // Let's test exact centers:
  // Green plaque: y = 516
  // Cream plaque: y = 642
  // Date pill: x = 508, y = 1666 ? Or let's measure exact center of the pill under "التاريخ"
  // Ramadan pill: x = 856, y = 1666 ?

  const svg = `
    <svg width="1364" height="2048" xmlns="http://www.w3.org/2000/svg">
      <style>
        .green-title {
          font-family: 'Tajawal', sans-serif;
          font-size: 30px;
          font-weight: 800;
          fill: #fef9c3; /* Luxurious bright gold-cream */
          text-anchor: middle;
          dominant-baseline: central;
          direction: rtl;
        }
        .content-type {
          font-family: 'Tajawal', sans-serif;
          font-size: 22px;
          font-weight: 800;
          fill: #064e3b; /* Deep Forest Green */
          text-anchor: middle;
          dominant-baseline: central;
          direction: rtl;
        }
        .pill {
          font-family: 'Tajawal', sans-serif;
          font-size: 24px;
          font-weight: 800;
          fill: #064e3b;
          text-anchor: middle;
          dominant-baseline: central;
          direction: rtl;
        }
        .main-text {
          font-family: 'Amiri', 'Traditional Arabic', serif;
          font-size: 42px;
          font-weight: bold;
          fill: #064e3b;
          text-anchor: middle;
          direction: rtl;
        }
        .source-text {
          font-family: 'Tajawal', sans-serif;
          font-size: 22px;
          font-weight: 700;
          fill: #b45309;
          text-anchor: middle;
          direction: rtl;
        }
      </style>

      <!-- 1. Green Plaque: Section Name -->
      <text x="682" y="515" class="green-title">أذكار الصباح</text>

      <!-- 2. Cream Plaque: Content Type -->
      <text x="682" y="642" class="content-type">ذكر</text>

      <!-- 3. Main Text between Cream Plaque (y=670) and Golden Divider (y=1102) -->
      <!-- Center of this region: (670 + 1102) / 2 = 886 -->
      <text x="682" y="850" class="main-text">«أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ»</text>
      <text x="682" y="915" class="main-text">«لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ»</text>

      <!-- 4. Source Text -->
      <text x="682" y="1030" class="source-text">— صحيح مسلم (٢٧٢٣) —</text>

      <!-- 5. Date Pill: Let's test x=508, y=1666 -->
      <text x="508" y="1666" class="pill">١ ربيع الآخر ١٤٤٨ هـ</text>

      <!-- 6. Ramadan Countdown Pill: Let's test x=856, y=1666 -->
      <text x="856" y="1666" class="pill">بقي ١٤٩ يوماً</text>
    </svg>
  `;

  await sharp('public/wasl-islamic-share-template@2x.png')
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toFile('public/test-coords-preview.png');

  console.log('Saved updated public/test-coords-preview.png');
}

testAllCoords().catch(console.error);
