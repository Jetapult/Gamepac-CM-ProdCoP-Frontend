// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Download, Eye, Trash2 } from "lucide-react"
import React, { useState, useEffect } from 'react'
import api from "../../api"

export default function InpaintingHistoryPage() {
  const [historyItems, setHistoryItems] = useState([])
  const [activeTab, setActiveTab] = useState('grid')

  useEffect(() => {
    fetchInpaintingHistory()
  }, [])

  const fetchInpaintingHistory = async () => {
    try {
      const response = await api.get('/v1/assetGenerator/inpainting-history')
      console.log(response.data)
      
      // Transform the data to match our component's structure
      const transformedData =response.data.data.map(item => ({
        id: item.id,
        date: new Date(item.created_at).toISOString().split('T')[0],
        originalImage: item.original_image_url,
        maskImage: item.mask_url,
        resultImage: item.result_image_url,
        title: item.prompt.length > 50 ? item.prompt.substring(0, 50) + '...' : item.prompt
      }))
      
      setHistoryItems(transformedData)
    } catch (error) {
      console.error('Error fetching inpainting history:', error)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-purple-400">Inpainting History</h1>

        <div className="w-full">
          <div className="flex justify-between items-center mb-6">
            <div className="bg-gray-900 rounded-md p-1 flex">
              <button 
                onClick={() => setActiveTab('grid')}
                className={`px-3 py-1.5 rounded-md ${activeTab === 'grid' ? 'bg-purple-900' : ''}`}
              >
                Grid View
              </button>
              <button 
                onClick={() => setActiveTab('list')}
                className={`px-3 py-1.5 rounded-md ${activeTab === 'list' ? 'bg-purple-900' : ''}`}
              >
                List View
              </button>
            </div>
            <button className="border border-purple-500 px-3 py-1.5 rounded-md text-purple-400 hover:bg-purple-900/20">
              Clear History
            </button>
          </div>

          {activeTab === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {historyItems.map((item) => (
                <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                  <div className="p-4 pb-2">
                    <h3 className="text-lg text-purple-400">{item.title}</h3>
                    <div className="flex items-center text-sm text-gray-400">
                      <CalendarDays className="h-4 w-4 mr-1" />
                      {item.date}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">Original</p>
                        <div className="relative aspect-video bg-black rounded overflow-hidden">
                          <img
                            src={item.originalImage || "/placeholder.svg"}
                            alt="Original image"
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">Mask</p>
                        <div className="relative aspect-video bg-black rounded overflow-hidden">
                          <img
                            src={item.maskImage || "/placeholder.svg"}
                            alt="Mask image"
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400">Result</p>
                      <div className="relative aspect-video bg-black rounded overflow-hidden">
                        <img
                          src={item.resultImage || "/placeholder.svg"}
                          alt="Result image"
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-950 pt-2 pb-2 px-4 flex justify-between">
                    <button className="text-gray-400 hover:text-purple-400 flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button className="text-gray-400 hover:text-purple-400 flex items-center">
                      <Download className="h-4 w-4 mr-1" />
                      Save
                    </button>
                    <button className="text-gray-400 hover:text-red-400 flex items-center">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'list' && (
            <div className="space-y-4">
              {historyItems.map((item) => (
                <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-lg">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-4 md:w-1/4">
                      <h3 className="font-medium text-purple-400">{item.title}</h3>
                      <div className="flex items-center text-sm text-gray-400 mt-1">
                        <CalendarDays className="h-4 w-4 mr-1" />
                        {item.date}
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <button
                          className="text-gray-400 hover:text-purple-400 border border-gray-700 px-2 py-1 rounded flex items-center text-sm"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                        <button
                          className="text-gray-400 hover:text-red-400 border border-gray-700 px-2 py-1 rounded flex items-center text-sm"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="p-4 flex-1 grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">Original</p>
                        <div className="relative aspect-video bg-black rounded overflow-hidden">
                          <img
                            src={item.originalImage || "/placeholder.svg"}
                            alt="Original image"
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">Mask</p>
                        <div className="relative aspect-video bg-black rounded overflow-hidden">
                          <img
                            src={item.maskImage || "/placeholder.svg"}
                            alt="Mask image"
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">Result</p>
                        <div className="relative aspect-video bg-black rounded overflow-hidden">
                          <img
                            src={item.resultImage || "/placeholder.svg"}
                            alt="Result image"
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

