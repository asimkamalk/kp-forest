import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { ResearchRequestForm } from "@/components/site/services/research-request-form";

export default function ResearchRequestPage() {
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
              <li className="font-medium text-bark">Research request</li>
            </ol>
          </nav>
          <p className="eyebrow mt-8 text-resin">Services</p>
          <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] text-bark">
            Research request
          </h1>
          <p className="mt-3 text-base leading-relaxed text-moss">
            Seek permission or data for forest-related research. Attach a PDF proposal and
            keep the ticket number you receive.
          </p>
        </Reveal>
        <div className="mt-10">
          <ResearchRequestForm />
        </div>
      </div>
    </main>
  );
}
