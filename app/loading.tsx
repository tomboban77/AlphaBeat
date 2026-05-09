export default function RootLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-10 w-1/2 animate-pulse rounded-md bg-ink-800" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-44 animate-pulse rounded-2xl border border-ink-700 bg-ink-800/60"
          />
        ))}
      </div>
    </div>
  );
}
