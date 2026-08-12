export default function VideosLoading() {
  return (
    <div className="mt-10 grid gap-8 sm:grid-cols-2" aria-busy="true">
      {[0, 1].map((i) => (
        <div key={i} className="aspect-video animate-pulse rounded-[12px] bg-mist" />
      ))}
    </div>
  );
}
