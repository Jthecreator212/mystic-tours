// SEO optimization component
'use client';

import Head from 'next/head';
import { useEffect } from 'react';

interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'tour';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

interface SEOOptimizerProps {
  data: SEOData;
  structuredData?: Record<string, unknown>;
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

export function SEOOptimizer({
  data,
  structuredData,
  canonicalUrl,
  noIndex = false,
  noFollow = false,
}: SEOOptimizerProps) {
  const {
    title,
    description,
    keywords = [],
    image,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    section,
    tags = [],
  } = data;

  // Generate structured data for tours
  const generateTourStructuredData = () => {
    if (type !== 'tour' || !structuredData) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'TouristAttraction',
      name: title,
      description,
      image: image ? [image] : undefined,
      url,
      ...structuredData,
    };
  };

  // Generate organization structured data
  const generateOrganizationStructuredData = () => {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Mystic Tours',
      url: 'https://mystictours.com',
      logo: 'https://mystictours.com/logo.png',
      description: 'Premium tour experiences in Jamaica',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'JM',
        addressLocality: 'Montego Bay',
        addressRegion: 'St. James',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-876-555-0123',
        contactType: 'customer service',
      },
      sameAs: [
        'https://facebook.com/mystictours',
        'https://instagram.com/mystictours',
        'https://twitter.com/mystictours',
      ],
    };
  };

  // Preload critical resources
  useEffect(() => {
    if (image) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = image;
      document.head.appendChild(link);
    }
  }, [image]);

  // Generate meta robots content
  const generateRobotsContent = () => {
    const directives = [];
    if (noIndex) directives.push('noindex');
    if (noFollow) directives.push('nofollow');
    if (!noIndex && !noFollow) directives.push('index', 'follow');
    return directives.join(', ');
  };

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      <meta name="robots" content={generateRobotsContent()} />
      <meta name="author" content={author || 'Mystic Tours'} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
      {image && <meta property="og:image:width" content="1200" />}
      {image && <meta property="og:image:height" content="630" />}
      <meta property="og:site_name" content="Mystic Tours" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      <meta name="twitter:site" content="@mystictours" />

      {/* Article Meta Tags */}
      {type === 'article' && (
        <>
          {publishedTime && (
            <meta property="article:published_time" content={publishedTime} />
          )}
          {modifiedTime && (
            <meta property="article:modified_time" content={modifiedTime} />
          )}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateTourStructuredData()),
          }}
        />
      )}

      {/* Organization Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateOrganizationStructuredData()),
        }}
      />

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#1a5d1a" />
      <meta name="msapplication-TileColor" content="#1a5d1a" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Mystic Tours" />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
    </Head>
  );
}

// SEO helper functions
export const generateTourSEO = (tour: {
  name: string;
  description: string;
  shortDescription: string;
  images: string[];
  price: number;
  duration: string;
  location: string;
  slug: string;
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mystictours.com';
  
  return {
    title: `${tour.name} - Mystic Tours Jamaica`,
    description: tour.shortDescription,
    keywords: [
      tour.name,
      'Jamaica tours',
      'Montego Bay tours',
      tour.location,
      'adventure tours',
      'guided tours',
      'Jamaica travel',
    ],
    image: tour.images[0],
    url: `${baseUrl}/tours/${tour.slug}`,
    type: 'tour' as const,
    structuredData: {
      name: tour.name,
      description: tour.description,
      image: tour.images,
      url: `${baseUrl}/tours/${tour.slug}`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: tour.location,
        addressCountry: 'JM',
      },
      offers: {
        '@type': 'Offer',
        price: tour.price,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      duration: tour.duration,
    },
  };
};

export const generatePageSEO = (page: {
  title: string;
  description: string;
  path: string;
  image?: string;
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mystictours.com';
  
  return {
    title: page.title,
    description: page.description,
    keywords: [
      'Jamaica tours',
      'Montego Bay tours',
      'adventure tours',
      'guided tours',
      'Jamaica travel',
    ],
    image: page.image,
    url: `${baseUrl}${page.path}`,
    type: 'website' as const,
  };
}; 