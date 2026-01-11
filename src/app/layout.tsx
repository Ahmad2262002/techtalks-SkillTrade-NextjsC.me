import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import NextTopLoader from 'nextjs-toploader';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://skilltrade.solutions'),
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased`}
      >
        <script dangerouslySetInnerHTML={{
          __html: `
          const updateViewportHeight = () => {
            document.documentElement.style.setProperty('--visual-viewport-height', window.visualViewport ? window.visualViewport.height + 'px' : window.innerHeight + 'px');
          };
          window.visualViewport?.addEventListener('resize', updateViewportHeight);
          window.visualViewport?.addEventListener('scroll', updateViewportHeight);
          updateViewportHeight();
        `}} />
        <ThemeProvider>
          <NextTopLoader
            color="var(--primary)"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px var(--primary),0 0 5px var(--primary)"
          />
          <div className="page-enter">
            {children}
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}