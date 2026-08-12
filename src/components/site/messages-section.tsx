import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { getMessages } from "@/lib/data/site";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function Portrait({
  name,
  photoUrl,
  priority = false,
}: {
  name: string;
  photoUrl: string | null;
  priority?: boolean;
}) {
  return (
    <div
      className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-deodar"
      style={{ boxShadow: "inset 0 0 0 1px var(--color-mist)" }}
    >
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 40vw"
          className="object-cover"
          priority={priority}
        />
      ) : (
        <div
          className="grid h-full w-full place-items-center font-display text-5xl text-paper md:text-6xl"
          aria-hidden
        >
          {initials(name)}
        </div>
      )}
    </div>
  );
}

export async function MessagesSection() {
  const messages = await getMessages();
  if (messages.length === 0) return null;

  return (
    <section aria-labelledby="messages-heading" className="bg-paper py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <Reveal>
          <p className="eyebrow text-resin">Messages</p>
          <h2
            id="messages-heading"
            className="mt-3 font-display text-[clamp(1.75rem,3vw,2.5rem)] text-bark"
          >
            Leadership messages
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-moss">
            Words from the province&apos;s leadership on forests, climate and the work ahead.
          </p>
        </Reveal>

        <div className="mt-12 space-y-16 md:mt-16 md:space-y-24">
          {messages.map((message, index) => {
            const portraitFirst = index % 2 === 0;
            const href = `/messages/${message.slug}`;

            return (
              <Reveal key={message.id} direction="up" delay={index * 0.12}>
                <article className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
                  <div className={portraitFirst ? "md:order-1" : "md:order-2"}>
                    <Portrait
                      name={message.personName}
                      photoUrl={message.photoUrl}
                      priority={index === 0}
                    />
                  </div>

                  <div className={portraitFirst ? "md:order-2" : "md:order-1"}>
                    <p className="eyebrow text-resin">{message.designation}</p>
                    <h3 className="mt-3 font-display text-[clamp(1.5rem,2.5vw,2rem)] text-bark">
                      {message.personName}
                    </h3>
                    {message.excerpt && (
                      <blockquote className="relative mt-6 pl-2 font-display text-xl leading-snug text-bark/90 md:text-2xl">
                        <span
                          className="absolute -left-1 -top-4 font-display text-5xl leading-none text-resin/40 select-none"
                          aria-hidden
                        >
                          “
                        </span>
                        {message.excerpt}
                      </blockquote>
                    )}
                    <Link
                      href={href}
                      className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-deodar transition-colors hover:text-bark"
                    >
                      Read the full message
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
                        aria-hidden
                      />
                    </Link>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
