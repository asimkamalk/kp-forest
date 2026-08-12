export default function EmergencyContactsLoading() {
  return (
    <main className="flex-1 bg-paper" aria-busy="true" aria-label="Loading">
      <div className="h-28 animate-pulse bg-mist md:h-32" />
      <div className="mx-auto max-w-[1200px] space-y-6 px-6 py-12">
        <div className="h-4 w-40 animate-pulse rounded bg-mist" />
        <div className="h-10 w-72 animate-pulse rounded bg-mist" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-[12px] bg-mist" />
          ))}
        </div>
      </div>
    </main>
  );
}
