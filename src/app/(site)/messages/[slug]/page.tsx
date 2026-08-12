import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import {
  getMessageBySlug,
  getMessages,
  getPublishedMessageSlugs,
} from "@/lib/data/site";

type Props = {
  params: Promise<{ slug: string }>;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function MessageBody({ body }: { body: string }) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div
      className="prose prose-lg mt-10 max-w-none prose-headings:font-display prose-headings:text-bark prose-p:font-sans prose-p:leading-relaxed prose-p:text-bark/90 prose-a:text-deodar prose-strong:text-bark prose-blockquote:border-resin prose-blockquote:font-display prose-blockquote:text-bark"
    >
      {paragraphs.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </div>
  );
}

export async function generateStaticParams() {
  const rows = await getPublishedMessageSlugs();
  return rows.map((row) => ({ slug: row.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const message = await getMessageBySlug(slug);
  if (!message) {
    return { title: "Message not found" };
  }

  return {
    title: `${message.personName} | Messages`,
    description: message.excerpt ?? undefined,
    openGraph: {
      title: message.personName,
      description: message.excerpt ?? undefined,
      images: message.photoUrl ? [{ url: message.photoUrl }] : undefined,
    },
  };
}

export default async function MessageDetailPage({ params }: Props) {
  const { slug } = await params;
  const message = await getMessageBySlug(slug);
  if (!message) notFound();

  const others = (await getMessages()).filter((m) => m.slug !== message.slug);

  return (
    <main className="flex-1 bg-paper py-12 md:py-20">
      <article className="mx-auto max-w-[1200px] px-6">
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
                <Link href="/messages" className="transition-colors hover:text-deodar">
                  Messages
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="font-medium text-bark">{message.personName}</li>
            </ol>
          </nav>
        </Reveal>

        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-14">
          <Reveal>
            <div
              className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-xl bg-deodar lg:mx-0"
              style={{ boxShadow: "inset 0 0 0 1px var(--color-mist)" }}
            >
              {message.photoUrl ? (
                <Image
                  src={message.photoUrl}
                  alt={message.personName}
                  fill
                  priority
                  sizes="(max-width: 1024px) 80vw, 320px"
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center font-display text-6xl text-paper">
                  {initials(message.personName)}
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="eyebrow text-resin">{message.designation}</p>
            <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] text-bark">
              {message.personName}
            </h1>
            {message.excerpt && (
              <p className="mt-4 font-display text-xl leading-snug text-bark/80 md:text-2xl">
                {message.excerpt}
              </p>
            )}
            <MessageBody body={message.body} />

            {message.signatureUrl && (
              <div className="mt-10 max-w-xs">
                <Image
                  src={message.signatureUrl}
                  alt={`Signature of ${message.personName}`}
                  width={320}
                  height={120}
                  className="h-auto w-full object-contain object-left"
                />
              </div>
            )}
          </Reveal>
        </div>

        {others.length > 0 && (
          <section aria-labelledby="more-messages" className="mt-20 border-t border-mist pt-12">
            <Reveal>
              <h2 id="more-messages" className="font-display text-2xl text-bark">
                More messages
              </h2>
            </Reveal>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {others.map((item, i) => (
                <li key={item.id}>
                  <Reveal delay={i * 0.08}>
                    <Link
                      href={`/messages/${item.slug}`}
                      className="group flex items-center gap-4 rounded-[12px] border border-mist bg-paper p-4 shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
                    >
                      <div
                        className="relative h-16 w-14 shrink-0 overflow-hidden rounded-[8px] bg-deodar"
                        style={{ boxShadow: "inset 0 0 0 1px var(--color-mist)" }}
                      >
                        {item.photoUrl ? (
                          <Image
                            src={item.photoUrl}
                            alt={item.personName}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-sm font-display text-paper">
                            {initials(item.personName)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="eyebrow text-[10px] text-resin">{item.designation}</p>
                        <p className="mt-1 truncate font-medium text-bark">{item.personName}</p>
                      </div>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-deodar transition-transform duration-300 group-hover:translate-x-1"
                        aria-hidden
                      />
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </main>
  );
}
