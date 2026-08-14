type Settings = {
  siteName: string;
  siteNameUr?: string | null;
  tagline?: string | null;
  logoUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  helplineNumber?: string | null;
  address?: string | null;
};

/**
 * JSON-LD must live outside client boundaries (not inside Lenis/Navbar).
 * React cannot hydrate a <script> the browser has already parsed.
 */
export function GovernmentOrgJsonLd({ settings }: { settings: Settings }) {
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

  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
  );
}
