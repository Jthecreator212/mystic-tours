const TRIPADVISOR_API_KEY = process.env.NEXT_PUBLIC_TRIPADVISOR_API_KEY;
const BASE_URL = 'https://api.content.tripadvisor.com/api/v1';

export interface TripAdvisorLocation {
  location_id: string;
  name: string;
  address_obj: {
    street1?: string;
    city?: string;
    state?: string;
    country?: string;
    address_string?: string;
  };
  rating?: number;
  num_reviews?: number;
  photo?: {
    images: {
      small: { url: string };
      medium: { url: string };
      large: { url: string };
    };
  };
  subcategory: Array<{
    key: string;
    name: string;
  }>;
  web_url?: string;
}

export interface JamaicaDestination {
  id: string;
  name: string;
  location: string;
  description: string;
  image_url: string;
  alt_text: string;
  type: 'resort' | 'attraction';
  rating?: number;
  review_count?: number;
  web_url?: string;
}

// Jamaica coordinates for location search
const JAMAICA_COORDS = {
  latitude: 18.1096,
  longitude: -77.2975
};

export async function searchJamaicaDestinations(): Promise<JamaicaDestination[]> {
  if (!TRIPADVISOR_API_KEY) {
    console.error('TripAdvisor API key not found');
    return [];
  }

  try {
    // Search for locations near Jamaica
    const searchUrl = `${BASE_URL}/location/nearby_search?` +
      `latLong=${JAMAICA_COORDS.latitude},${JAMAICA_COORDS.longitude}&` +
      `category=attractions&` +
      `radius=50&` +
      `radiusUnit=km&` +
      `language=en`;

    const response = await fetch(searchUrl, {
      headers: {
        'X-TripAdvisor-API-Key': TRIPADVISOR_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`TripAdvisor API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Get detailed information for each location
    const destinations = await Promise.all(
      data.data.slice(0, 10).map(async (location: { location_id: string }) => {
        return await getLocationDetails(location.location_id);
      })
    );

    return destinations.filter(Boolean) as JamaicaDestination[];
  } catch (error) {
    console.error('Error fetching Jamaica destinations:', error);
    return [];
  }
}

export async function getLocationDetails(locationId: string): Promise<JamaicaDestination | null> {
  if (!TRIPADVISOR_API_KEY) {
    return null;
  }

  try {
    const detailsUrl = `${BASE_URL}/location/${locationId}/details?language=en`;
    
    const response = await fetch(detailsUrl, {
      headers: {
        'X-TripAdvisor-API-Key': TRIPADVISOR_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch location details: ${response.status}`);
    }

    const locationData = await response.json();
    const location: TripAdvisorLocation = locationData;

    // Get photos for the location
    const photos = await getLocationPhotos(locationId);
    const mainPhoto = photos[0];

    return {
      id: location.location_id,
      name: location.name,
      location: location.address_obj.address_string || 
                `${location.address_obj.city}, ${location.address_obj.state}`,
      description: generateDescription(location),
      image_url: mainPhoto?.images.large.url || '/images/gallery/gallery-1.png',
      alt_text: `${location.name} in Jamaica`,
      type: determineType(location.subcategory),
      rating: location.rating,
      review_count: location.num_reviews,
      web_url: location.web_url
    };
  } catch (error) {
    console.error(`Error fetching details for location ${locationId}:`, error);
    return null;
  }
}

export async function getLocationPhotos(locationId: string) {
  if (!TRIPADVISOR_API_KEY) {
    return [];
  }

  try {
    const photosUrl = `${BASE_URL}/location/${locationId}/photos?language=en`;
    
    const response = await fetch(photosUrl, {
      headers: {
        'X-TripAdvisor-API-Key': TRIPADVISOR_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return [];
    }

    const photosData = await response.json();
    return photosData.data || [];
  } catch (error) {
    console.error(`Error fetching photos for location ${locationId}:`, error);
    return [];
  }
}

function determineType(subcategories: Array<{ key: string; name: string }>): 'resort' | 'attraction' {
  const resortKeywords = ['hotel', 'resort', 'accommodation', 'lodging'];
  const categoryNames = subcategories.map(cat => cat.name.toLowerCase()).join(' ');
  
  return resortKeywords.some(keyword => categoryNames.includes(keyword)) ? 'resort' : 'attraction';
}

function generateDescription(location: TripAdvisorLocation): string {
  const subcategoryNames = location.subcategory?.map(cat => cat.name) || [];
  const categoryDesc = subcategoryNames.length > 0 ? subcategoryNames[0] : 'Tourist destination';
  
  let description = `Experience ${location.name}, a popular ${categoryDesc.toLowerCase()} in Jamaica.`;
  
  if (location.rating && location.rating > 4) {
    description += ` Highly rated with ${location.rating} stars`;
  }
  
  if (location.num_reviews && location.num_reviews > 100) {
    description += ` and over ${location.num_reviews} reviews from travelers.`;
  } else if (location.num_reviews) {
    description += ` with ${location.num_reviews} traveler reviews.`;
  } else {
    description += '.';
  }
  
  return description;
}

// Fallback destinations if API fails
export const fallbackDestinations: JamaicaDestination[] = [
  {
    id: 'fallback-1',
    name: "Dunn's River Falls",
    location: "Ocho Rios",
    description: "Famous terraced waterfalls where you can climb the natural stone steps surrounded by tropical gardens.",
    image_url: "/images/gallery/gallery-2.png",
    alt_text: "Dunn's River Falls in Ocho Rios",
    type: "attraction"
  },
  {
    id: 'fallback-2',
    name: "Seven Mile Beach",
    location: "Negril",
    description: "One of the world's most beautiful beaches with crystal clear waters and spectacular sunsets.",
    image_url: "/images/gallery/gallery-5.png",
    alt_text: "Seven Mile Beach in Negril",
    type: "attraction"
  },
  {
    id: 'fallback-3',
    name: "Blue Mountains",
    location: "Kingston",
    description: "Home to the world-famous Blue Mountain Coffee with breathtaking views and hiking trails.",
    image_url: "/images/gallery/gallery-4.png",
    alt_text: "Blue Mountains near Kingston",
    type: "attraction"
  }
]; 