export default function NewsLoading() {
  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2" aria-busy="true">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-40 animate-pulse rounded-[12px] bg-mist" />
      ))}
    </div>
  );
}
