import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Bebas_Neue } from "next/font/google";
import "./globals.css";

import { Providers } from "@/components/shared/providers";
import { getAppUrl } from "@/lib/app-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const DESCRIPTION =
  "Find motorcycle riders near you, plan group rides, and ride together — with live tracking and safety built in.";

export async function generateMetadata(): Promise<Metadata> {
  return {
    // Resolves relative og:image / canonical URLs site-wide.
    metadataBase: new URL(await getAppUrl()),
    title: { default: "Rydo — Find your riding brotherhood", template: "%s — Rydo" },
    description: DESCRIPTION,
    applicationName: "Rydo",
    keywords: ["group rides", "motorcycle riders", "bike rides near me", "riding group", "biker community"],
    openGraph: {
      type: "website",
      siteName: "Rydo",
      locale: "en_IN",
      title: "Rydo — Find your riding brotherhood",
      description: DESCRIPTION,
    },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  themeColor: "#17120e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers mappls={{ token: process.env.MAPPLS_TOKEN, style: process.env.MAPPLS_STYLE }}>{children}</Providers>
      </body>
    </html>
  );
}
