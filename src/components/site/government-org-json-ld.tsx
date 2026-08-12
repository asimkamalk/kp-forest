import { getSiteSettings } from "@/lib/data/site";

/**
 * GovernmentOrganization JSON-LD for the homepage.
 * Renders a script tag; safe for crawlers without affecting layout.
 */
export async function GovernmentOrgJsonLd() {
  const settings = await getSiteSettings();
  const base = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

  const data = {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    name: settings.siteName,
    alternateName: settings.siteNameUr ?? undefined,
    description:
      settings.tagline ??
      "Official portal of the Forest Department, Government of Khyber Pakhtunkhwa",
    url: base,
    logo: settings.logoUrl
      ? settings.logoUrl.startsWith("http")
        ? settings.logoUrl
        : `${base}${settings.logoUrl}`
      : undefined,
    email: settings.email ?? undefined,
    telephone: settings.phone ?? settings.helplineNumber ?? undefined,
    address: settings.address
      ? {
          "@type": "PostalAddress",
          streetAddress: settings.address,
          addressRegion: "Khyber Pakhtunkhwa",
          addressCountry: "PK",
        }
      : undefined,
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Khyber Pakhtunkhwa",
    },
    parentOrganization: {
      "@type": "GovernmentOrganization",
      name: "Government of Khyber Pakhtunkhwa",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
