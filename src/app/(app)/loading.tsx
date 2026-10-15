export default function Loading() {
  return (
    <div role="status" className="animate-pulse space-y-4">
      <span className="sr-only">Loading</span>
      <div className="h-8 w-56 rounded-lg bg-slate-200" />
      <div className="h-4 w-80 rounded bg-slate-200" />
      <div className="grid gap-4 pt-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-28 rounded-2xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}