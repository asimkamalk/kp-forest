export default function OrganogramLoading() {
  return (
    <main className="flex-1 bg-paper py-12 md:py-20" aria-busy="true" aria-label="Loading">
      <div className="mx-auto max-w-[1200px] space-y-6 px-6">
        <div className="h-4 w-40 animate-pulse rounded bg-mist" />
        <div className="h-10 w-56 animate-pulse rounded bg-mist" />
        <div className="h-24 max-w-md animate-pulse rounded-[12px] bg-mist" />
        <div className="space-y-3 pl-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-[12px] bg-mist" />
          ))}
        </div>
      </div>
    </main>
  );
}
