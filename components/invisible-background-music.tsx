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

  // Create and configure audio element
  useEffect(() => {
    // Create audio element
    const audio = new Audio()
    audio.preload = 'auto'
    audio.loop = true
    audio.volume = volume
    audio.crossOrigin = 'anonymous'
    audio.src = musicSrc
    audioRef.current = audio

    // Event listeners
    const handleCanPlay = () => setError(null)
    const handleError = (e: Event) => {
      const errorMsg = `Audio error: ${audio.error?.message || 'Unknown error'}`
      console.error('🎵 Background Music Error:', errorMsg)
      setError(errorMsg)
    }
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    // Add listeners
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('error', handleError)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    // Cleanup
    return () => {
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.pause()
      audio.src = ''
    }
  }, [musicSrc, volume])

  // Attempt to play music
  const playMusic = useCallback(async () => {
    if (!audioRef.current) return false
    
    try {
      await audioRef.current.play()
      console.log('🎵 Background music started')
      return true
    } catch (err: any) {
      console.error('🎵 Background music failed:', err.message)
      return false
    }
  }, [])

  // Handle user interaction
  const handleUserInteraction = useCallback(async (eventType: string) => {
    if (hasUserInteracted || !audioRef.current) return
    
    setHasUserInteracted(true)
    
    const success = await playMusic()
    if (!success && retryCount < 2) {
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