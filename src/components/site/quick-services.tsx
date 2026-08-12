"use client";

import Link from "next/link";
import {
  Download,
  FlaskConical,
  MapPinned,
  MessageSquareWarning,
  PhoneCall,
  Sprout,
  type LucideIcon,
} from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

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
    href: "/contact/complaint",
    label: "Lodge a complaint",
    description: "Report a problem and receive a ticket for follow-up.",
    icon: MessageSquareWarning,
  },
  {
    href: "/services/research-request",
    label: "Research request",
    description: "Seek permission or data for forest-related research.",
    icon: FlaskConical,
  },
  {
    href: "/downloads/publications",
    label: "Downloads",
    description: "Publications, forms, acts, rules and notifications.",
    icon: Download,
  },
  {
    href: "/services/emergency-contacts",
    label: "Emergency contacts",
    description: "Reach the right officer when a forest emergency arises.",
    icon: PhoneCall,
  },
  {
    href: "/regions",
    label: "Find your division",
    description: "Locate your forest division across the three regions.",
    icon: MapPinned,
  },
];

export function QuickServices() {
  return (
    <section
      aria-labelledby="quick-services-heading"
      className="bg-white py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <p className="eyebrow text-resin">Services</p>
        <h2
          id="quick-services-heading"
          className="mt-3 font-display text-[clamp(1.75rem,3vw,2.5rem)] text-bark"
        >
          What you can do here
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-moss">
          Common tasks for citizens, researchers and field partners.
        </p>

        <Stagger className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6" gap={0.08}>
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <StaggerItem key={service.href}>
                <Link
                  href={service.href}
                  className="group flex h-full flex-col rounded-[12px] border border-mist bg-paper p-5 transition-[transform,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-deodar md:p-6"
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
    </section>
  );
}
