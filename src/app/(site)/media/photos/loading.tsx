export default function PhotosLoading() {
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="aspect-[4/3] animate-pulse rounded-[12px] bg-mist" />
      ))}
    </div>
  );
}
