import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { JetBrains_Mono, Fira_Code, Source_Code_Pro, IBM_Plex_Mono, Space_Mono, Inconsolata, Roboto_Mono, Ubuntu_Mono, Anonymous_Pro, Cousine } from "next/font/google";
import "./globals.css";
import Crosshair from "./components/Crosshair";
// import FontSwitcher from "./components/FontSwitcher";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", weight: ["300", "400"] });
const firaCode = Fira_Code({ subsets: ["latin"], variable: "--font-fira-code", weight: ["300", "400"] });
const sourceCodePro = Source_Code_Pro({ subsets: ["latin"], variable: "--font-source-code-pro", weight: ["300", "400"] });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-ibm-plex-mono", weight: ["300", "400"] });
const spaceMono = Space_Mono({ subsets: ["latin"], variable: "--font-space-mono", weight: ["400"] });
const inconsolata = Inconsolata({ subsets: ["latin"], variable: "--font-inconsolata", weight: ["300", "400"] });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-roboto-mono", weight: ["300", "400"] });
const ubuntuMono = Ubuntu_Mono({ subsets: ["latin"], variable: "--font-ubuntu-mono", weight: ["400"] });
const anonymousPro = Anonymous_Pro({ subsets: ["latin"], variable: "--font-anonymous-pro", weight: ["400"] });
const cousine = Cousine({ subsets: ["latin"], variable: "--font-cousine", weight: ["400"] });

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
      <body className={`${GeistSans.variable} ${GeistMono.variable} ${jetbrainsMono.variable} ${firaCode.variable} ${sourceCodePro.variable} ${ibmPlexMono.variable} ${spaceMono.variable} ${inconsolata.variable} ${robotoMono.variable} ${ubuntuMono.variable} ${anonymousPro.variable} ${cousine.variable}`}>
        <Crosshair />
        {/* <FontSwitcher /> */}
        {children}
      </body>
    </html>
  );
}
