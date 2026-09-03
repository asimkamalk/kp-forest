import type { Metadata } from "next";
import { Fraunces, Public_Sans, IBM_Plex_Mono, Noto_Nastaliq_Urdu } from "next/font/google";
import { getSiteSettings } from "@/lib/data/site";
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
  preload: false,
});
const nastaliq = Noto_Nastaliq_Urdu({
  subsets: ["arabic"], variable: "--font-nastaliq", display: "swap",
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const icon = settings.faviconUrl || settings.emblemUrl || settings.logoUrl;
  const base = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const absIcon = icon
    ? icon.startsWith("http")
      ? icon
      : `${base}${icon.startsWith("/") ? icon : `/${icon}`}`
    : undefined;

  return {
    metadataBase: new URL(base),
    title: {
      default: settings.siteName,
      template: `%s | ${settings.siteName}`,
    },
    description:
      settings.tagline ??
      "Official portal of the Forest Department, Government of Khyber Pakhtunkhwa",
    icons: absIcon
      ? {
          icon: [{ url: absIcon }],
          shortcut: [{ url: absIcon }],
          apple: [{ url: absIcon }],
        }
      : undefined,
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${publicSans.variable} ${plexMono.variable} ${nastaliq.variable} h-full antialiased`}
      suppressHydrationWarning
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
