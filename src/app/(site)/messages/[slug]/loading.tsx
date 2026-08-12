export default function MessageLoading() {
  return (
    <main className="flex-1 bg-paper py-12 md:py-20" aria-busy="true" aria-label="Loading message">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="h-4 w-48 animate-pulse rounded bg-mist" />

        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-14">
          <div
            className="aspect-[4/5] w-full max-w-sm animate-pulse rounded-xl bg-mist"
            style={{ boxShadow: "inset 0 0 0 1px var(--color-mist)" }}
          />

          <div className="space-y-4">
            <div className="h-3 w-40 animate-pulse rounded bg-mist" />
            <div className="h-10 w-3/4 max-w-md animate-pulse rounded bg-mist" />
            <div className="h-6 w-full max-w-lg animate-pulse rounded bg-mist" />
            <div className="mt-8 space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-mist" />
              <div className="h-4 w-full animate-pulse rounded bg-mist" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-mist" />
              <div className="h-4 w-full animate-pulse rounded bg-mist" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-mist" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
