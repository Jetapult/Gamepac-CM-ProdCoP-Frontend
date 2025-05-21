import { Home, Lightbulb, FileText, Share2, Settings, User, Workflow } from "lucide-react"

export function AppSidebar() {
  const getPathname = () => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '';
  };

  const isActive = (path) => {
    const pathname = getPathname();
    
    if (path === "/gdd") {
      return pathname === "/gdd" || pathname === "/gdd/";
    }
    
    return pathname.includes(path);
  }

  return (
    <nav className="fixed top-[50px] left-0 h-screen w-64 border-r bg-white flex flex-col shadow-sm z-10">
      <div className="flex items-center justify-between p-4 border-b">
        <a href="/" className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <span className="font-bold text-xl">GDD Assistant</span>
        </a>
      </div>
      <div className="flex-1 overflow-auto py-2 px-2">
        <div className="mb-4">
          <div>
            <ul className="space-y-1">
              <li>
                <a 
                  href="/gdd" 
                  className={`flex items-center gap-3 px-3 py-2 rounded-md ${isActive("/gdd") ? "bg-gray-100" : "hover:bg-gray-100"}`}
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </a>
              </li>

              <li>
                <a 
                  href="/gdd/concept-generator" 
                  className={`flex items-center gap-3 px-3 py-2 rounded-md ${isActive("/gdd/concept-generator") ? "bg-gray-100" : "hover:bg-gray-100"}`}
                >
                  <Lightbulb className="h-4 w-4" />
                  <span>Concept Generator</span>
                </a>
              </li>

              <li>
                <a 
                  href="/gdd-editor" 
                  className={`flex items-center gap-3 px-3 py-2 rounded-md ${isActive("/gdd-editor") ? "bg-gray-100" : "hover:bg-gray-100"}`}
                >
                  <FileText className="h-4 w-4" />
                  <span>GDD Editor</span>
                </a>
              </li>

              <li>
                <a 
                  href="/gdd/translator" 
                  className={`flex items-center gap-3 px-3 py-2 rounded-md ${isActive("/translator") ? "bg-gray-100" : "hover:bg-gray-100"}`}
                >
                  <Workflow className="h-4 w-4" />
                  <span>Design Translator</span>
                </a>
              </li>

              <li>
                <a 
                  href="/gdd/collaboration" 
                  className={`flex items-center gap-3 px-3 py-2 rounded-md ${isActive("/collaboration") ? "bg-gray-100" : "hover:bg-gray-100"}`}
                >
                  <Share2 className="h-4 w-4" />
                  <span>Collaboration</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mb-4">
          <div className="px-3 mb-2 text-sm font-medium text-muted-foreground">Recent Projects</div>
          <div>
            <ul className="space-y-1">
              <li>
                <a 
                  href="/gdd/project-1" 
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  <FileText className="h-4 w-4" />
                  <span>Space Explorer RPG</span>
                </a>
              </li>
              <li>
                <a 
                  href="/gdd/project-2" 
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  <FileText className="h-4 w-4" />
                  <span>Puzzle Adventure</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}
