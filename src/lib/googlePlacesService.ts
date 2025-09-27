// Google Places API service for global location search using Google Maps JavaScript API

export interface GooglePlaceSuggestion {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: string;
  icon: string;
  color: string;
  isPopular: boolean;
  description?: string;
  placeId: string;
  types: string[];
}

export interface GooglePlaceDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  types: string[];
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  photos?: string[];
  website?: string;
  phoneNumber?: string;
  openingHours?: string[];
}

// Global variables for Google Maps services
let autocompleteService: google.maps.places.AutocompleteService | null = null;
let placesService: google.maps.places.PlacesService | null = null;
let geocoder: google.maps.Geocoder | null = null;

// Initialize Google Maps services
function initializeGoogleServices() {
  if (typeof google === "undefined" || !google.maps) {
    throw new Error("Google Maps API not loaded");
  }

  if (!google.maps.places) {
    throw new Error("Google Maps Places library not loaded");
  }

  if (!autocompleteService) {
    autocompleteService = new google.maps.places.AutocompleteService();
  }

  if (!placesService) {
    // Create a dummy div for PlacesService (required by Google Maps API)
    const dummyDiv = document.createElement("div");
    placesService = new google.maps.places.PlacesService(dummyDiv);
  }

  if (!geocoder) {
    geocoder = new google.maps.Geocoder();
  }
}

// Cache for API responses to reduce costs
const searchCache = new Map<string, GooglePlaceSuggestion[]>();
const detailsCache = new Map<string, GooglePlaceDetails>();

// Category mapping for Google Places types
const getCategoryFromTypes = (
  types: string[]
): { category: string; icon: string; color: string } => {
  const typeMap: Record<
    string,
    { category: string; icon: string; color: string }
  > = {
    // Education
    university: { category: "Education", icon: "🎓", color: "#3B82F6" },
    school: { category: "Education", icon: "🎓", color: "#3B82F6" },
    college: { category: "Education", icon: "🎓", color: "#3B82F6" },

    // Transportation
    airport: { category: "Transportation", icon: "✈️", color: "#6B7280" },
    transit_station: {
      category: "Transportation",
      icon: "🚇",
      color: "#6B7280",
    },
    subway_station: {
      category: "Transportation",
      icon: "🚇",
      color: "#6B7280",
    },
    bus_station: { category: "Transportation", icon: "🚌", color: "#6B7280" },

    // Shopping
    shopping_mall: { category: "Shopping", icon: "🛍️", color: "#EF4444" },
    store: { category: "Shopping", icon: "🛍️", color: "#EF4444" },
    department_store: { category: "Shopping", icon: "🛍️", color: "#EF4444" },

    // Dining
    restaurant: { category: "Dining", icon: "🍽️", color: "#F59E0B" },
    food: { category: "Dining", icon: "🍽️", color: "#F59E0B" },
    cafe: { category: "Dining", icon: "☕", color: "#F59E0B" },

    // Entertainment
    movie_theater: { category: "Entertainment", icon: "🎬", color: "#8B5CF6" },
    amusement_park: { category: "Entertainment", icon: "🎢", color: "#8B5CF6" },
    museum: { category: "Entertainment", icon: "🏛️", color: "#8B5CF6" },

    // Healthcare
    hospital: { category: "Healthcare", icon: "🏥", color: "#10B981" },
    pharmacy: { category: "Healthcare", icon: "💊", color: "#10B981" },
    doctor: { category: "Healthcare", icon: "👨‍⚕️", color: "#10B981" },

    // Recreation
    park: { category: "Recreation", icon: "🏞️", color: "#059669" },
    gym: { category: "Recreation", icon: "💪", color: "#059669" },
    stadium: { category: "Recreation", icon: "🏟️", color: "#059669" },

    // Business
    bank: { category: "Business", icon: "🏦", color: "#374151" },
    office: { category: "Business", icon: "🏢", color: "#374151" },
    government: { category: "Business", icon: "🏛️", color: "#374151" },

    // Landmarks
    tourist_attraction: { category: "Landmark", icon: "🏛️", color: "#DC2626" },
    landmark: { category: "Landmark", icon: "🏛️", color: "#DC2626" },
    monument: { category: "Landmark", icon: "🗿", color: "#DC2626" },
  };

  // Find the best matching category
  for (const type of types) {
    if (typeMap[type]) {
      return typeMap[type];
    }
  }

  // Default category
  return { category: "Location", icon: "📍", color: "#6B7280" };
};

// Check if a place is popular based on rating and user count
const isPopularPlace = (
  rating?: number,
  userRatingsTotal?: number
): boolean => {
  if (!rating || !userRatingsTotal) return false;
  return rating >= 4.0 && userRatingsTotal >= 100;
};

