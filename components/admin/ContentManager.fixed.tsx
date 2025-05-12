"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Image, Edit2, Save, X, RefreshCw } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Define the content area type
interface ContentArea {
  id: string
  area_key: string
  name: string
  description: string
  image_url: string
  alt_text: string
  section: string
  created_at?: string
  updated_at?: string
}

export default function ContentManager() {
  // State for content areas and filtering
  const [contentAreas, setContentAreas] = useState<ContentArea[]>([])
  const [filteredAreas, setFilteredAreas] = useState<ContentArea[]>([])
  const [selectedSection, setSelectedSection] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")
  
  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState(true)
  const [isCreatingTable, setIsCreatingTable] = useState(false)
  
  // Image editing state
  const [editingArea, setEditingArea] = useState<ContentArea | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  // Track whether content has been modified
  const [hasChanges, setHasChanges] = useState(false)
  
  // Available sections for filtering
  const sections = ["all", "homepage", "about", "tours", "gallery", "global"]
  
  // Fetch content areas on component mount
  useEffect(() => {
    fetchContentAreas()
  }, [])

  // Apply filters whenever the section or search term changes
  useEffect(() => {
    const filtered = contentAreas.filter(area => {
      const matchesSection = selectedSection === "all" || area.section === selectedSection
      const matchesSearch = !searchTerm || 
        area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        area.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        area.area_key.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSection && matchesSearch
    })
    
    setFilteredAreas(filtered)
  }, [contentAreas, selectedSection, searchTerm])
  
  // Fetch content areas from the API
  const fetchContentAreas = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/content')
      
      // Handle any response, even if it's not OK
      try {
        const data = await response.json()
        
        if (!response.ok) {
          // Check if the error is due to the table not existing
          if (data.error && (data.error.includes('does not exist') || data.error.includes('relation') || data.error.includes('42P01'))) {
            setTableExists(false)
            setError('The content management table does not exist yet. Please create it first.')
            return
          }
          throw new Error(data.error || 'Failed to fetch content areas')
        }
        
        // If we got here, the response was OK
        setContentAreas(Array.isArray(data) ? data : [])
        setTableExists(true)
      } catch (parseError) {
        // If we can't parse the JSON, assume the table doesn't exist
        setTableExists(false)
        setError('The content management system needs to be set up. Please click the button below to create it.')
        console.error('JSON parse error:', parseError)
      }
    } catch (fetchError) {
      setError('Failed to connect to the server. Please try again.')
      console.error('Fetch error:', fetchError)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Create the content_areas table
  const createContentTable = async () => {
    setIsCreatingTable(true)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/content/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create content table')
      }
      
      setSuccess('Content management table created successfully!')
      setTableExists(true)
      
      // Fetch content areas after creating the table
      fetchContentAreas()
    } catch (error) {
      setError('Failed to create content table. Please try again.')
      console.error('Error creating content table:', error)
    } finally {
      setIsCreatingTable(false)
    }
  }
  
  // Handle file selection for image update
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setPreviewUrl(URL.createObjectURL(e.target.files[0]))
      setHasChanges(true)
    }
  }
  
  // Handle saving content area changes
  const handleSaveChanges = async () => {
    if (!editingArea) return
    
    setIsUploading(true)
    setError(null)
    
    try {
      // Create form data for file upload
      const formData = new FormData()
      
      // Add the content area data
      formData.append('id', editingArea.id)
      formData.append('area_key', editingArea.area_key)
      formData.append('name', editingArea.name)
      formData.append('description', editingArea.description)
      formData.append('alt_text', editingArea.alt_text)
      formData.append('section', editingArea.section)
      
      // Add the file if one was selected
      if (selectedFile) {
        formData.append('image', selectedFile)
      } else {
        formData.append('image_url', editingArea.image_url)
      }
      
      // Send the update request
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        body: formData,
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update content area')
      }
      
      // Update the content areas list with the updated item
      setContentAreas(prev => 
        prev.map(area => area.id === editingArea.id ? data : area)
      )
      
      // Reset the editing state
      setEditingArea(null)
      setSelectedFile(null)
      setPreviewUrl(null)
      setHasChanges(false)
      
      // Show success message
      setSuccess('Content area updated successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (error) {
      setError('Failed to update content area. Please try again.')
      console.error('Error updating content area:', error)
    } finally {
      setIsUploading(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Content Management</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchContentAreas}
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search content areas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-[180px]">
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section} value={section}>
                      {section.charAt(0).toUpperCase() + section.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              <p>{error}</p>
              
              {!tableExists && (
                <div className="mt-2">
                  <Button 
                    onClick={createContentTable}
                    disabled={isCreatingTable}
                  >
                    {isCreatingTable ? "Creating..." : "Create Content Management Table"}
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-gray-400" />
              <p>Loading content areas...</p>
            </div>
          ) : filteredAreas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No content areas found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAreas.map((area) => (
                <Card key={area.id} className="overflow-hidden">
                  <div className="relative aspect-video bg-gray-100">
                    <img 
                      src={area.image_url} 
                      alt={area.alt_text || area.name} 
                      className="object-cover w-full h-full"
                    />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-opacity-100"
                          onClick={() => {
                            setEditingArea(area)
                            setPreviewUrl(null)
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[380px] max-h-[460px] border-0 shadow-lg bg-white dark:bg-gray-900 animate-in fade-in-80 zoom-in-90 rounded-lg p-3 overflow-auto">
                        <div className="flex items-center justify-between mb-3">
                          <DialogTitle className="text-base font-medium text-gray-800">Edit Content</DialogTitle>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-7 w-7 rounded-full" 
                            onClick={() => {
                              setEditingArea(null)
                              setPreviewUrl(null)
                              setSelectedFile(null)
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {editingArea && (
                          <div className="space-y-2">
                            <div className="relative aspect-video bg-gray-100 rounded-md overflow-hidden mb-3">
                              <img 
                                src={previewUrl || editingArea.image_url} 
                                alt={editingArea.alt_text || editingArea.name} 
                                className="object-cover w-full h-full"
                              />
                              <label className="absolute bottom-2 right-2">
                                <div className="bg-white rounded-full p-2 shadow-md cursor-pointer">
                                  <Image className="w-4 h-4" />
                                </div>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={handleFileSelect}
                                />
                              </label>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1 mb-3">
                                <Label className="text-xs font-medium text-gray-600">Section</Label>
                                <Select 
                                  value={editingArea.section} 
                                  onValueChange={(value) => {
                                    setEditingArea({...editingArea, section: value})
                                    setHasChanges(true)
                                  }}
                                >
                                  <SelectTrigger className="border-gray-200 focus:border-gray-300 focus:ring-0 rounded text-sm h-[40px]">
                                    <SelectValue placeholder="Select section" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {sections.filter(s => s !== 'all').map((section) => (
                                      <SelectItem key={section} value={section}>
                                        {section.charAt(0).toUpperCase() + section.slice(1)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-1 mb-3">
                                <Label className="text-xs font-medium text-gray-600">Key</Label>
                                <Input 
                                  className="border-gray-200 focus:border-gray-300 focus:ring-0 rounded text-sm h-[40px]" 
                                  value={editingArea.area_key}
                                  onChange={(e) => {
                                    setEditingArea({...editingArea, area_key: e.target.value})
                                    setHasChanges(true)
                                  }}
                                  disabled
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-1 mb-3">
                              <Label className="text-xs font-medium text-gray-600">Name</Label>
                              <Input 
                                className="border-gray-200 focus:border-gray-300 focus:ring-0 rounded text-sm h-[40px]" 
                                value={editingArea.name}
                                onChange={(e) => {
                                  setEditingArea({...editingArea, name: e.target.value})
                                  setHasChanges(true)
                                }}
                              />
                            </div>
                            
                            <div className="space-y-1 mb-3">
                              <Label className="text-xs font-medium text-gray-600">Alt Text</Label>
                              <Input 
                                className="border-gray-200 focus:border-gray-300 focus:ring-0 rounded text-sm h-[40px]" 
                                value={editingArea.alt_text}
                                onChange={(e) => {
                                  setEditingArea({...editingArea, alt_text: e.target.value})
                                  setHasChanges(true)
                                }}
                              />
                            </div>
                            
                            <div className="space-y-1 mb-3">
                              <Label className="text-xs font-medium text-gray-600">Description</Label>
                              <Textarea 
                                className="border-gray-200 focus:border-gray-300 focus:ring-0 rounded text-sm h-[40px] min-h-[40px]" 
                                value={editingArea.description}
                                onChange={(e) => {
                                  setEditingArea({...editingArea, description: e.target.value})
                                  setHasChanges(true)
                                }}
                              />
                            </div>
                            
                            <div className="flex justify-end items-center gap-3 mt-4 pt-3 border-t border-gray-100">
                              {hasChanges && (
                                <span className="text-xs text-amber-600">You have unsaved changes</span>
                              )}
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost"
                                  className="text-xs h-8 px-3 text-gray-500 hover:text-gray-700"
                                  onClick={() => {
                                    setEditingArea(null)
                                    setSelectedFile(null)
                                    setHasChanges(false)
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={handleSaveChanges}
                                  disabled={!hasChanges || isUploading}
                                  className="text-xs h-8 px-4 bg-primary hover:bg-primary/90 text-white rounded-md flex items-center gap-1"
                                >
                                  {isUploading ? (
                                    <>
                                      <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Saving...
                                    </>
                                  ) : (
                                    'Save Changes'
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium">{area.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{area.description}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-400">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {area.section}
                      </span>
                      <span className="ml-2 truncate">
                        {area.area_key}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
