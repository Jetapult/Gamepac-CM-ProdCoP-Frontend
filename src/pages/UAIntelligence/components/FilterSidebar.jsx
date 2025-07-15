import { useState, useEffect } from "react"
import "../ua-intelligence.css"

export default function FilterSidebar({ onFiltersChange, availableNetworks, availableAdTypes }) {
  const [isOpen, setIsOpen] = useState(false)
  const [openAccordions, setOpenAccordions] = useState(["basic", "content", "timeline"])
  
  const [filters, setFilters] = useState({
    search: "",
    latest_batch: true,
    network: [],
    ad_type: [],
    startDate: "",
    endDate: "",
    minDuration: "",
    maxDuration: "",
    limit: 20,
    sortBy: "first_seen_at",
    sortOrder: "DESC"
  })

  const [searchInput, setSearchInput] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prevFilters => {
        if (prevFilters.search !== searchInput) {
          const newFilters = {
            ...prevFilters,
            search: searchInput
          }
          if (onFiltersChange) {
            onFiltersChange(newFilters)
          }
          return newFilters
        }
        return prevFilters
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [searchInput])

  const toggleAccordion = (id) => {
    setOpenAccordions(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    )
  }

  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value
    }
    setFilters(newFilters)
    if (onFiltersChange) {
      onFiltersChange(newFilters)
    }
  }

  const handleSearchChange = (value) => {
    setSearchInput(value);
  }

  const handleArrayFilterChange = (key, value, isChecked) => {
    const newFilters = {
      ...filters,
      [key]: isChecked 
        ? [...filters[key], value]
        : filters[key].filter(item => item !== value)
    }
    setFilters(newFilters)
    if (onFiltersChange) {
      onFiltersChange(newFilters)
    }
  }

  const resetFilters = () => {
    const defaultFilters = {
      search: "",
      latest_batch: true,
      network: [],
      ad_type: [],
      startDate: "",
      endDate: "",
      minDuration: "",
      maxDuration: "",
      limit: 20,
      sortBy: "first_seen_at",
      sortOrder: "DESC"
    }
    setFilters(defaultFilters)
    setSearchInput("");
    if (onFiltersChange) {
      onFiltersChange(defaultFilters)
    }
  }

  const applyFilters = () => {
    if (onFiltersChange) {
      onFiltersChange(filters)
    }
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (searchInput) count++
    if (filters.network.length > 0) count++
    if (filters.ad_type.length > 0) count++
    if (filters.startDate) count++
    if (filters.endDate) count++
    if (filters.minDuration) count++
    if (filters.maxDuration) count++
    if (!filters.latest_batch) count++
    return count
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsOpen(false)} />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 transform bg-white shadow-lg transition-transform duration-200 md:static md:z-0 md:translate-x-0 md:shadow-none md:overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Filters</h2>
            <button 
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 md:hidden" 
              onClick={() => setIsOpen(false)}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          </div>

          <hr className="my-2 border-t border-gray-200" />      

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{getActiveFiltersCount()} filters applied</span>
            <button 
              className="inline-flex h-8 items-center rounded-md px-2 text-xs text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              onClick={resetFilters}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="mr-1 h-3 w-3"
              >
                <path d="M23 4v6h-6"></path>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              Reset
            </button>
          </div>

          <hr className="my-2 border-t border-gray-200" />

          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search ads by title, message, or keywords..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 pl-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="M21 21l-4.35-4.35"></path>
              </svg>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6">
              <div className="border-b border-gray-200">
                <button 
                  className="flex w-full items-center justify-between py-2 text-left font-medium" 
                  onClick={() => toggleAccordion("basic")}
                >
                  Basic Filters
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className={`h-4 w-4 transition-transform ${openAccordions.includes("basic") ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                
                {openAccordions.includes("basic") && (
                  <div className="pb-4 pt-2">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Network</label>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                        <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id="network-all" 
                              checked={filters.network.length === 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleFilterChange('network', [])
                                }
                              }}
                              className="green-checkbox" 
                            />
                            <label htmlFor="network-all" className="text-sm">All Networks</label>
                          </div>
                          {availableNetworks?.map(network => (
                            <div key={network} className="flex items-center space-x-2">
                              <input 
                                type="checkbox" 
                                id={`network-${network}`} 
                                value={network}
                                checked={filters.network.includes(network)}
                                onChange={(e) => handleArrayFilterChange('network', e.target.value, e.target.checked)}
                                className="green-checkbox" 
                              />
                              <label htmlFor={`network-${network}`} className="text-sm">{network}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Ad Type</label>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                        <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id="adtype-all" 
                              checked={filters.ad_type.length === 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleFilterChange('ad_type', [])
                                }
                              }}
                              className="green-checkbox" 
                            />
                            <label htmlFor="adtype-all" className="text-sm">All Types</label>
                          </div>
                          {availableAdTypes?.map(adType => (
                            <div key={adType} className="flex items-center space-x-2">
                              <input 
                                type="checkbox" 
                                id={`adtype-${adType}`} 
                                value={adType}
                                checked={filters.ad_type.includes(adType)}
                                onChange={(e) => handleArrayFilterChange('ad_type', e.target.value, e.target.checked)}
                                className="green-checkbox" 
                              />
                              <label htmlFor={`adtype-${adType}`} className="text-sm capitalize">{adType}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="latest_batch" 
                            checked={filters.latest_batch}
                            onChange={(e) => handleFilterChange('latest_batch', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 green-checkbox" 
                          />
                          <label htmlFor="latest_batch" className="text-sm">Latest batch only</label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-b border-gray-200">
                <button 
                  className="flex w-full items-center justify-between py-2 text-left font-medium" 
                  onClick={() => toggleAccordion("content")}
                >
                  Content Filters
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className={`h-4 w-4 transition-transform ${openAccordions.includes("content") ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                
                {openAccordions.includes("content") && (
                  <div className="pb-4 pt-2">
                    <div className="space-y-4">
                      {/* <div className="space-y-2">
                        <label className="text-sm font-medium">Video Duration (seconds)</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder="Min"
                            value={filters.minDuration}
                            onChange={(e) => handleFilterChange('minDuration', e.target.value)}
                            min="0"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            value={filters.maxDuration}
                            onChange={(e) => handleFilterChange('maxDuration', e.target.value)}
                            min="0"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                          />
                        </div>
                      </div> */}

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Sort By</label>
                        <select
                          value={filters.sortBy}
                          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        >
                          <option value="first_seen_at">First Seen</option>
                          <option value="last_seen_at">Last Seen</option>
                          <option value="share">Share of Voice</option>
                          <option value="video_duration">Duration</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Sort Order</label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              id="sort-desc" 
                              name="sortOrder" 
                              value="DESC"
                              checked={filters.sortOrder === "DESC"}
                              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                              className="green-radio" 
                            />
                            <label htmlFor="sort-desc" className="text-sm">Newest First</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              id="sort-asc" 
                              name="sortOrder" 
                              value="ASC"
                              checked={filters.sortOrder === "ASC"}
                              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                              className="green-radio" 
                            />
                            <label htmlFor="sort-asc" className="text-sm">Oldest First</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-b border-gray-200">
                <button 
                  className="flex w-full items-center justify-between py-2 text-left font-medium" 
                  onClick={() => toggleAccordion("timeline")}
                >
                  Timeline
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className={`h-4 w-4 transition-transform ${openAccordions.includes("timeline") ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                
                {openAccordions.includes("timeline") && (
                  <div className="pb-4 pt-2">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start Date</label>
                        <input
                          type="date"
                          value={filters.startDate}
                          onChange={(e) => handleFilterChange('startDate', e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">End Date</label>
                        <input
                          type="date"
                          value={filters.endDate}
                          onChange={(e) => handleFilterChange('endDate', e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Results per page</label>
                        <select
                          value={filters.limit}
                          onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        >
                          <option value={10}>10 results</option>
                          <option value={20}>20 results</option>
                          <option value={50}>50 results</option>
                          <option value={100}>100 results</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* <div className="mt-8 grid grid-cols-2 gap-4">
            <button 
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={resetFilters}
            >
              Clear All
            </button>
            <button 
              className="rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 bg-[#b9ff66]"
              onClick={applyFilters}
            >
              Apply Filters
            </button>
          </div> */}
        </div>
      </aside>

      <button
        className="fixed bottom-4 right-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg md:hidden"
        onClick={() => setIsOpen(true)}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="h-5 w-5"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
      </button>
    </>
  )
}
