export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">

      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-6 w-24 rounded-lg bg-zinc-800" />
          <div className="h-3 w-16 rounded bg-zinc-800/60" />
        </div>
        <div className="h-9 w-36 rounded-lg bg-zinc-800" />
      </div>

      {/* Filter tabs skeleton */}
      <div className="flex items-center gap-1 border-b border-[#1f1f23] pb-0">
        {[56, 80, 72, 48].map((w, i) => (
          <div
            key={i}
            className="h-9 rounded-t-lg bg-zinc-800/50"
            style={{ width: w }}
          />
        ))}
      </div>

      {/* Review rows skeleton */}
      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3.5 rounded-[14px] border border-[#1f1f23] bg-gradient-to-b from-zinc-900 to-zinc-950"
          >
            {/* Status dot */}
            <div className="w-2 h-2 rounded-full bg-zinc-700 shrink-0" />

            {/* Content */}
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-3 w-48 rounded bg-zinc-800" />
              <div className="h-3.5 w-72 rounded bg-zinc-700" />
              <div className="h-3 w-24 rounded bg-zinc-800/60" />
            </div>

            {/* Right pills */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-5 w-16 rounded-full bg-zinc-800" />
              <div className="h-4 w-4 rounded bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
