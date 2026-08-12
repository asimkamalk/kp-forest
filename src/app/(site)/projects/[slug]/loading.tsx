export default function ProjectDetailLoading() {
  return (
    <main className="flex-1 bg-paper py-12 md:py-20" aria-busy="true" aria-label="Loading project">
      <div className="mx-auto max-w-[1200px] space-y-6 px-6">
        <div className="h-4 w-48 animate-pulse rounded bg-mist" />
        <div className="aspect-[21/9] animate-pulse rounded-[12px] bg-mist" />
        <div className="h-10 w-2/3 max-w-xl animate-pulse rounded bg-mist" />
        <div className="h-4 w-full max-w-lg animate-pulse rounded bg-mist" />
      </div>
    </main>
  );
}
