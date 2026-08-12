export default function ProjectsLoading() {
  return (
    <div className="mt-8 space-y-6" aria-busy="true" aria-label="Loading projects">
      <div className="flex gap-2">
        <div className="h-8 w-28 animate-pulse rounded-[8px] bg-mist" />
        <div className="h-8 w-36 animate-pulse rounded-[8px] bg-mist" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="aspect-[4/5] animate-pulse rounded-[12px] bg-mist" />
        ))}
      </div>
    </div>
  );
}
