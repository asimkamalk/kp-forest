export default function DownloadsLoading() {
  return (
    <div className="mt-8 space-y-8" aria-busy="true" aria-label="Loading downloads">
      <div className="h-11 w-full max-w-md animate-pulse rounded-[8px] bg-mist" />
      <div className="space-y-4">
        <div className="h-6 w-20 animate-pulse rounded bg-mist" />
        <div className="space-y-3 border-y border-mist py-4">
          <div className="h-5 w-3/4 max-w-lg animate-pulse rounded bg-mist" />
          <div className="h-3 w-40 animate-pulse rounded bg-mist" />
        </div>
        <div className="space-y-3 border-b border-mist py-4">
          <div className="h-5 w-2/3 max-w-md animate-pulse rounded bg-mist" />
          <div className="h-3 w-32 animate-pulse rounded bg-mist" />
        </div>
      </div>
    </div>
  );
}
