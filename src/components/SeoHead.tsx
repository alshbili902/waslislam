import React, { useEffect } from 'react';
import { resolveSeoMetadata } from '../seo/seoGenerator';

interface SeoHeadProps {
  pathname?: string;
}

/**
 * SeoHead updates the browser document head (title, meta description,
 * canonical link, robots directives, Open Graph, Twitter cards, and JSON-LD structured data)
 * during client-side navigation.
 */
export const SeoHead: React.FC<SeoHeadProps> = ({ pathname }) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const currentPath = pathname || window.location.pathname || '/';
    const seo = resolveSeoMetadata(currentPath);

    // 1. Update Document Title
    document.title = seo.title;

    // Helper to set or create meta tag
    const setMetaTag = (attrName: string, attrVal: string, contentVal: string) => {
      let tag = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attrName, attrVal);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', contentVal);
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', seo.description);
    setMetaTag(
      'name',
      'robots',
      seo.isIndexable
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow'
    );

    // 3. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', seo.canonicalUrl);

    // 4. Open Graph Tags
    setMetaTag('property', 'og:site_name', 'وصل الإسلامية');
    setMetaTag('property', 'og:title', seo.title);
    setMetaTag('property', 'og:description', seo.description);
    setMetaTag('property', 'og:url', seo.canonicalUrl);
    setMetaTag('property', 'og:type', seo.ogType);
    setMetaTag('property', 'og:image', seo.ogImage);
    setMetaTag('property', 'og:locale', 'ar_SA');

    // 5. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', seo.title);
    setMetaTag('name', 'twitter:description', seo.description);
    setMetaTag('name', 'twitter:image', seo.ogImage);

    // 6. JSON-LD Structured Data
    let jsonLdScript = document.getElementById('wasl-seo-jsonld') as HTMLScriptElement | null;
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = 'wasl-seo-jsonld';
      jsonLdScript.type = 'application/ld+json';
      document.head.appendChild(jsonLdScript);
    }
    jsonLdScript.textContent = JSON.stringify(seo.jsonLdSchemas);
  }, [pathname]);

  return null;
};
