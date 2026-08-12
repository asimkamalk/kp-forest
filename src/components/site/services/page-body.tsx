/** Render plain page body as paragraph prose (no HTML). */
export function PageBody({ body, className }: { body: string; className?: string }) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return null;

  return (
    <div
      className={
        className ??
        "prose prose-neutral mt-4 max-w-none text-bark prose-p:leading-relaxed prose-headings:font-display"
      }
    >
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}
