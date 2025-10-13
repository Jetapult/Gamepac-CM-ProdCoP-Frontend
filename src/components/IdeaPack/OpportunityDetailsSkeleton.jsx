export default function OpportunityDetailsSkeleton() {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <div className="bg-[#3B3B3B] rounded-[10px] h-56 w-full" />
          </div>
          <div className="col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-[#3B3B3B] rounded" />
              <div className="h-8 w-24 bg-[#3B3B3B] rounded-2xl" />
            </div>
            <div className="flex items-center gap-6">
              <div className="w-40 h-40 rounded-full bg-[#3B3B3B]" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-[#3B3B3B] rounded" />
                <div className="h-4 bg-[#3B3B3B] rounded" />
                <div className="h-4 bg-[#3B3B3B] rounded w-2/3" />
              </div>
            </div>
            <div className="h-16 bg-[#3B3B3B] rounded-[10px]" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 mt-8">
          <div className="space-y-3">
            <div className="h-3 bg-[#3B3B3B] rounded" />
            <div className="h-3 bg-[#3B3B3B] rounded" />
            <div className="h-3 bg-[#3B3B3B] rounded w-11/12" />
            <div className="h-3 bg-[#3B3B3B] rounded w-10/12" />
            <div className="h-3 bg-[#3B3B3B] rounded w-9/12" />
          </div>
          <div className="space-y-3">
            <div className="h-3 bg-[#3B3B3B] rounded" />
            <div className="h-3 bg-[#3B3B3B] rounded" />
            <div className="h-3 bg-[#3B3B3B] rounded w-11/12" />
            <div className="h-3 bg-[#3B3B3B] rounded w-10/12" />
            <div className="h-3 bg-[#3B3B3B] rounded w-9/12" />
          </div>
        </div>
      </div>
    );
  }
  
  