import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Great_Vibes, Manrope } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
  display: "swap",
});

const SITE_URL = "https://pearlbodyng.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Pearlbody.NG — Coming Soon | ...looks beyond words",
  description:
    "Pearlbody.NG — bespoke fashion, bridal wears & silk, skincare and all-round wellness. The digital atelier opens 21 October 2026. Benin City, Nigeria.",
  keywords: [
    "Pearlbody",
    "Pearlbody.NG",
    "bespoke fashion Nigeria",
    "tailor Benin City",
    "bridal wears Nigeria",
    "skincare Nigeria",
    "fashion house Nigeria",
  ],
  applicationName: "Pearlbody.NG",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Pearlbody.NG",
    title: "Pearlbody.NG — Coming Soon | ...looks beyond words",
    description:
      "The house of Pearlbody opens 21 October 2026. Quality. Professionalism. Reliability.",
    images: [
      {
        url: "/brand/pearl-logo.jpeg",
        width: 1080,
        height: 687,
        alt: "Pearlbody.NG logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pearlbody.NG — Coming Soon",
    description: "The house of Pearlbody opens 21 October 2026.",
    images: ["/brand/pearl-logo.jpeg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${manrope.variable} ${greatVibes.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
