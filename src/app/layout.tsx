import type { Metadata } from "next";
import { Fraunces, Public_Sans, IBM_Plex_Mono, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"], variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"], display: "swap",
});
const publicSans = Public_Sans({
  subsets: ["latin"], variable: "--font-public-sans", display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap",
});
const nastaliq = Noto_Nastaliq_Urdu({
  subsets: ["arabic"], variable: "--font-nastaliq", display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: "Forest Department, Khyber Pakhtunkhwa",
  description: "Official portal of the Forest Department, Government of Khyber Pakhtunkhwa",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${publicSans.variable} ${plexMono.variable} ${nastaliq.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-paper text-bark"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
