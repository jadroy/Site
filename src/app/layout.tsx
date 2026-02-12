import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { GeistPixelLine } from "geist/font/pixel";
import { IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import "./design-system.css";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-ibm-plex-mono", weight: ["300", "400", "500"] });

const departureMono = localFont({
  src: [{ path: "./fonts/DepartureMono-Regular.woff2", weight: "400", style: "normal" }],
  variable: "--font-departure-mono",
});

const saans = localFont({
  src: [
    { path: "./fonts/Saans-TRIAL-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/Saans-TRIAL-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/Saans-TRIAL-SemiBold.otf", weight: "600", style: "normal" },
    { path: "./fonts/Saans-TRIAL-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-saans",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Roy Jad",
  description: "Personal portfolio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable} ${ibmPlexMono.variable} ${saans.variable} ${GeistPixelLine.variable} ${departureMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
