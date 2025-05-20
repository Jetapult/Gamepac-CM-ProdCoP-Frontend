import React from "react"
import { useState } from "react"
import { Download, Filter, PanelLeft } from "lucide-react"
import { AppSidebar } from "./Sidebar"

export function DashboardShell({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [filters, setFilters] = useState({
    genre: true,
    region: true,
    platform: true,
    dateRange: true,
  })

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'}`}>
        <AppSidebar />
      </div>

      {/* Main Content - Add conditional left padding based on sidebar state */}
      <div className={`flex-1 flex flex-col ${isSidebarOpen ? 'ml-60' : 'ml-0'} transition-all duration-300`}>
        <div className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-6">
            {/* Sidebar Trigger Button */}
            <button 
              onClick={toggleSidebar}
              className="inline-flex items-center justify-center h-10 w-10 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle Sidebar</span>
            </button>

            <div className="ml-auto flex items-center gap-2">
              {/* Filters Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="inline-flex items-center justify-center h-9 px-4 py-2 text-sm font-medium border rounded-md text-gray-700 bg-white border-gray-200 hover:bg-gray-50"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg z-10">
                    <div className="py-1">
                      <label className="flex items-center px-3 py-2 text-sm">
                        <input
                          type="checkbox"
                          className="mr-2 h-4 w-4 rounded border-gray-300"
                          checked={filters.genre}
                          onChange={(e) => setFilters({ ...filters, genre: e.target.checked })}
                        />
                        Genre
                      </label>
                      <label className="flex items-center px-3 py-2 text-sm">
                        <input
                          type="checkbox"
                          className="mr-2 h-4 w-4 rounded border-gray-300"
                          checked={filters.region}
                          onChange={(e) => setFilters({ ...filters, region: e.target.checked })}
                        />
                        Region
                      </label>
                      <label className="flex items-center px-3 py-2 text-sm">
                        <input
                          type="checkbox"
                          className="mr-2 h-4 w-4 rounded border-gray-300"
                          checked={filters.platform}
                          onChange={(e) => setFilters({ ...filters, platform: e.target.checked })}
                        />
                        Platform
                      </label>
                      <label className="flex items-center px-3 py-2 text-sm">
                        <input
                          type="checkbox"
                          className="mr-2 h-4 w-4 rounded border-gray-300"
                          checked={filters.dateRange}
                          onChange={(e) => setFilters({ ...filters, dateRange: e.target.checked })}
                        />
                        Date Range
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Export Button */}
              <button className="inline-flex items-center justify-center h-9 px-4 py-2 text-sm font-medium border rounded-md text-gray-700 bg-white border-gray-200 hover:bg-gray-50">
                <Download className="mr-2 h-4 w-4" />
                Export
              </button>
            </div>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
