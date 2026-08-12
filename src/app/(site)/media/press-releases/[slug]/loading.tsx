export default function PressReleaseDetailLoading() {
  return (
    <div className="mx-auto max-w-[800px] space-y-6 px-6 py-12" aria-busy="true">
      <div className="h-4 w-48 animate-pulse rounded bg-mist" />
      <div className="h-10 w-3/4 animate-pulse rounded bg-mist" />
      <div className="aspect-[16/9] animate-pulse rounded-[12px] bg-mist" />
      <div className="h-4 w-full animate-pulse rounded bg-mist" />
      <div className="h-4 w-5/6 animate-pulse rounded bg-mist" />
    </div>
  );
}
