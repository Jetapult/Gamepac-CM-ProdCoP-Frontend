import React, { useState } from "react"

export function PromptInput({ setIsLoadData }) {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [recentPrompts, setRecentPrompts] = useState([
    "Top simulation games released after Jan 2023 in EU",
    "Trending meta in new idle-RPG games",
    "Teardown top 3 new tower defense games",
    "Benchmarks for new puzzle games in US",
  ])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      if (!recentPrompts.includes(prompt)) {
        setRecentPrompts([prompt, ...recentPrompts.slice(0, 3)])
      }
      setIsLoading(false)
      setPrompt("")
    }, 1500)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask about game market trends, benchmarks, or specific games..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b9ff66]"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#b9ff66] focus:outline-none"
              onClick={() => setIsLoadData(true)}
            >
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
                className="mr-2 h-4 w-4"
              >
                <path d="M12 3v3m0 0 1.5-1.5M12 6l-1.5-1.5" />
                <path d="M16 4v3m0 0 1.5-1.5M16 7l-1.5-1.5" />
                <path d="M8 4v3m0 0L6.5 5.5M8 7 6.5 5.5" />
                <path d="m6 20 4-3 1.5-3-4.5-4 3 1 .5-3.5 2 2 2-2 .5 3.5 3-1-4.5 4 1.5 3 4 3" />
              </svg>
              {isLoading ? "Analyzing..." : "Generate Report"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500">Recent:</span>
            {recentPrompts.map((recentPrompt, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 cursor-pointer hover:bg-gray-200"
                onClick={() => setPrompt(recentPrompt)}
              >
                {recentPrompt}
              </span>
            ))}
          </div>
        </form>
      </div>
    </div>
  )
}
