'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface InvisibleBackgroundMusicProps {
  musicSrc: string
  volume?: number
}

export function InvisibleBackgroundMusic({ 
  musicSrc, 
  volume = 0.12 
}: InvisibleBackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Create multiple source formats for better compatibility
  const getAudioSources = (baseSrc: string) => {
    const baseName = baseSrc.replace(/\.[^/.]+$/, '') // Remove extension
    return [
      `${baseName}.mp3`,
      `${baseName}.ogg`
    ]
  }

  // Create and configure audio element
  useEffect(() => {
    console.log('🎵 Initializing audio with src:', musicSrc)
    
    // Create audio element
    const audio = new Audio()
    audio.preload = 'auto'
    audio.loop = true
    audio.volume = volume
    audio.crossOrigin = 'anonymous'
    
    // Try multiple audio formats for better browser compatibility
    const sources = getAudioSources(musicSrc)
    let sourceIndex = 0
    
    const tryNextSource = () => {
      if (sourceIndex >= sources.length) {
        console.error('🎵 All audio sources failed')
        setError('No supported audio format found')
        return
      }
      
      const currentSrc = sources[sourceIndex]
      console.log(`🎵 Trying audio source ${sourceIndex + 1}/${sources.length}:`, currentSrc)
      
      // Test if URL is accessible first
      fetch(currentSrc, { method: 'HEAD' })
        .then(response => {
          if (!response.ok) {
            console.warn(`🎵 Audio source ${sourceIndex + 1} not accessible:`, response.status, response.statusText)
            sourceIndex++
            tryNextSource()
            return
          }
          console.log(`🎵 Audio source ${sourceIndex + 1} accessible, setting source`)
          audio.src = currentSrc
        })
        .catch(err => {
          console.warn(`🎵 Failed to check audio source ${sourceIndex + 1}:`, err.message)
          sourceIndex++
          tryNextSource()
        })
    }
    
    // Start trying sources
    tryNextSource()
    audioRef.current = audio

    // Event listeners
    const handleLoadStart = () => console.log('🎵 Audio loading started...')
    const handleCanPlay = () => {
      console.log('🎵 Audio can play')
      setError(null)
    }
    const handleLoadedData = () => console.log('🎵 Audio data loaded')
    const handleError = (e: Event) => {
      const audioError = audio.error
      let errorMsg = 'Unknown audio error'
      
      if (audioError) {
        switch (audioError.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMsg = 'Audio loading aborted'
            break
          case MediaError.MEDIA_ERR_NETWORK:
            errorMsg = 'Network error while loading audio'
            break
          case MediaError.MEDIA_ERR_DECODE:
            errorMsg = 'Audio decoding error - trying next format'
            break
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMsg = 'Audio format not supported - trying next format'
            break
          default:
            errorMsg = `Audio error code: ${audioError.code}`
        }
        errorMsg += ` - ${audioError.message || 'No additional details'}`
      }
      
      console.warn('🎵 Audio source failed:', errorMsg)
      
      // Try next source on decode/format errors
      if (audioError && (audioError.code === MediaError.MEDIA_ERR_DECODE || audioError.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED)) {
        sourceIndex++
        if (sourceIndex < sources.length) {
          console.log('🎵 Trying next audio format...')
          tryNextSource()
        } else {
          console.error('🎵 All audio formats failed')
          setError('No compatible audio format found')
        }
      } else {
        setError(errorMsg)
      }
    }
    const handlePlay = () => {
      console.log('🎵 Audio started playing')
      setIsPlaying(true)
    }
    const handlePause = () => {
      console.log('🎵 Audio paused')
      setIsPlaying(false)
    }

    // Add listeners
    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('loadeddata', handleLoadedData)
    audio.addEventListener('error', handleError)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    // Cleanup
    return () => {
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('loadeddata', handleLoadedData)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.pause()
      audio.src = ''
    }
  }, [musicSrc, volume])

  // Attempt to play music
  const playMusic = useCallback(async () => {
    if (!audioRef.current) {
      console.warn('🎵 No audio element available')
      return false
    }
    
    try {
      console.log('🎵 Attempting to play music...')
      await audioRef.current.play()
      console.log('🎵 Background music started successfully')
      return true
    } catch (err: any) {
      console.error('🎵 Background music play failed:', err.name, '-', err.message)
      return false
    }
  }, [])

  // Handle user interaction
  const handleUserInteraction = useCallback(async (eventType: string) => {
    if (hasUserInteracted || !audioRef.current) return
    
    console.log(`🎵 User interaction detected: ${eventType}`)
    setHasUserInteracted(true)
    
    const success = await playMusic()
    if (!success && retryCount < 2) {
      console.log(`🎵 Retrying music playback (attempt ${retryCount + 1})`)
      setRetryCount(prev => prev + 1)
      setTimeout(() => playMusic(), 1000)
    }
    
    // Remove listeners after first attempt
    document.removeEventListener('click', clickHandler)
    document.removeEventListener('keydown', keyHandler)
    document.removeEventListener('touchstart', touchHandler)
  }, [hasUserInteracted, playMusic, retryCount])

  // Event handlers
  const clickHandler = useCallback(() => handleUserInteraction('click'), [handleUserInteraction])
  const keyHandler = useCallback(() => handleUserInteraction('keydown'), [handleUserInteraction])
  const touchHandler = useCallback(() => handleUserInteraction('touchstart'), [handleUserInteraction])

  // Set up interaction listeners
  useEffect(() => {
    if (hasUserInteracted) return

    console.log('🎵 Setting up user interaction listeners')
    document.addEventListener('click', clickHandler, { once: true })
    document.addEventListener('keydown', keyHandler, { once: true })
    document.addEventListener('touchstart', touchHandler, { once: true })

    return () => {
      document.removeEventListener('click', clickHandler)
      document.removeEventListener('keydown', keyHandler)
      document.removeEventListener('touchstart', touchHandler)
    }
  }, [hasUserInteracted, clickHandler, keyHandler, touchHandler])

  // Completely invisible - no UI elements
  return null
} 