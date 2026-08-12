export default function RegionLoading() {
  return (
    <main className="flex-1" aria-busy="true" aria-label="Loading region">
      <div className="bg-bark px-6 py-14 md:py-20">
        <div className="mx-auto max-w-[1200px] space-y-4">
          <div className="h-4 w-64 animate-pulse rounded bg-deodar" />
          <div className="h-12 w-80 max-w-full animate-pulse rounded bg-deodar" />
          <div className="h-4 w-48 animate-pulse rounded bg-deodar" />
          <div className="mt-8 h-64 w-full animate-pulse rounded-[12px] bg-deodar md:h-80" />
        </div>
      </div>
      <div className="mx-auto grid max-w-[1200px] gap-5 px-6 py-16 md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-3 rounded-[12px] border border-mist p-5">
            <div className="h-6 w-2/3 animate-pulse rounded bg-mist" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-mist" />
            <div className="flex gap-2">
              <div className="h-6 w-20 animate-pulse rounded bg-mist" />
              <div className="h-6 w-20 animate-pulse rounded bg-mist" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
