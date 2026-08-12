export default function ResearchRequestLoading() {
  return (
    <main className="flex-1 bg-paper py-16 md:py-24" aria-busy="true" aria-label="Loading">
      <div className="mx-auto max-w-[720px] space-y-6 px-6">
        <div className="h-4 w-40 animate-pulse rounded bg-mist" />
        <div className="h-10 w-72 animate-pulse rounded bg-mist" />
        <div className="h-4 w-full max-w-lg animate-pulse rounded bg-mist" />
        <div className="space-y-4 pt-6">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-[8px] bg-mist" />
          ))}
        </div>
      </div>
    </main>
  );
}
