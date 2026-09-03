import type { Metadata } from "next";
import { connection } from "next/server";
import { Fraunces, Public_Sans, IBM_Plex_Mono, Noto_Nastaliq_Urdu } from "next/font/google";
import { getSiteSettings } from "@/lib/data/site";
import { resolveSiteIconUrl } from "@/lib/site-icon";
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
  await connection();
  const settings = await getSiteSettings();
  const icon = resolveSiteIconUrl(settings);

  return {
    metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
    title: {
      default: settings.siteName,
      template: `%s | ${settings.siteName}`,
    },
    description:
      settings.tagline ??
      "Official portal of the Forest Department, Government of Khyber Pakhtunkhwa",
    icons: icon
      ? {
          icon: [{ url: icon }, { url: "/icon", type: "image/png", sizes: "64x64" }],
          shortcut: [{ url: icon }],
          apple: [{ url: icon }],
        }
      : {
          icon: [{ url: "/icon", type: "image/png", sizes: "64x64" }],
        },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  await connection();
  const settings = await getSiteSettings();
  const icon = resolveSiteIconUrl(settings);

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${publicSans.variable} ${plexMono.variable} ${nastaliq.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href={icon ?? "/icon"} />
        <link rel="shortcut icon" href={icon ?? "/icon"} />
        <link rel="apple-touch-icon" href={icon ?? "/icon"} />
      </head>
      <body
        className="min-h-full flex flex-col bg-paper text-bark"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
