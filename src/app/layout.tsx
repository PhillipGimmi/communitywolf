import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { GlobalLoading } from "@/components/ui/global-loading";
import { AuthProvider } from "@/lib/auth/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Safety News App - Your Guardian in an Uncertain World",
  description: "Local safety and crime alerts - Your Guardian in an Uncertain World. Quickly search local crime & safety news and view geolocated results on a map.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SafetyNews",
    startupImage: [
      {
        url: "/icons/ios/512.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/icons/ios/512.png",
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/icons/ios/512.png",
        media: "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/android/android-launchericon-48-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/android/android-launchericon-72-72.png", sizes: "72x72", type: "image/png" },
      { url: "/icons/android/android-launchericon-96-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/android/android-launchericon-144-144.png", sizes: "144x144", type: "image/png" },
      { url: "/icons/android/android-launchericon-192-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/android/android-launchericon-512-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/ios/152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/ios/192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/ios/512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "SafetyNews",
    "application-name": "Safety News App",
    "msapplication-TileColor": "#111827",
    "msapplication-config": "/browserconfig.xml",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#111827",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#111827" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SafetyNews" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/ios/192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <GlobalLoading />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}