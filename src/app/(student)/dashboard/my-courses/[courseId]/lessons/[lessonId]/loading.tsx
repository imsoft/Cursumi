export default function LessonLoading() {
  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)] animate-pulse">
      {/* Sidebar skeleton */}
      <aside className="hidden w-72 shrink-0 border-r border-border bg-card md:block">
        <div className="p-4 space-y-3 border-b border-border">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-2 rounded-full bg-muted" />
          <div className="h-3 w-20 rounded bg-muted" />
        </div>
        <div className="p-4 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-8 rounded-lg bg-muted" />
          ))}
        </div>
      </aside>

      {/* Main content skeleton */}
      <main className="flex-1 p-6 space-y-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-8 w-2/3 rounded-lg bg-muted" />
          </div>
          <div className="aspect-video rounded-xl bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
          </div>
        </div>
      </main>
    </div>
  );
}