// Google Places Autocomplete using JavaScript API
export async function searchGooglePlaces(
  query: string,
  sessionToken?: string
): Promise<GooglePlaceSuggestion[]> {
  if (!query.trim()) return [];

  // Check cache first
  const cacheKey = query.toLowerCase().trim();
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  try {
    // Initialize Google services
    initializeGoogleServices();

    if (!autocompleteService) {
      throw new Error("AutocompleteService not initialized");
    }

    // Create session token
    const token =
      sessionToken || new google.maps.places.AutocompleteSessionToken();

    // Search for places using AutocompleteService
    const request: google.maps.places.AutocompleteRequest = {
      input: query,
      sessionToken: token,
      types: ["establishment", "geocode"],
      componentRestrictions: {
        country: [
          "us",
          "ca",
          "kr",
          "jp",
          "gb",
          "au",
          "de",
          "fr",
          "it",
          "es",
          "nl",
          "se",
          "no",
          "dk",
          "fi",
          "ch",
          "at",
          "be",
          "ie",
          "nz",
          "sg",
          "hk",
          "tw",
          "my",
          "th",
          "ph",
          "id",
          "vn",
          "in",
          "cn",
        ],
      },
    };

    return new Promise((resolve) => {
      autocompleteService!.getPlacePredictions(
        request,
        async (predictions, status) => {
          if (
            status !== google.maps.places.PlacesServiceStatus.OK ||
            !predictions
          ) {
            console.warn("AutocompleteService error:", status);
            resolve([]);
            return;
          }

          const suggestions: GooglePlaceSuggestion[] = [];

          // Get details for each place to get coordinates and more info
          for (const prediction of predictions.slice(0, 8)) {
            // Limit to 8 results
            try {
              const details = await getPlaceDetails(prediction.place_id);
              if (details) {
                const categoryInfo = getCategoryFromTypes(details.types);
                suggestions.push({
                  id: details.placeId,
                  name: details.name,
                  address: details.formattedAddress,
                  lat: details.lat,
                  lng: details.lng,
                  category: categoryInfo.category,
                  icon: categoryInfo.icon,
                  color: categoryInfo.color,
                  isPopular: isPopularPlace(
                    details.rating,
                    details.userRatingsTotal
                  ),
                  description: details.website
                    ? `Website: ${details.website}`
                    : undefined,
                  placeId: details.placeId,
                  types: details.types,
                });
              }
            } catch (error) {
              console.warn(
                `Failed to get details for place ${prediction.place_id}:`,
                error
              );
            }
          }

          // Cache the results
          searchCache.set(cacheKey, suggestions);
          resolve(suggestions);
        }
      );
    });
  } catch (error) {
    console.error("Error searching Google Places:", error);

    // If Google Maps API isn't loaded yet, wait a bit and try again
    if (error instanceof Error && error.message.includes("not loaded")) {
      console.log("Google Maps API not ready, retrying in 1 second...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        initializeGoogleServices();
        // Retry the search
        return searchGooglePlaces(query, sessionToken);
      } catch (retryError) {
        console.error("Retry failed:", retryError);
      }
    }

    return [];
  }
}

// Google Places Details using JavaScript API
export async function getPlaceDetails(
  placeId: string
): Promise<GooglePlaceDetails | null> {
  if (!placeId) return null;

  // Check cache first
  if (detailsCache.has(placeId)) {
    return detailsCache.get(placeId)!;
  }

  try {
    // Initialize Google services
    initializeGoogleServices();

    if (!placesService) {
      throw new Error("PlacesService not initialized");
    }

    const request: google.maps.places.PlaceDetailsRequest = {
      placeId: placeId,
      fields: [
        "place_id",
        "name",
        "formatted_address",
        "geometry",
        "types",
        "rating",
        "user_ratings_total",
        "price_level",
        "website",
        "formatted_phone_number",
        "opening_hours",
      ],
    };

    return new Promise((resolve) => {
      placesService!.getDetails(request, (place, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
          console.warn("PlacesService error:", status);
          resolve(null);
          return;
        }

        const details: GooglePlaceDetails = {
          placeId: place.place_id || "",
          name: place.name || "",
          formattedAddress: place.formatted_address || "",
          lat: place.geometry?.location?.lat() || 0,
          lng: place.geometry?.location?.lng() || 0,
          types: place.types || [],
          rating: place.rating,
          userRatingsTotal: place.user_ratings_total,
          priceLevel: place.price_level,
          website: place.website,
          phoneNumber: place.formatted_phone_number,
          openingHours: place.opening_hours?.weekday_text,
        };

        // Cache the result
        detailsCache.set(placeId, details);
        resolve(details);
      });
    });
  } catch (error) {
    console.error("Error getting place details:", error);
    return null;
  }
}

// Clear cache (useful for testing or memory management)
export function clearPlacesCache(): void {
  searchCache.clear();
  detailsCache.clear();
}

// Get cache statistics
export function getCacheStats(): { searchCache: number; detailsCache: number } {
  return {
    searchCache: searchCache.size,
    detailsCache: detailsCache.size,
  };
}

// Debounced search function to optimize API calls
export function createDebouncedSearch(
  searchFunction: (query: string) => Promise<GooglePlaceSuggestion[]>,
  delay: number = 300
): (query: string) => Promise<GooglePlaceSuggestion[]> {
  let timeoutId: NodeJS.Timeout;
  let lastQuery = "";

  return (query: string): Promise<GooglePlaceSuggestion[]> => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);

      // If query is too short, return empty results immediately
      if (query.trim().length < 2) {
        resolve([]);
        return;
      }

      // If query hasn't changed, return cached results
      if (query === lastQuery && searchCache.has(query.toLowerCase().trim())) {
        resolve(searchCache.get(query.toLowerCase().trim())!);
        return;
      }

      timeoutId = setTimeout(async () => {
        lastQuery = query;
        const results = await searchFunction(query);
        resolve(results);
      }, delay);
    });
  };
}
