import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import "./responsive.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AudioProvider } from "@/context/AudioContext";
import NextTopLoader from 'nextjs-toploader';
import { SpeedInsights } from "@vercel/speed-insights/next";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Allow zoom for accessibility
  userScalable: true, // Enable user scaling
  viewportFit: 'cover',
  themeColor: '#000000',
};

export const metadata: Metadata = {
  title: {
    default: "SkillTrade - Premium Knowledge Exchange Platform",
    template: "%s | SkillTrade"
  },
  description: "Transform your expertise into valuable skills. Join the premium barter economy for knowledge exchange. Connect with mentors, learn new skills, and grow together in a trusted community.",
  keywords: [
    "skill exchange",
    "knowledge sharing",
    "peer learning",
    "skill swap",
    "mentorship platform",
    "barter economy",
    "professional development",
    "skill trading",
    "online learning",
    "community learning"
  ],
  authors: [{ name: "SkillTrade Team" }],
  creator: "SkillTrade",
  publisher: "SkillTrade",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.skilltrade.solutions'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'SkillTrade - Premium Knowledge Exchange Platform',
    description: 'Transform your expertise into valuable skills. Join the premium barter economy for knowledge exchange.',
    siteName: 'SkillTrade',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SkillTrade - Knowledge Exchange Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkillTrade - Premium Knowledge Exchange Platform',
    description: 'Transform your expertise into valuable skills. Join the premium barter economy for knowledge exchange.',
    images: ['/og-image.png'],
    creator: '@skilltrade',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/favicon.ico', sizes: '180x180' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    title: 'SkillTrade',
    statusBarStyle: 'default',
    capable: true,
  },
  verification: {
    // Add your verification codes when available
    // google: 'google-site-verification-code',
    // yandex: 'yandex-verification-code',
  },
};


import { Toaster } from "@/components/ui/toaster";
// Debug tools removed

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${playfair.variable} antialiased selection:bg-primary/20 selection:text-primary`}
      >
        <script dangerouslySetInnerHTML={{
          __html: `
          // Smart Locale Detection
          try {
            const locale = navigator.language?.split('-')[0] || 'en';
            document.documentElement.lang = locale;
          } catch (e) {}

          const updateViewportHeight = () => {
            document.documentElement.style.setProperty('--visual-viewport-height', window.visualViewport ? window.visualViewport.height + 'px' : window.innerHeight + 'px');
          };
          window.visualViewport?.addEventListener('resize', updateViewportHeight);
          window.visualViewport?.addEventListener('scroll', updateViewportHeight);
          updateViewportHeight();
        `}} />
        <ThemeProvider>
          <AudioProvider>
            <NextTopLoader
              color="hsl(var(--primary))"
              initialPosition={0.2}
              crawlSpeed={100}
              height={2}
              crawl={true}
              showSpinner={false}
              easing="ease"
              speed={100}
              shadow="0 0 5px var(--primary)"
              zIndex={9999}
            />
            <div className="page-enter">
              {children}
            </div>
            <Toaster />
            <SpeedInsights />
          </AudioProvider>
        </ThemeProvider>
      </body>
    </html >
  );
}