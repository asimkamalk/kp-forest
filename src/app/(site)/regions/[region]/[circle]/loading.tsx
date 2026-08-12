export default function CircleLoading() {
  return (
    <main className="flex-1" aria-busy="true" aria-label="Loading circle">
      <div className="bg-bark px-6 py-14 md:py-20">
        <div className="mx-auto max-w-[1200px] space-y-4">
          <div className="h-4 w-80 max-w-full animate-pulse rounded bg-deodar" />
          <div className="h-12 w-96 max-w-full animate-pulse rounded bg-deodar" />
          <div className="h-4 w-56 animate-pulse rounded bg-deodar" />
        </div>
      </div>
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="mb-8 h-11 max-w-md animate-pulse rounded-[8px] bg-mist" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-3 rounded-[12px] border border-mist p-5">
              <div className="h-6 w-3/4 animate-pulse rounded bg-mist" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-mist" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-mist" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
