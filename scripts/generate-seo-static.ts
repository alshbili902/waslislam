import fs from 'fs';
import path from 'path';
import { generateSitemapXml, generateRobotsTxt } from '../src/seo/seoGenerator';

function generateStaticSeoFiles() {
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapContent = generateSitemapXml();
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemapContent, 'utf-8');
  console.log(`[SEO] Successfully generated sitemap.xml at ${sitemapPath} (${sitemapContent.length} bytes)`);

  const robotsContent = generateRobotsTxt();
  const robotsPath = path.join(publicDir, 'robots.txt');
  fs.writeFileSync(robotsPath, robotsContent, 'utf-8');
  console.log(`[SEO] Successfully generated robots.txt at ${robotsPath} (${robotsContent.length} bytes)`);
}

generateStaticSeoFiles();
