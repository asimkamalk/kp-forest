import Link from "next/link";
import type { ReactNode } from "react";

const RECOVERY_LINKS = [
  { href: "/", label: "Home" },
  { href: "/regions", label: "Regions" },
  { href: "/contact", label: "Contact" },
] as const;

type Props = {
  eyebrow: string;
  title: string;
  body: string;
  /** Optional primary action (e.g. Try again). */
  action?: ReactNode;
};

export function StatusPageContent({ eyebrow, title, body, action }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="eyebrow text-resin">{eyebrow}</p>
      <h1 className="mt-4 font-display text-[clamp(2.75rem,6vw,4.5rem)] tracking-[-0.02em] leading-[1.02] text-bark">
        {title}
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-moss">{body}</p>
      {action && <div className="mt-8">{action}</div>}
      <nav aria-label="Helpful links" className={action ? "mt-6" : "mt-10"}>
        <ul className="flex flex-wrap items-center justify-center gap-3">
          {RECOVERY_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex h-11 items-center justify-center rounded-[8px] border border-mist bg-paper px-5 text-sm font-medium text-bark transition-colors hover:border-deodar hover:bg-mist/40"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
