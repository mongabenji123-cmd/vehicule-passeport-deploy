import { Helmet } from 'react-helmet-async';
import type { ComponentType, ReactNode } from 'react';

const SEOHelmet = Helmet as unknown as ComponentType<{ children?: ReactNode }>;

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  jsonLd?: Record<string, any> | Record<string, any>[];
}

/**
 * Per-page SEO: sets <title>, meta description, canonical, Open Graph,
 * Twitter card, and optional JSON-LD structured data.
 */
export function SEO({
  title,
  description,
  image = '/og-image.png',
  url,
  type = 'website',
  jsonLd,
}: SEOProps) {
  const canonical = url ?? (typeof window !== 'undefined' ? window.location.href : undefined);
  const absoluteImage = image.startsWith('http')
    ? image
    : (typeof window !== 'undefined' ? `${window.location.origin}${image}` : image);

  const jsonLdArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <SEOHelmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={absoluteImage} />
      {canonical && <meta property="og:url" content={canonical} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />

      {/* JSON-LD */}
      {jsonLdArray.map((data, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </SEOHelmet>
  );
}
