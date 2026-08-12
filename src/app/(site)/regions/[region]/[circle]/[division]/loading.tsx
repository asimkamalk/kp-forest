export default function DivisionLoading() {
  return (
    <main className="flex-1" aria-busy="true" aria-label="Loading division">
      <div className="bg-bark px-6 py-14 md:py-20">
        <div className="mx-auto max-w-[1200px] space-y-4">
          <div className="h-4 w-full max-w-xl animate-pulse rounded bg-deodar" />
          <div className="h-12 w-80 max-w-full animate-pulse rounded bg-deodar" />
          <div className="h-4 w-48 animate-pulse rounded bg-deodar" />
          <div className="h-4 w-64 animate-pulse rounded bg-deodar" />
        </div>
      </div>
      <div className="mx-auto max-w-[1200px] space-y-3 px-6 py-16">
        <div className="h-3 w-28 animate-pulse rounded bg-mist" />
        <div className="h-8 w-64 animate-pulse rounded bg-mist" />
        <div className="h-16 w-full max-w-xl animate-pulse rounded bg-mist" />
      </div>
    </main>
  );
}
