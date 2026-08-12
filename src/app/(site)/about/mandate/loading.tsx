export default function MandateLoading() {
  return (
    <main className="flex-1 bg-paper py-12 md:py-20" aria-busy="true" aria-label="Loading">
      <div className="mx-auto max-w-[800px] space-y-6 px-6">
        <div className="h-4 w-48 animate-pulse rounded bg-mist" />
        <div className="h-10 w-72 animate-pulse rounded bg-mist" />
        <div className="aspect-[16/9] animate-pulse rounded-[12px] bg-mist" />
        <div className="h-4 w-full animate-pulse rounded bg-mist" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-mist" />
      </div>
    </main>
  );
}
