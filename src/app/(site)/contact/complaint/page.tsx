import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { CitizenRequestForm } from "@/components/site/contact/citizen-request-form";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "Lodge a complaint",
  "Report an issue to the Forest Department and receive a ticket number to track progress.",
  "/contact/complaint"
);

export default function ComplaintPage() {
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
                <Link href="/contact" className="transition-colors hover:text-deodar">
                  Contact
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="font-medium text-bark">Complaint</li>
            </ol>
          </nav>
          <p className="eyebrow mt-8 text-resin">Contact</p>
          <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] text-bark">
            Lodge a complaint
          </h1>
          <p className="mt-3 text-base leading-relaxed text-moss">
            Describe what went wrong. You will receive a ticket number to track progress.
          </p>
        </Reveal>
        <div className="mt-10">
          <CitizenRequestForm subject="Complaint" />
        </div>
      </div>
    </main>
  );
}
