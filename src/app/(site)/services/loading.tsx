export default function ServicesLoading() {
  return (
    <main className="flex-1 bg-paper py-16 md:py-24" aria-busy="true" aria-label="Loading">
      <div className="mx-auto max-w-[1200px] space-y-6 px-6">
        <div className="h-4 w-32 animate-pulse rounded bg-mist" />
        <div className="h-10 w-64 animate-pulse rounded bg-mist" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-[12px] bg-mist" />
          ))}
        </div>
      </div>
    </main>
  );
}
