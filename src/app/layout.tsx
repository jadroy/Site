import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import ThemeToggle from "./components/ThemeToggle";
import Crosshair from "./components/Crosshair";

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
      <body className={`${GeistSans.className} ${GeistMono.variable}`}>
        <Crosshair />
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
