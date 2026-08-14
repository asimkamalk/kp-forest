import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { ContactDirectory } from "@/components/site/contact/contact-directory";
import { OfficeMap } from "@/components/site/office-map-lazy";
import { getContactDirectory, getSiteSettings } from "@/lib/data/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "Contact directory",
  "Find Forest Department officers and offices across Khyber Pakhtunkhwa.",
  "/contact"
);

/** Forest Department HQ — Shami Road, Peshawar (approximate). */
const HQ_LAT = 34.0135;
const HQ_LNG = 71.5615;

export default async function ContactPage() {
  const [settings, contacts] = await Promise.all([
    getSiteSettings(),
    getContactDirectory(),
  ]);

  return (
    <main className="flex-1 bg-paper py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <Reveal>
          <nav aria-label="Breadcrumb" className="text-sm text-moss">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href="/" className="transition-colors hover:text-deodar">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="font-medium text-bark">Contact</li>
            </ol>
          </nav>
          <p className="eyebrow mt-8 text-resin">Contact</p>
          <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] text-bark">
            Contact us
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-moss">
            Head office details, the departmental directory, and ways to lodge a complaint
            or suggestion.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/contact/complaint"
              className="inline-flex h-10 items-center rounded-[8px] bg-deodar px-4 text-sm font-medium text-paper hover:bg-bark"
            >
              Lodge a complaint
            </Link>
            <Link
              href="/contact/suggestion"
              className="inline-flex h-10 items-center rounded-[8px] border border-mist px-4 text-sm font-medium text-bark hover:bg-mist/40"
            >
              Submit a suggestion
            </Link>
            <Link
              href="/contact/track"
              className="inline-flex h-10 items-center rounded-[8px] border border-mist px-4 text-sm font-medium text-bark hover:bg-mist/40"
            >
              Track a request
            </Link>
          </div>
        </Reveal>

        <Reveal className="mt-14">
          <h2 className="font-display text-2xl text-bark">Head office</h2>
          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            <div className="space-y-4 text-sm text-bark">
              {settings.address && (
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-moss">
                    Address
                  </p>
                  <p className="mt-1 leading-relaxed">{settings.address}</p>
                </div>
              )}
              {settings.phone && (
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-moss">
                    Phone
                  </p>
                  <a
                    href={`tel:${settings.phone.replace(/\s/g, "")}`}
                    className="mt-1 inline-flex items-center gap-2 text-deodar hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5" aria-hidden />
                    {settings.phone}
                  </a>
                </div>
              )}
              {settings.helplineNumber && (
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-moss">
                    Helpline
                  </p>
                  <a
                    href={`tel:${settings.helplineNumber.replace(/\s/g, "")}`}
                    className="mt-1 inline-flex items-center gap-2 font-mono text-deodar hover:underline"
                  >
                    {settings.helplineNumber}
                  </a>
                </div>
              )}
              {settings.email && (
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-moss">
                    Email
                  </p>
                  <a
                    href={`mailto:${settings.email}`}
                    className="mt-1 inline-flex items-center gap-2 text-deodar hover:underline"
                  >
                    <Mail className="h-3.5 w-3.5" aria-hidden />
                    {settings.email}
                  </a>
                </div>
              )}
            </div>
            <OfficeMap
              lat={HQ_LAT}
              lng={HQ_LNG}
              label="Forest Department head office, Peshawar"
              className="aspect-[4/3] w-full overflow-hidden rounded-[12px] border border-mist"
            />
          </div>
        </Reveal>

        <section className="mt-16 md:mt-20">
          <Reveal>
            <h2 className="font-display text-2xl text-bark">Departmental directory</h2>
            <p className="mt-2 max-w-2xl text-sm text-moss">
              Officers listed by region, circle and division.
            </p>
          </Reveal>
          <ContactDirectory contacts={contacts} />
        </section>
      </div>
    </main>
  );
}
