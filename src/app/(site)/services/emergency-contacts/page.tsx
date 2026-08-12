import Link from "next/link";
import { Phone } from "lucide-react";
import { PageBody } from "@/components/site/services/page-body";
import {
  getEmergencyContacts,
  getPageBySlug,
  getSiteSettings,
} from "@/lib/data/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "Emergency contacts",
  "Helpline and officer contacts for forest fires and other forest emergencies in KP.",
  "/services/emergency-contacts"
);

export default async function EmergencyContactsPage() {
  const [settings, groups, guidance] = await Promise.all([
    getSiteSettings(),
    getEmergencyContacts(),
    getPageBySlug("forest-fire-reporting"),
  ]);

  const helpline = settings.helplineNumber?.trim() || null;
  const helplineTel = helpline ? helpline.replace(/\s/g, "") : null;

  return (
    <main className="flex-1 bg-paper">
      {helpline && helplineTel && (
        <div className="bg-resin px-6 py-6 md:py-8">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-bark/80">
                Departmental helpline
              </p>
              <p className="mt-1 font-display text-2xl text-bark md:text-3xl">
                Call {helpline}
              </p>
            </div>
            <a
              href={`tel:${helplineTel}`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-bark px-6 text-base font-medium text-paper hover:bg-deodar"
            >
              <Phone className="h-5 w-5" aria-hidden />
              Dial now
            </a>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1200px] px-6 py-12 md:py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-moss">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="transition-colors hover:text-deodar">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="font-medium text-bark">Emergency contacts</li>
          </ol>
        </nav>

        <p className="eyebrow mt-8 text-resin">Services</p>
        <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] text-bark">
          Emergency contacts
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-moss">
          Officers to call during forest fires and other field emergencies. Tap a number
          to dial.
        </p>

        {guidance && (
          <section className="mt-10 rounded-[12px] border border-mist bg-white p-6 shadow-[var(--shadow-card)] md:p-8">
            <h2 className="font-display text-2xl text-bark">{guidance.title}</h2>
            <PageBody body={guidance.body} />
          </section>
        )}

        <section className="mt-12 space-y-10">
          {groups.length === 0 ? (
            <p className="text-sm text-moss">
              No emergency contacts published yet. Use the helpline above if one is listed.
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.regionId}>
                <h2 className="font-display text-2xl text-bark">{group.regionName}</h2>
                <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.contacts.map((person) => {
                    const tel = person.phone?.replace(/\s/g, "") ?? null;
                    return (
                      <li
                        key={person.id}
                        className="rounded-[12px] border border-mist bg-white p-4 shadow-[var(--shadow-card)]"
                      >
                        <p className="font-sans text-base font-medium text-bark">
                          {person.name}
                        </p>
                        <p className="mt-0.5 font-mono text-xs uppercase tracking-wider text-moss">
                          {person.designation}
                        </p>
                        {person.divisionName && (
                          <p className="mt-1 text-xs text-moss">{person.divisionName}</p>
                        )}
                        {person.phone && tel ? (
                          <a
                            href={`tel:${tel}`}
                            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-deodar px-4 text-sm font-medium text-paper hover:bg-bark"
                          >
                            <Phone className="h-4 w-4" aria-hidden />
                            {person.phone}
                          </a>
                        ) : (
                          <p className="mt-4 text-sm text-moss">No phone on record</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
