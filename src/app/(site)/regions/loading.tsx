export default function RegionsLoading() {
  return (
    <main className="flex-1" aria-busy="true" aria-label="Loading regions">
      <div className="bg-bark px-6 py-16 md:py-20">
        <div className="mx-auto max-w-[1200px] space-y-4">
          <div className="h-4 w-40 animate-pulse rounded bg-deodar" />
          <div className="h-10 w-72 animate-pulse rounded bg-deodar" />
          <div className="h-4 w-96 max-w-full animate-pulse rounded bg-deodar" />
        </div>
      </div>
      <div className="mx-auto grid max-w-[1200px] gap-6 px-6 py-16 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="overflow-hidden rounded-[12px] border border-mist">
            <div className="aspect-[16/10] animate-pulse bg-mist" />
            <div className="space-y-3 p-5">
              <div className="h-6 w-3/4 animate-pulse rounded bg-mist" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-mist" />
              <div className="h-16 w-full animate-pulse rounded bg-mist" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
