import { useState, useEffect } from "react"
import { Check, Lightbulb, X } from "lucide-react"

export function AICritiquePanel({ sectionId, sectionTitle, onClose }) {
  const [critiques, setCritiques] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)

    const timer = setTimeout(() => {
      const mockCritiques = [
        {
          id: `${sectionId}-1`,
          type: "improvement",
          title: "Add more detail to core mechanics",
          description:
            "The core mechanics section could benefit from more specific examples of how the player interacts with the game world.",
        },
        {
          id: `${sectionId}-2`,
          type: "suggestion",
          title: "Consider player onboarding",
          description:
            "Add information about how new players will learn the game mechanics through tutorials or progressive complexity.",
        },
        {
          id: `${sectionId}-3`,
          type: "warning",
          title: "Potential balance issue",
          description:
            "The resource gathering rate may create an imbalance in the early game economy. Consider adjusting the acquisition rate or increasing early challenges.",
        },
      ]

      setCritiques(mockCritiques)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [sectionId])

  const getIconForType = (type) => {
    switch (type) {
      case "improvement":
        return <Lightbulb className="h-5 w-5 text-yellow-500" />
      case "suggestion":
        return <Lightbulb className="h-5 w-5 text-blue-500" />
      case "warning":
        return <Lightbulb className="h-5 w-5 text-red-500" />
      default:
        return <Lightbulb className="h-5 w-5" />
    }
  }

  return (
    <div className="border rounded-lg shadow-sm h-full bg-white">
      <div className="p-4 flex flex-row items-center justify-between pb-2 border-b">
        <h3 className="text-md font-medium">AI Critique</h3>
        <button 
          className="p-1 rounded-md hover:bg-accent"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium mb-4">Feedback for: {sectionTitle}</h3>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin mb-2"></div>
            <p className="text-sm text-muted-foreground">Analyzing content...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {critiques.map((critique) => (
              <div key={critique.id} className="rounded-lg border p-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getIconForType(critique.type)}</div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">{critique.title}</h4>
                    <p className="text-sm text-muted-foreground">{critique.description}</p>
                    <div className="flex gap-2 mt-2">
                      <button className="px-2 py-1 text-xs border rounded-md hover:bg-accent flex items-center">
                        <Check className="h-3 w-3 mr-1" />
                        Apply Suggestion
                      </button>
                      <button className="px-2 py-1 text-xs rounded-md hover:bg-accent">
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <hr className="my-4 border-t" />

            <div className="text-center">
              <button className="w-full px-4 py-2 text-sm border rounded-md hover:bg-accent flex items-center justify-center">
                <Lightbulb className="h-4 w-4 mr-2" />
                Generate More Feedback
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
