/** Render page body — HTML from the dashboard editor, or plain paragraphs. */
export function PageBody({ body, className }: { body: string; className?: string }) {
  const trimmed = body.trim();
  if (!trimmed) return null;

  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(trimmed);

  if (looksLikeHtml) {
    return (
      <div
        className={
          className ??
          "prose prose-neutral mt-4 max-w-none text-bark prose-p:leading-relaxed prose-headings:font-display"
        }
        dangerouslySetInnerHTML={{ __html: trimmed }}
      />
    );
  }

  const paragraphs = trimmed
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
