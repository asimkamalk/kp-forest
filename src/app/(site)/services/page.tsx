import Link from "next/link";
import { FlaskConical, PhoneCall, Sprout, type LucideIcon } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

const SERVICES: {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    href: "/services/plant-request",
    label: "Request plants",
    description: "Apply for saplings for community or institutional planting.",
    icon: Sprout,
  },
  {
    href: "/services/research-request",
    label: "Research request",
    description: "Seek permission or data for forest-related research.",
    icon: FlaskConical,
  },
  {
    href: "/services/emergency-contacts",
    label: "Emergency contacts",
    description: "Reach the right officer when a forest emergency arises.",
    icon: PhoneCall,
  },
];

export default function ServicesIndexPage() {
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
              <li className="font-medium text-bark">Services</li>
            </ol>
          </nav>
          <p className="eyebrow mt-8 text-resin">Services</p>
          <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] text-bark">
            Citizen services
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-moss">
            Request plants, seek research access, or reach emergency contacts.
          </p>
        </Reveal>

        <Stagger
          className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6"
          gap={0.08}
        >
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <StaggerItem key={service.href}>
                <Link
                  href={service.href}
                  className="group flex h-full flex-col rounded-[12px] border border-mist bg-white p-5 transition-[transform,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-deodar md:p-6"
                >
                  <Icon
                    className="h-6 w-6 text-deodar transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-resin"
                    aria-hidden
                  />
                  <span className="mt-4 font-sans text-base font-semibold text-bark">
                    {service.label}
                  </span>
                  <span className="mt-1.5 text-sm leading-relaxed text-moss">
                    {service.description}
                  </span>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </main>
  );
}
