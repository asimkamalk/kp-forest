export default function KnowYourForestLoading() {
  return (
    <main className="flex-1 bg-paper py-16 md:py-24" aria-busy="true" aria-label="Loading">
      <div className="mx-auto max-w-[1200px] space-y-6 px-6">
        <div className="h-4 w-40 animate-pulse rounded bg-mist" />
        <div className="h-10 w-72 animate-pulse rounded bg-mist" />
        <div className="h-4 w-full max-w-lg animate-pulse rounded bg-mist" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-[12px] bg-mist" />
          ))}
        </div>
      </div>
    </main>
  );
}
