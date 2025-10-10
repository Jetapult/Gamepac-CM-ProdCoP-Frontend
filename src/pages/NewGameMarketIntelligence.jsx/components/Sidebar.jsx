import {
  Bookmark,
  Calendar,
  PieChartIcon as ChartPieIcon,
  Home,
  LineChart,
  PanelsTopLeft,
  Save,
  Search,
  Settings,
  Sparkles,
} from "lucide-react"

export function AppSidebar() {
  return (
    <div className="fixed h-screen w-60 flex flex-col border-r bg-white z-20">
      {/* Sidebar Header - now fixed in place */}
      <div className="flex-shrink-0 flex flex-col items-start px-4 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Game Insights AI</h1>
        </div>
      </div>
      
      {/* Separator */}
      <div className="mx-4 h-px bg-border" />
      
      {/* Sidebar Content - scrollable area only */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
        {/* Navigation Group */}
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-tight text-foreground/70">Navigation</h2>
          <div className="space-y-1">
            <nav className="grid gap-1">
              <a 
                href="#" 
                className="flex items-center gap-3 rounded-md bg-accent px-4 py-2 text-accent-foreground font-medium"
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </a>
              <a 
                href="#" 
                className="flex items-center gap-3 rounded-md px-4 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Search className="h-4 w-4" />
                <span>Game Finder</span>
              </a>
              <a 
                href="#" 
                className="flex items-center gap-3 rounded-md px-4 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <LineChart className="h-4 w-4" />
                <span>Trends</span>
              </a>
              <a 
                href="#" 
                className="flex items-center gap-3 rounded-md px-4 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <PanelsTopLeft className="h-4 w-4" />
                <span>Teardowns</span>
              </a>
              <a 
                href="#" 
                className="flex items-center gap-3 rounded-md px-4 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <ChartPieIcon className="h-4 w-4" />
                <span>Benchmarks</span>
              </a>
            </nav>
          </div>
        </div>
        
        {/* Separator */}
        <div className="mx-4 h-px bg-border my-2" />
        
        {/* Saved Group */}
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-tight text-foreground/70">Saved</h2>
          <div className="space-y-1">
            <nav className="grid gap-1">
              <a 
                href="#" 
                className="flex items-center gap-3 rounded-md px-4 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Save className="h-4 w-4" />
                <span>Saved Prompts</span>
              </a>
              <a 
                href="#" 
                className="flex items-center gap-3 rounded-md px-4 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Bookmark className="h-4 w-4" />
                <span>Bookmarked Games</span>
              </a>
              <a 
                href="#" 
                className="flex items-center gap-3 rounded-md px-4 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Calendar className="h-4 w-4" />
                <span>Recent Reports</span>
              </a>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Sidebar Footer - now fixed at bottom */}
      <div className="flex-shrink-0 p-4 border-t">
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <div className="relative h-9 w-9 overflow-hidden rounded-full">
            <img 
              src="/placeholder.svg?height=36&width=36" 
              alt="User avatar" 
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-sm font-medium uppercase text-gray-800 dark:text-gray-200">
              PM
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm font-medium">Product Manager</span>
            <span className="text-xs text-muted-foreground">Game Studio Inc.</span>
          </div>
          
          <button className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
