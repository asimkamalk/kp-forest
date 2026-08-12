import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { getMessages } from "@/lib/data/site";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function MessagesIndexPage() {
  const messages = await getMessages();

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
              <li className="font-medium text-bark">Messages</li>
            </ol>
          </nav>
          <p className="eyebrow mt-8 text-resin">Messages</p>
          <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] text-bark">
            Leadership messages
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-moss">
            Read the full statements from the Chief Minister and the Secretary for Climate Change.
          </p>
        </Reveal>

        {messages.length === 0 ? (
          <p className="mt-12 text-sm text-moss">
            No messages yet. New messages appear here as they are published.
          </p>
        ) : (
          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2" gap={0.1}>
            {messages.map((message) => (
              <StaggerItem key={message.id}>
                <Link
                  href={`/messages/${message.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[12px] border border-mist bg-paper shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-card-hover)]"
                >
                  <div
                    className="relative aspect-[4/5] w-full bg-deodar sm:aspect-[5/4]"
                    style={{ boxShadow: "inset 0 0 0 1px var(--color-mist)" }}
                  >
                    {message.photoUrl ? (
                      <Image
                        src={message.photoUrl}
                        alt={message.personName}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center font-display text-4xl text-paper">
                        {initials(message.personName)}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="eyebrow text-resin">{message.designation}</p>
                    <h2 className="mt-2 font-display text-xl text-bark md:text-2xl">
                      {message.personName}
                    </h2>
                    {message.excerpt && (
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-moss">
                        {message.excerpt}
                      </p>
                    )}
                    <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-medium text-deodar">
                      Read the full message
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                        aria-hidden
                      />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </main>
  );
}
