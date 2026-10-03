import fs from 'fs';

function validateXml(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  console.log(`File size: ${content.length} bytes`);

  // Check XML declaration
  if (!content.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) {
    console.error('FAIL: Missing or misplaced XML declaration');
  } else {
    console.log('PASS: XML declaration is at the very beginning (index 0).');
  }

  // Check BOM
  const buf = fs.readFileSync(filePath);
  if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
    console.warn('WARN: UTF-8 BOM detected!');
  } else {
    console.log('PASS: No BOM detected, clean UTF-8.');
  }

  // Count tags
  const openUrl = (content.match(/<url>/g) || []).length;
  const closeUrl = (content.match(/<\/url>/g) || []).length;
  const locs = (content.match(/<loc>/g) || []).length;
  const closeLocs = (content.match(/<\/loc>/g) || []).length;

  console.log(`URL tags count: <url>=${openUrl}, </url>=${closeUrl}`);
  console.log(`LOC tags count: <loc>=${locs}, </loc>=${closeLocs}`);

  if (openUrl !== closeUrl || locs !== closeLocs || openUrl !== locs) {
    console.error('FAIL: Tag count mismatch!');
  } else {
    console.log(`PASS: Exactly ${openUrl} URLs with matched opening and closing tags.`);
  }

  // Extract all URLs and check for invalid chars or entities
  const locRegex = /<loc>(.*?)<\/loc>/g;
  let match;
  let invalidUrls = 0;
  while ((match = locRegex.exec(content)) !== null) {
    const url = match[1];
    try {
      new URL(url);
      if (url.includes('&') && !url.includes('&amp;')) {
        console.error(`FAIL: Unescaped ampersand in URL: ${url}`);
        invalidUrls++;
      }
    } catch (e: any) {
      console.error(`FAIL: Invalid URL: ${url} (${e.message})`);
      invalidUrls++;
    }
  }

  if (invalidUrls === 0) {
    console.log('PASS: All URLs are valid absolute URLs.');
  }

  // Check end tag
  if (content.trim().endsWith('</urlset>')) {
    console.log('PASS: Ends properly with </urlset>.');
  } else {
    console.error('FAIL: Does not end with </urlset>');
  }
}

const targetPath = process.argv[2] || './public/sitemap.xml';
validateXml(targetPath);
