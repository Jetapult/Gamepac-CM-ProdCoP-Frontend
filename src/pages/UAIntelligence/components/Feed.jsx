import { useEffect, useState } from "react"
import AdFeed from "./AdFeed"
import FilterSidebar from "./FilterSidebar"
import api from "../../../api"

const Feed = ({user}) => {
  const studioId = user?.studio_type?.includes("studio_manager") ? localStorage.getItem("selectedStudioId") : user?.studio_id;
  
  const availableNetworks = [
    "Adcolony", "Admob", "Applovin", "BidMachine", "Chartboost", "Digital Turbine", 
    "Facebook", "InMobi", "Instagram", "Line", "Meta Audience Network", "Mintegral", 
    "Moloco", "Mopub", "Pangle", "Pinterest", "Smaato", "Snapchat", "Supersonic", 
    "Tapjoy", "TikTok", "Twitter", "Unity", "Verve", "Vungle", "Youtube"
  ]
  
  const availableAdTypes = [
    "image", "image-banner", "image-interstitial", "image-other", "banner", 
    "full_screen", "video", "video-rewarded", "video-interstitial", "video-other", 
    "playable", "interactive-playable", "interactive-playable-rewarded", "interactive-playable-other"
  ]
  
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
    sortBy: "share",
    sortOrder: "DESC"
  })

  const [adsData, setAdsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
    setAdsData([])
    setCurrentPage(1)
    setHasMore(true)
  }

  const buildQueryParams = (page = 1) => {
    const params = new URLSearchParams()
    
    params.append('page', page.toString())
    params.append('limit', (filters?.limit || 20).toString())
    
    params.append('sortBy', filters?.sortBy || 'share')
    params.append('sortOrder', filters?.sortOrder || 'DESC')
    
    if (filters?.search) {
      params.append('search', filters.search)
    }
    
    if (filters?.latest_batch !== null && filters?.latest_batch !== undefined) {
      params.append('latest_batch', filters.latest_batch.toString())
    }
    
    if (filters?.network && filters.network.length > 0) {
      params.append('network', filters.network.join(','))
    }
    if (filters?.ad_type && filters.ad_type.length > 0) {
      params.append('ad_type', filters.ad_type.join(','))
    }
    
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.minDuration) params.append('minDuration', filters.minDuration.toString())
    if (filters?.maxDuration) params.append('maxDuration', filters.maxDuration.toString())
    
    return params.toString()
  }

  const fetchAdsData = async (page = 1, appendData = false) => {
    if (!studioId) return
    
    try {
      if (page === 1) setLoading(true)
      setError(null)
      
      const queryParams = buildQueryParams(page)
      const response = await api.get(`v1/competitor-creatives/${studioId}?${queryParams}`)
      const newAds = response.data.data
      
      if (appendData && page > 1) {
        setAdsData(prev => [...prev, ...newAds])
      } else {
        setAdsData(newAds)
      }
      
      setTotalItems(response.data.totalItems || 0)
      setCurrentPage(response.data.currentPage || page)
      
      setHasMore(response.data.currentPage < response.data.totalPages)
      
    } catch (error) {
      console.error("Error fetching ads data:", error)
      setError("Failed to load ads data")
    } finally {
      if (page === 1) setLoading(false)
    }
  }

  const loadMoreData = () => {
    if (hasMore && !loading) {
      fetchAdsData(currentPage + 1, true)
    }
  }

  useEffect(() => {
    if (studioId) {
      fetchAdsData(1, false)
    }
  }, [studioId, filters])
  
  return (
    <div className="flex h-[calc(100vh-75px)] bg-gray-50 overflow-hidden">
      <FilterSidebar 
        onFiltersChange={handleFiltersChange}
        availableNetworks={availableNetworks}
        availableAdTypes={availableAdTypes}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">UA Intelligence Feed</h1>
                <p className="text-gray-500">Discover top performing ads and optimize your creative strategy</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
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
                    className="h-5 w-5 text-green-500"
                  >
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                  </svg>
                  <span className="font-medium">
                    {filters.sortBy === 'share' && filters.sortOrder === 'DESC' 
                      ? 'Showing best performing ads first'
                      : filters.sortBy === 'last_seen_at' && filters.sortOrder === 'DESC'
                      ? 'Showing most recently seen ads first'
                      : filters.sortBy === 'first_seen_at' && filters.sortOrder === 'DESC'
                      ? 'Showing newest ads first'
                      : 'Showing filtered results'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2 md:hidden">
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
                    <line x1="4" y1="21" x2="4" y2="14"></line>
                    <line x1="4" y1="10" x2="4" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="3"></line>
                    <line x1="20" y1="21" x2="20" y2="16"></line>
                    <line x1="20" y1="12" x2="20" y2="3"></line>
                    <line x1="1" y1="14" x2="7" y2="14"></line>
                    <line x1="9" y1="8" x2="15" y2="8"></line>
                    <line x1="17" y1="16" x2="23" y2="16"></line>
                  </svg>
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
                </div>
              </div>
              <AdFeed 
                adsData={adsData}
                loading={loading}
                error={error}
                hasMore={hasMore}
                loadMoreData={loadMoreData}
                totalItems={totalItems}
                filters={filters}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Feed;