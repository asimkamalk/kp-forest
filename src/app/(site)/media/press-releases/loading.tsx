export default function PressReleasesLoading() {
  return (
    <div className="mt-10 space-y-6" aria-busy="true" aria-label="Loading press releases">
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-2 border-b border-mist py-6">
          <div className="h-3 w-24 animate-pulse rounded bg-mist" />
          <div className="h-7 w-3/4 animate-pulse rounded bg-mist" />
          <div className="h-4 w-full animate-pulse rounded bg-mist" />
        </div>
      ))}
    </div>
  );
}
