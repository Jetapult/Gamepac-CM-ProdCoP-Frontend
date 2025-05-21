import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import Layout from "../Layout"

export default function NewGDD() {
  const navigate = useNavigate()
  const [isCreating, setIsCreating] = useState(false)
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    sections: ["overview", "mechanics", "characters", "art", "economy", "monetization", "ux", "technical"]
  })
  const [errors, setErrors] = useState({})
  
  const availableSections = [
    { id: "overview", label: "Game Overview" },
    { id: "mechanics", label: "Game Mechanics" },
    { id: "characters", label: "Characters & Story" },
    { id: "art", label: "Art & Audio" },
    { id: "economy", label: "Economy & Balance" },
    { id: "monetization", label: "Monetization" },
    { id: "ux", label: "UX & UI" },
    { id: "technical", label: "Technical Specs" },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormValues({
      ...formValues,
      [name]: value
    })
  }

  const handleCheckboxChange = (sectionId, checked) => {
    let newSections = [...formValues.sections]
    
    if (checked) {
      if (!newSections.includes(sectionId)) {
        newSections.push(sectionId)
      }
    } else {
      newSections = newSections.filter(id => id !== sectionId)
    }
    
    setFormValues({
      ...formValues,
      sections: newSections
    })
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formValues.title || formValues.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters"
    }
    
    if (!formValues.description || formValues.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters"
    }
    
    if (!formValues.sections.length) {
      newErrors.sections = "Select at least one section"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      setIsCreating(true)
      
      setTimeout(() => {
        console.log("Creating new GDD:", formValues)
        setIsCreating(false)
        navigate("/gdd/new")
      }, 1500)
    }
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New GDD</h1>
          <p className="text-muted-foreground">Set up a new game design document with your preferred sections</p>
        </div>

        <div className="border rounded-lg shadow-sm bg-white">
          <div className="p-6 pb-2">
            <h3 className="text-xl font-semibold">New Game Design Document</h3>
            <p className="text-sm text-muted-foreground">Fill in the details to create a new GDD</p>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-sm font-medium mb-2">Project Title</label>
                <input 
                  type="text"
                  name="title"
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter your game title"
                  value={formValues.title}
                  onChange={handleChange}
                />
                <p className="text-sm text-muted-foreground mt-1">This will be the main title of your game design document</p>
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Project Description</label>
                <textarea 
                  name="description"
                  className="w-full p-2 border rounded-md min-h-[100px]"
                  placeholder="Briefly describe your game concept"
                  value={formValues.description}
                  onChange={handleChange}
                />
                <p className="text-sm text-muted-foreground mt-1">A short summary of your game concept</p>
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                )}
              </div>

              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">GDD Sections</label>
                  <p className="text-sm text-muted-foreground">Select the sections you want to include in your GDD</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableSections.map((section) => (
                    <div key={section.id} className="flex flex-row items-start space-x-3 space-y-0">
                      <input
                        type="checkbox"
                        id={`section-${section.id}`}
                        className="mt-1 green-checkbox"
                        value={section.id}
                        checked={formValues.sections.includes(section.id)}
                        onChange={(e) => handleCheckboxChange(section.id, e.target.checked)}
                      />
                      <label htmlFor={`section-${section.id}`} className="font-normal">{section.label}</label>
                    </div>
                  ))}
                </div>
                
                {errors.sections && (
                  <p className="text-sm text-red-500 mt-1">{errors.sections}</p>
                )}
              </div>

              <button 
                type="submit" 
                className="w-full bg-[#B9FF66] rounded-md p-2 hover:bg-primary/90 disabled:opacity-50" 
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                    Creating GDD...
                  </>
                ) : (
                  "Create GDD"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}
