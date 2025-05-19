import { useState } from "react"
import "../ua-intelligence.css";

export default function FilterSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [openAccordions, setOpenAccordions] = useState(["performance", "game", "audience"])

  const toggleAccordion = (id) => {
    setOpenAccordions(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 transform bg-white p-6 shadow-lg transition-transform duration-200 md:static md:z-0 md:translate-x-0 md:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
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

        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm text-gray-500">12 filters applied</span>
          <button className="inline-flex h-8 items-center rounded-md px-2 text-xs text-gray-700 hover:bg-gray-100 hover:text-gray-900">
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

        <hr className="my-4 border-t border-gray-200" />

        <div className="space-y-6">
          {/* Performance Accordion */}
          <div className="border-b border-gray-200">
            <button 
              className="flex w-full items-center justify-between py-2 text-left font-medium" 
              onClick={() => toggleAccordion("performance")}
            >
              Performance
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
                className={`h-4 w-4 transition-transform ${openAccordions.includes("performance") ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            
            {openAccordions.includes("performance") && (
              <div className="pb-4 pt-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">CPI Range</label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">$0.50</span>
                      <span className="text-sm">$5.00</span>
                    </div>
                    <div className="relative h-5 w-full">
                      <input 
                        type="range" 
                        min="0.5" 
                        max="5" 
                        step="0.1"
                        className="absolute inset-0 h-1 w-full cursor-pointer appearance-none rounded-full bg-gray-200 outline-none"
                        style={{ top: '50%', transform: 'translateY(-50%)' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Minimum Impressions</label>
                    <input 
                      type="number" 
                      placeholder="100,000" 
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Classification</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="all" name="classification" value="all" className="green-radio" defaultChecked />
                        <label htmlFor="all" className="text-sm">All Ads</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="best" name="classification" value="best" />
                        <label htmlFor="best" className="text-sm">Best Performers</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="worst" name="classification" value="worst" />
                        <label htmlFor="worst" className="text-sm">Worst Performers</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Game Accordion */}
          <div className="border-b border-gray-200">
            <button 
              className="flex w-full items-center justify-between py-2 text-left font-medium" 
              onClick={() => toggleAccordion("game")}
            >
              Game
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
                className={`h-4 w-4 transition-transform ${openAccordions.includes("game") ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            
            {openAccordions.includes("game") && (
              <div className="pb-4 pt-2">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="game1" className="h-4 w-4 rounded border-gray-300 green-checkbox" />
                    <label htmlFor="game1" className="text-sm">Fantasy Quest</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="game2" className="h-4 w-4 rounded border-gray-300 green-checkbox" />
                    <label htmlFor="game2" className="text-sm">Candy Crush Clone</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="game3" className="h-4 w-4 rounded border-gray-300 green-checkbox" />
                    <label htmlFor="game3" className="text-sm">Empire Builder</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="game4" className="h-4 w-4 rounded border-gray-300 green-checkbox" />
                    <label htmlFor="game4" className="text-sm">Farm Friends</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="game5" className="h-4 w-4 rounded border-gray-300 green-checkbox" />
                    <label htmlFor="game5" className="text-sm">Speed Racer</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="game6" className="h-4 w-4 rounded border-gray-300 green-checkbox" />
                    <label htmlFor="game6" className="text-sm">Word Master</label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Audience Accordion */}
          <div className="border-b border-gray-200">
            <button 
              className="flex w-full items-center justify-between py-2 text-left font-medium" 
              onClick={() => toggleAccordion("audience")}
            >
              Target Audience
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
                className={`h-4 w-4 transition-transform ${openAccordions.includes("audience") ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            
            {openAccordions.includes("audience") && (
              <div className="pb-4 pt-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Age Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="age1" className="h-4 w-4 rounded border-gray-300 text-blue-600 green-checkbox" />
                        <label htmlFor="age1" className="text-sm">18-24</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="age2" className="h-4 w-4 rounded border-gray-300 text-blue-600 green-checkbox" />
                        <label htmlFor="age2" className="text-sm">25-34</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="age3" className="h-4 w-4 rounded border-gray-300 text-blue-600 green-checkbox" />
                        <label htmlFor="age3" className="text-sm">35-44</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="age4" className="h-4 w-4 rounded border-gray-300 text-blue-600 green-checkbox" />
                        <label htmlFor="age4" className="text-sm">45-54</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="age5" className="h-4 w-4 rounded border-gray-300 text-blue-600 green-checkbox" />
                        <label htmlFor="age5" className="text-sm">55+</label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Geography</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="geo1" className="h-4 w-4 rounded border-gray-300 text-blue-600 green-checkbox" />
                        <label htmlFor="geo1" className="text-sm">US</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="geo2" className="h-4 w-4 rounded border-gray-300 text-blue-600 green-checkbox" />
                        <label htmlFor="geo2" className="text-sm">EU</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="geo3" className="h-4 w-4 rounded border-gray-300 text-blue-600 green-checkbox" />
                        <label htmlFor="geo3" className="text-sm">Asia</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="geo4" className="h-4 w-4 rounded border-gray-300 text-blue-600 green-checkbox" />
                        <label htmlFor="geo4" className="text-sm">Global</label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Gender</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="gender-all" name="gender" value="all" defaultChecked />
                        <label htmlFor="gender-all" className="text-sm">All</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="gender-male" name="gender" value="male" />
                        <label htmlFor="gender-male" className="text-sm">Male</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="gender-female" name="gender" value="female" />
                        <label htmlFor="gender-female" className="text-sm">Female</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Clear All
          </button>
          <button 
            className="rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 bg-[#b9ff66]"
          >
            Apply Filters
          </button>
        </div>
      </aside>

      {/* Mobile filter button */}
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
