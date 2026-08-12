import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { PageBody } from "@/components/site/services/page-body";
import { PlantRequestForm } from "@/components/site/services/plant-request-form";
import { getPageBySlug } from "@/lib/data/site";

export default async function PlantRequestPage() {
  const page = await getPageBySlug("free-plant-scheme");

  return (
    <main className="flex-1 bg-paper py-16 md:py-24">
      <div className="mx-auto max-w-[720px] px-6">
        <Reveal>
          <nav aria-label="Breadcrumb" className="text-sm text-moss">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href="/" className="transition-colors hover:text-deodar">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/services" className="transition-colors hover:text-deodar">
                  Services
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="font-medium text-bark">Plant request</li>
            </ol>
          </nav>
          <p className="eyebrow mt-8 text-resin">Services</p>
          <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] text-bark">
            Request plants
          </h1>
          <p className="mt-3 text-base leading-relaxed text-moss">
            Apply for saplings under the free plant scheme. You will receive a ticket
            number to track your request.
          </p>
        </Reveal>

        {page && (
          <Reveal className="mt-10 rounded-[12px] border border-mist bg-white p-6 shadow-[var(--shadow-card)]">
            <h2 className="font-display text-2xl text-bark">{page.title}</h2>
            <PageBody body={page.body} />
          </Reveal>
        )}

        <div className="mt-10">
          <PlantRequestForm />
        </div>
      </div>
    </main>
  );
}
