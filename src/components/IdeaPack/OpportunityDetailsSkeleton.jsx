export default function OpportunityDetailsSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      {/* Header skeleton */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="h-8 w-2/5 bg-[#3B3B3B] rounded mb-2" />
          <div className="h-4 w-1/5 bg-[#3B3B3B] rounded" />
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="h-8 w-28 bg-[#3B3B3B] rounded-2xl" />
          <div className="flex items-center gap-4">
            <div className="w-[220px] h-3 bg-[#3B3B3B] rounded-full" />
            <div className="h-4 w-10 bg-[#3B3B3B] rounded" />
          </div>
        </div>
      </div>

      {/* Main grid: Market chart and right column cards */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left: Market Snapshot */}
        <div className="col-span-6 bg-[#434343] rounded-[10px] p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 w-36 bg-[#3B3B3B] rounded" />
            <div className="h-6 w-24 bg-[#3B3B3B] rounded" />
          </div>

          <div className="flex gap-4 mb-4">
            <div className="h-6 w-28 bg-[#3B3B3B] rounded" />
            <div className="h-6 w-32 bg-[#3B3B3B] rounded" />
          </div>

          <div className="h-56 w-full bg-[#3B3B3B] rounded" />

          <div className="space-y-3 pt-8">
            <div className="h-4 w-2/3 bg-[#3B3B3B] rounded" />
            <div className="h-4 w-1/2 bg-[#3B3B3B] rounded" />
            <div className="h-4 w-1/2 bg-[#3B3B3B] rounded" />
          </div>
        </div>

        {/* Right: Fit Score + Top Games */}
        <div className="col-span-6 space-y-4">
          {/* Fit Score card */}
          <div className="bg-[#434343] rounded-[10px] p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 w-24 bg-[#3B3B3B] rounded" />
              <div className="h-5 w-5 rounded-full bg-[#3B3B3B]" />
            </div>
            <div className="flex gap-8">
              <div className="w-40 h-40 rounded-full bg-[#3B3B3B]" />
              <div className="flex-1 space-y-2 mt-2">
                <div className="h-4 w-3/5 bg-[#3B3B3B] rounded" />
                <div className="h-1 w-full bg-[#3B3B3B] rounded" />
                <div className="h-4 w-2/5 bg-[#3B3B3B] rounded" />
                <div className="h-1 w-11/12 bg-[#3B3B3B] rounded" />
                <div className="h-4 w-2/5 bg-[#3B3B3B] rounded" />
                <div className="h-1 w-10/12 bg-[#3B3B3B] rounded" />
                <div className="h-4 w-2/5 bg-[#3B3B3B] rounded" />
                <div className="h-1 w-9/12 bg-[#3B3B3B] rounded" />
              </div>
            </div>
          </div>

          {/* Top Games card */}
          <div className="bg-[#434343] rounded-[10px] p-6">
            <div className="h-6 w-28 bg-[#3B3B3B] rounded mb-4" />
            <div className="grid grid-cols-3 gap-4 mt-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center flex-col w-full min-w-0"
                >
                  <div className="rounded-[14px] overflow-hidden border border-transparent bg-[#3B3B3B] w-[70px] h-[70px]" />
                  <div className="h-3 w-20 bg-[#3B3B3B] rounded mt-2" />
                  <div className="h-3 w-16 bg-[#3B3B3B] rounded mt-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="py-6 pl-2 col-span-12">
        <div className="h-5 w-20 bg-[#3B3B3B] rounded mb-4 ml-6" />
        <div className="grid grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, colIdx) => (
            <div key={colIdx} className="space-y-3">
              {Array.from({ length: 5 }).map((__, i) => (
                <div key={i} className="h-3 bg-[#3B3B3B] rounded w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
