import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ChurchJsonLd } from "@/components/seo/ChurchJsonLd";
import { CHURCH_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: CHURCH_NAME,
    template: `%s | ${CHURCH_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: CHURCH_NAME,
  openGraph: {
    title: CHURCH_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: CHURCH_NAME,
    type: "website",
    images: [
      {
        url: "/icons/og.png",
        width: 1200,
        height: 630,
        alt: `${CHURCH_NAME} — A perfect place for imperfect people to meet a perfect Christ`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: CHURCH_NAME,
    description: SITE_DESCRIPTION,
    images: ["/icons/og.png"],
  },
  icons: {
    icon: [
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#542A7C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
        suppressHydrationWarning
      >
        <ChurchJsonLd />
        {children}
      </body>
    </html>
  );
}

