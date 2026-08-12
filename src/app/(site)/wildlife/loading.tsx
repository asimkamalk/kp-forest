export default function WildlifeLoading() {
  return (
    <main className="flex-1 bg-paper py-16 md:py-24" aria-busy="true" aria-label="Loading">
      <div className="mx-auto max-w-[1200px] space-y-6 px-6">
        <div className="h-4 w-32 animate-pulse rounded bg-mist" />
        <div className="h-10 w-48 animate-pulse rounded bg-mist" />
        <div className="flex gap-2 pt-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-20 animate-pulse rounded-[8px] bg-mist" />
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-[12px] bg-mist" />
          ))}
        </div>
      </div>
    </main>
  );
}
