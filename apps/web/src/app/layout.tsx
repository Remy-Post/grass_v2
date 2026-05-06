import type { Metadata, Viewport } from 'next';
import { Geist, Fraunces } from 'next/font/google';
import '../styles/globals.css';

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
  display: 'swap',
});

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thelawnguybradford.ca';
const BRAND_LOGO = {
  url: '/images/lawnguy-logo-full-transparent.webp',
  width: 1128,
  height: 635,
  alt: 'The Lawn Guy Bradford logo',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s | The Lawn Guy Bradford',
    default: 'The Lawn Guy Bradford | Modern Lawn Care In Bradford',
  },
  description:
    'Modern lawn care in Bradford/BWG by Remy. Mowing, trimming, edging, cleanups, and seasonal yard care with simple text-first quotes.',
  applicationName: 'The Lawn Guy Bradford',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
  keywords: [
    'lawn care Bradford',
    'lawn mowing Bradford Ontario',
    'grass cutting Bradford',
    'lawn maintenance Bradford West Gwillimbury',
    'yard cleanup Bradford',
    'leaf cleanup Bradford',
    'seasonal cleanup Bradford',
  ],
  authors: [{ name: 'The Lawn Guy Bradford' }],
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: SITE_URL,
    siteName: 'The Lawn Guy Bradford',
    title: 'The Lawn Guy Bradford | Modern Lawn Care In Bradford',
    description:
      'Modern lawn care in Bradford/BWG by Remy. Text for a quote, book a visit, come home to a sharper lawn.',
    images: [BRAND_LOGO],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Lawn Guy Bradford',
    description: 'Modern lawn care in Bradford/BWG.',
    images: [BRAND_LOGO],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1f5a3a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={`${geist.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-bg text-ink antialiased">{children}</body>
    </html>
  );
}
