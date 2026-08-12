export default function ContactLoading() {
  return (
    <main className="flex-1 bg-paper py-16 md:py-24" aria-busy="true" aria-label="Loading">
      <div className="mx-auto max-w-[1200px] space-y-6 px-6">
        <div className="h-4 w-40 animate-pulse rounded bg-mist" />
        <div className="h-10 w-64 animate-pulse rounded bg-mist" />
        <div className="h-4 w-full max-w-lg animate-pulse rounded bg-mist" />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="h-48 animate-pulse rounded-[12px] bg-mist" />
          <div className="aspect-[4/3] animate-pulse rounded-[12px] bg-mist" />
        </div>
      </div>
    </main>
  );
}
