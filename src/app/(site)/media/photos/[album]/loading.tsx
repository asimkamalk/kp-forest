export default function AlbumDetailLoading() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-6 px-6 py-12" aria-busy="true">
      <div className="h-4 w-40 animate-pulse rounded bg-mist" />
      <div className="h-10 w-1/2 animate-pulse rounded bg-mist" />
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="mb-4 aspect-[4/3] animate-pulse rounded-[12px] bg-mist" />
        ))}
      </div>
    </div>
  );
}
