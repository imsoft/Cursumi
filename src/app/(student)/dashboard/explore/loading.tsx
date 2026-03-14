export default function ExploreLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-muted" />
        <div className="h-4 w-64 rounded bg-muted" />
      </div>

      {/* Filter bar */}
      <div className="h-24 rounded-2xl border border-border bg-card" />

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden">
            <div className="h-48 bg-muted" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-3/4 rounded bg-muted" />
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
