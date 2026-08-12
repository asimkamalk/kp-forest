import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { TrackRequestForm } from "@/components/site/contact/track-request-form";

export default function TrackRequestPage() {
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
              <li className="font-medium text-bark">Track</li>
            </ol>
          </nav>
          <p className="eyebrow mt-8 text-resin">Contact</p>
          <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] text-bark">
            Track a request
          </h1>
          <p className="mt-3 text-base leading-relaxed text-moss">
            Enter the ticket number you received when you submitted. Only the status and
            any public officer note are shown.
          </p>
        </Reveal>
        <div className="relative mt-10">
          <TrackRequestForm />
        </div>
      </div>
    </main>
  );
}
