import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../context/ThemeContext";

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
    default: "SkillSwap - Premium Knowledge Exchange Platform",
    template: "%s | SkillSwap"
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
  authors: [{ name: "SkillSwap Team" }],
  creator: "SkillSwap",
  publisher: "SkillSwap",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'SkillSwap - Premium Knowledge Exchange Platform',
    description: 'Transform your expertise into valuable skills. Join the premium barter economy for knowledge exchange.',
    siteName: 'SkillSwap',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SkillSwap - Knowledge Exchange Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkillSwap - Premium Knowledge Exchange Platform',
    description: 'Transform your expertise into valuable skills. Join the premium barter economy for knowledge exchange.',
    images: ['/og-image.png'],
    creator: '@skillswap',
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
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
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
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
        {/* Scripts for Ion Icons used in SearchSection */}
        <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
        <script noModule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
      </body>
    </html>
  );
}