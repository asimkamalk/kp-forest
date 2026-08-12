"use server";

/**
 * Receives client boundary errors so they appear in server logs / process stdout.
 * Never throws — logging must not break the apology page.
 */
export async function logClientError(input: {
  message: string;
  digest?: string;
  stack?: string;
  source?: string;
}): Promise<{ ok: true }> {
  const line = [
    "[app-error]",
    input.source ?? "error.tsx",
    input.digest ? `digest=${input.digest}` : null,
    input.message,
  ]
    .filter(Boolean)
    .join(" ");

  console.error(line);
  if (input.stack) {
    console.error(input.stack);
  }

  return { ok: true };
}
