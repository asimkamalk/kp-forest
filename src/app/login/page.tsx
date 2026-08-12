import { LoginForm } from "@/components/dashboard/login-form";

type SearchParams = Promise<{ next?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const nextPath =
    params.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/dashboard";

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-md rounded-[12px] border border-mist bg-paper p-8 shadow-[var(--shadow-card)]">
        <p className="eyebrow">Dashboard access</p>
        <h1 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.25rem)] text-bark">
          Sign in
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-moss">
          Forest Department staff only. There is no public registration.
        </p>
        <LoginForm nextPath={nextPath} />
      </div>
    </main>
  );
}
