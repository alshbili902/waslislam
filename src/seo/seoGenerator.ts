import {
  CANONICAL_DOMAIN,
  SITE_NAME_AR,
  SITE_NAME_EN,
  DEFAULT_OG_IMAGE,
  SITE_LOGO,
  STATIC_PUBLIC_ROUTES,
  getDynamicPublicRoutes,
  isPrivateRoute,
  RouteSeoConfig,
  BreadcrumbItem,
} from './seoConfig';

/**
 * Generates the official XML Sitemap for Wasl Islamic.
 * Includes all verified public pages, 114 Quran surahs, reciters, and wisdoms.
 * Filters out private, admin, and user dashboard routes.
 */
export function generateSitemapXml(): string {
  const staticRoutes = STATIC_PUBLIC_ROUTES.filter((r) => r.isIndexable);
  const dynamicRoutes = getDynamicPublicRoutes().filter((r) => r.isIndexable);
  const allRoutes = [...staticRoutes, ...dynamicRoutes];

  // Current ISO date for static routes (or fixed content update date)
  const today = new Date().toISOString().split('T')[0];

  const urlEntries = allRoutes.map((route) => {
    const loc = `${CANONICAL_DOMAIN}${route.path}`;
    return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(2)}</priority>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>`;
}

/**
 * Generates the official robots.txt configuration.
 * Directs search engine crawlers to the sitemap while protecting private routes.
 */
export function generateRobotsTxt(): string {
  return `# Wasl Islamic — Official Search Engine Directives
# https://waslislam.fun

User-agent: *
Allow: /

# Private & Administrative Routes (Restricted)
Disallow: /admin
Disallow: /admin/
Disallow: /dashboard
Disallow: /dashboard/
Disallow: /login
Disallow: /register
Disallow: /settings
Disallow: /api/

# Official Sitemap & Host
Sitemap: ${CANONICAL_DOMAIN}/sitemap.xml
Host: waslislam.fun
`;
}

/**
 * Resolves SEO metadata for any incoming request pathname.
 */
export function resolveSeoMetadata(pathname: string): {
  title: string;
  description: string;
  canonicalUrl: string;
  isIndexable: boolean;
  ogType: string;
  ogImage: string;
  breadcrumbs: BreadcrumbItem[];
  jsonLdSchemas: any[];
} {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';

  // 1. Private / Admin routes
  if (isPrivateRoute(cleanPath)) {
    return {
      title: `${SITE_NAME_AR} | لوحة التحكم وتسجيل الدخول`,
      description: 'منطقة خاصة ومحمية للمستخدمين وإدارة المنصة.',
      canonicalUrl: `${CANONICAL_DOMAIN}${cleanPath}`,
      isIndexable: false,
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      breadcrumbs: [],
      jsonLdSchemas: [],
    };
  }

  // 2. Check Static Routes
  const staticMatch = STATIC_PUBLIC_ROUTES.find((r) => r.path === cleanPath);
  if (staticMatch) {
    return buildResolvedSeo(staticMatch);
  }

  // 3. Check Dynamic Routes
  const dynamicRoutes = getDynamicPublicRoutes();
  const dynamicMatch = dynamicRoutes.find((r) => r.path === cleanPath);
  if (dynamicMatch) {
    return buildResolvedSeo(dynamicMatch);
  }

  // 4. Default Fallback for Public Content
  const fallbackConfig: RouteSeoConfig = {
    path: cleanPath,
    title: `${SITE_NAME_AR} | طريقك إلى الخير دائماً`,
    description: 'منصة وصل الإسلامية تجمع القرآن الكريم وتلاوات القراء، الأذكار، الأدعية، الأحاديث، مواقيت الصلاة والقبلة.',
    priority: 0.7,
    changefreq: 'weekly',
    breadcrumbs: [
      { name: 'الرئيسية', url: `${CANONICAL_DOMAIN}/` },
      { name: cleanPath.replace(/^\//, ''), url: `${CANONICAL_DOMAIN}${cleanPath}` },
    ],
    isIndexable: true,
  };

  return buildResolvedSeo(fallbackConfig);
}

function buildResolvedSeo(route: RouteSeoConfig) {
  const canonicalUrl = `${CANONICAL_DOMAIN}${route.path}`;

  // Structured Data Schemas
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME_AR,
    alternateName: [SITE_NAME_EN, 'منصة وصل الإسلامية'],
    url: CANONICAL_DOMAIN,
    inLanguage: 'ar-SA',
    description: route.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${CANONICAL_DOMAIN}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME_AR,
    alternateName: SITE_NAME_EN,
    url: CANONICAL_DOMAIN,
    logo: SITE_LOGO,
    sameAs: ['https://waslislam.fun'],
  };

  const webpageSchema = {
    '@context': 'https://schema.org',
    '@type': route.ogType === 'article' ? 'Article' : 'WebPage',
    name: route.title,
    headline: route.title,
    description: route.description,
    url: canonicalUrl,
    inLanguage: 'ar-SA',
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME_AR,
      url: CANONICAL_DOMAIN,
    },
  };

  const breadcrumbsSchema =
    route.breadcrumbs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: route.breadcrumbs.map((crumb, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: crumb.name,
            item: crumb.url,
          })),
        }
      : null;

  const jsonLdSchemas = [
    websiteSchema,
    organizationSchema,
    webpageSchema,
    ...(breadcrumbsSchema ? [breadcrumbsSchema] : []),
  ];

  return {
    title: route.title,
    description: route.description,
    canonicalUrl,
    isIndexable: route.isIndexable,
    ogType: route.ogType || 'website',
    ogImage: DEFAULT_OG_IMAGE,
    breadcrumbs: route.breadcrumbs,
    jsonLdSchemas,
  };
}

/**
 * Injects SEO tags into the root HTML template for server-side delivery.
 * This guarantees that Googlebot and social sharing crawlers receive
 * complete, pre-rendered metadata on every single page load.
 */
export function injectSeoMetadata(htmlTemplate: string, pathname: string): string {
  const seo = resolveSeoMetadata(pathname);

  // Replace Title
  let result = htmlTemplate.replace(
    /<title>.*?<\/title>/i,
    `<title>${escapeHtml(seo.title)}</title>`
  );

  // Replace Meta Description
  if (result.includes('<meta name="description"')) {
    result = result.replace(
      /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
      `<meta name="description" content="${escapeHtml(seo.description)}" />`
    );
  } else {
    result = result.replace(
      '</head>',
      `  <meta name="description" content="${escapeHtml(seo.description)}" />\n</head>`
    );
  }

  // Construct Dynamic Tags to inject
  const robotsDirective = seo.isIndexable
    ? '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />'
    : '<meta name="robots" content="noindex, nofollow" />';

  const canonicalTag = `<link rel="canonical" href="${escapeHtml(seo.canonicalUrl)}" />`;

  const ogTags = `
    <!-- Open Graph / Social Media -->
    <meta property="og:site_name" content="${escapeHtml(SITE_NAME_AR)}" />
    <meta property="og:title" content="${escapeHtml(seo.title)}" />
    <meta property="og:description" content="${escapeHtml(seo.description)}" />
    <meta property="og:url" content="${escapeHtml(seo.canonicalUrl)}" />
    <meta property="og:type" content="${escapeHtml(seo.ogType)}" />
    <meta property="og:image" content="${escapeHtml(seo.ogImage)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="ar_SA" />
    <meta property="og:locale:alternate" content="en_US" />

    <!-- Twitter / X -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(seo.title)}" />
    <meta name="twitter:description" content="${escapeHtml(seo.description)}" />
    <meta name="twitter:image" content="${escapeHtml(seo.ogImage)}" />`;

  const jsonLdScripts = seo.jsonLdSchemas
    .map(
      (schema) =>
        `    <script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n    </script>`
    )
    .join('\n');

  // Strip existing conflicting og/twitter/canonical tags from template
  result = result
    .replace(/<link\s+rel="canonical".*?>/gi, '')
    .replace(/<meta\s+property="og:.*?>/gi, '')
    .replace(/<meta\s+name="twitter:.*?>/gi, '')
    .replace(/<meta\s+name="robots".*?>/gi, '')
    .replace(/<script\s+type="application\/ld\+json".*?<\/script>/gis, '');

  const injectionBlock = `
    ${robotsDirective}
    ${canonicalTag}
${ogTags}
${jsonLdScripts}
  `;

  result = result.replace('</head>', `${injectionBlock}\n  </head>`);
  return result;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
