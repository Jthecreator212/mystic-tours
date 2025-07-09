import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// Type for content areas
export interface ContentArea {
  id: string;
  area_key: string;
  name: string;
  description: string;
  image_url: string;
  alt_text: string;
  section: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get a specific content area by its key
 * @param areaKey The unique key for the content area
 * @param fallbackUrl Optional fallback URL if the content area is not found
 * @returns The content area or a default one with the fallback URL
 */
export async function getContentByKey(areaKey: string, fallbackUrl?: string): Promise<ContentArea> {
  try {
    const { data, error } = await supabase
      .from('content_areas')
      .select('*')
      .eq('area_key', areaKey)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.warn(`Content area "${areaKey}" not found, using fallback`, error);
    
    // Return a default content area with the fallback URL
    return {
      id: 'fallback',
      area_key: areaKey,
      name: areaKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: '',
      image_url: fallbackUrl || `https://placehold.co/800x600/4a7c59/ffffff?text=${encodeURIComponent(areaKey)}`,
      alt_text: areaKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      section: 'fallback'
    };
  }
}

/**
 * Get all content areas for a specific section
 * @param section The section to get content for
 * @returns Array of content areas for the section
 */
export async function getContentBySection(section: string): Promise<ContentArea[]> {
  try {
    const { data, error } = await supabase
      .from('content_areas')
      .select('*')
      .eq('section', section)
      .order('created_at');

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.warn(`Error fetching content for section "${section}"`, error);
    return [];
  }
}

interface ContentImageProps {
  areaKey: string;
  fallbackUrl?: string;
  className?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}

/**
 * Create a dynamic image component that uses content from the CMS
 */
export function ContentImage(props: ContentImageProps) {
  const { areaKey, fallbackUrl, className, width, height, style } = props;
  const [content, setContent] = useState<ContentArea | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    async function loadContent() {
      try {
        setIsLoading(true);
        const contentData = await getContentByKey(areaKey, fallbackUrl);
        if (isMounted) {
          setContent(contentData);
        }
      } catch (error) {
        console.error(`Error loading content for ${areaKey}:`, error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadContent();
    
    // Set up a refresh interval to check for content updates
    const refreshInterval = setInterval(loadContent, 30000); // Refresh every 30 seconds
    
    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, [areaKey, fallbackUrl]);

  if (isLoading) {
    return <div className={`bg-gray-200 animate-pulse ${className || ''}`} style={{ width, height, ...(style || {}) }} />;
  }

  if (!content) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img 
        src={fallbackUrl || `https://placehold.co/800x600/4a7c59/ffffff?text=${encodeURIComponent(areaKey)}`}
        alt={areaKey.replace(/_/g, ' ')}
        className={className}
        width={width}
        height={height}
        style={style}
      />
    );
  }

  // Add cache-busting parameter to ensure we always get the latest image
  const cacheBuster = `?t=${new Date().getTime()}`;
  const imageUrl = content.image_url + (content.image_url.includes('?') ? '&cb=' + cacheBuster : cacheBuster);
  
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      src={imageUrl}
      alt={content.alt_text || content.name}
      className={className}
      width={width}
      height={height}
      style={style}
    />
  );
}
