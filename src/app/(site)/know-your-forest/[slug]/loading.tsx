export default function KnowYourForestDetailLoading() {
  return (
    <main className="flex-1 bg-paper py-12 md:py-20" aria-busy="true" aria-label="Loading">
      <div className="mx-auto max-w-[800px] space-y-6 px-6">
        <div className="h-4 w-56 animate-pulse rounded bg-mist" />
        <div className="h-10 w-full max-w-md animate-pulse rounded bg-mist" />
        <div className="aspect-[16/9] animate-pulse rounded-[12px] bg-mist" />
        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-mist" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-mist" />
          <div className="h-4 w-4/6 animate-pulse rounded bg-mist" />
        </div>
      </div>
    </main>
  );
}
