export interface ImageType {
  id: string
  name: string
  url: string
  uploadedAt: string
  path?: string
  dimensions?: {
    width: number
    height: number
  }
  selector?: string
  pageUrl?: string
  description?: string
  category?: string
  alt_text?: string
  context?: string
  isPlaceholder?: boolean
  isBackground?: boolean
  isContainer?: boolean
}

export interface UploadImageParams {
  file: File
  name: string
}

export interface ReplaceImageParams {
  id: string
  file: File
  name: string
}
