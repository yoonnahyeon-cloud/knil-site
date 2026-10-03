import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Archivo } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const pretendard = localFont({
  src: [
    { path: "./fonts/Pretendard-Regular.subset.woff2", weight: "400" },
    { path: "./fonts/Pretendard-Medium.subset.woff2", weight: "500" },
    { path: "./fonts/Pretendard-SemiBold.subset.woff2", weight: "600" },
    { path: "./fonts/Pretendard-Bold.subset.woff2", weight: "700" },
  ],
  variable: "--font-pretendard",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  weight: "variable",
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "block",
});

const title = `KNIL | ${site.category}`;
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  metadataBase: new URL(new URL(site.url).origin),
  title,
  description: site.description,
  applicationName: "KNIL",
  keywords: ["KNIL", "크닐", "멀티링크", "크리에이터", "링크인바이오", "크리에이터 데이터", "주식회사 크닐", "크리에이터 멀티링크 플랫폼", "크리에이터 마케팅", "인플루언서 데이터"],
  authors: [{ name: site.company }],
  alternates: { canonical: `${base}/` },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: `${base}/`,
    siteName: "KNIL",
    title,
    description: site.description,
    images: [{ url: `${base}/og.png`, width: 1200, height: 630, alt: "KNIL 크리에이터 멀티링크 플랫폼" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: site.description,
    images: [`${base}/og.png`],
  },
  robots: { index: true, follow: true },
  icons: { icon: `${base}/icon.svg` },
};

export const viewport: Viewport = {
  themeColor: "#f7f6f2",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.company,
  alternateName: "KNIL",
  url: site.url,
  slogan: site.slogan,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${archivo.variable}`}>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
