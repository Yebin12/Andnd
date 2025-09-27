import React, { useState, useEffect, useCallback } from "react";
import { APIProvider, Map, Marker, useMap } from "@vis.gl/react-google-maps";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { MapPin, Navigation, Search, X, Star, Loader2 } from "lucide-react";
import {
  searchGooglePlaces,
  createDebouncedSearch,
  type GooglePlaceSuggestion,
} from "../lib/googlePlacesService";

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface GoogleMapLocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: LocationData | null;
  onSearchQueryChange?: (query: string) => void;
  className?: string;
}

// Component to handle map interactions
function MapController({
  onLocationSelect,
}: {
  onLocationSelect: (location: LocationData) => void;
}) {
  const map = useMap();
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    if (!map) return;

    const handleMapClick = (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setMarkerPosition({ lat, lng });

        // Reverse geocode to get address
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            onLocationSelect({
              lat,
              lng,
              address: results[0].formatted_address,
            });
          } else {
            onLocationSelect({
              lat,
              lng,
              address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            });
          }
        });
      }
    };

    const listener = map.addListener("click", handleMapClick);
    return () => google.maps.event.removeListener(listener);
  }, [map, onLocationSelect]);

  return markerPosition ? <Marker position={markerPosition} /> : null;
}

export function GoogleMapLocationPicker({
  onLocationSelect,
  initialLocation,
  onSearchQueryChange,
  className = "",
}: GoogleMapLocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(
    initialLocation || null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Dropdown suggestions state
  const [suggestions, setSuggestions] = useState<GooglePlaceSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create debounced search function for suggestions
  const debouncedSearch = useCallback(
    createDebouncedSearch(searchGooglePlaces, 300),
    []
  );
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 37.7749, // Default to San Francisco
    lng: -122.4194,
  });

  // Handle search suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoadingSuggestions(false);
      setError(null);
      return;
    }

    // Only search if query is at least 2 characters
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    setError(null);
    setShowSuggestions(true);

    debouncedSearch(searchQuery)
      .then((results) => {
        setSuggestions(results);
        setIsLoadingSuggestions(false);
      })
      .catch((err) => {
        console.error("Search error:", err);
        setError("Failed to search locations. Please try again.");
        setIsLoadingSuggestions(false);
      });
  }, [searchQuery, debouncedSearch]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback(
    (suggestion: GooglePlaceSuggestion) => {
      const locationData: LocationData = {
        lat: suggestion.lat,
        lng: suggestion.lng,
        address: suggestion.address,
      };

      setCurrentLocation(locationData);
      setMapCenter({ lat: suggestion.lat, lng: suggestion.lng });
      setSearchQuery(suggestion.address);
      setShowSuggestions(false);
      setSuggestions([]);
      onLocationSelect(locationData);
    },
    [onLocationSelect]
  );

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setMapCenter({ lat, lng });

        // Reverse geocode to get address
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          setIsLoading(false);
          if (status === "OK" && results && results[0]) {
            const locationData = {
              lat,
              lng,
              address: results[0].formatted_address,
            };
            setCurrentLocation(locationData);
            onLocationSelect(locationData);
          } else {
            setError("Could not get address for current location");
          }
        });
      },
      (error) => {
        setIsLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError("Location access denied by user");
            break;
          case error.POSITION_UNAVAILABLE:
            setError("Location information is unavailable");
            break;
          case error.TIMEOUT:
            setError("Location request timed out");
            break;
          default:
            setError("An unknown error occurred while retrieving location");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, [onLocationSelect]);

  // Search for location
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      setIsLoading(false);
      if (status === "OK" && results && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();

        // Update map center to the searched location
        setMapCenter({ lat, lng });

        const locationData = {
          lat,
          lng,
          address: results[0].formatted_address,
        };

        // Set the current location and trigger the callback
        setCurrentLocation(locationData);
        onLocationSelect(locationData);

        // Update the search query to show the formatted address
        setSearchQuery(results[0].formatted_address);
      } else {
        setError(
          "Could not find the specified location. Please try a different search term."
        );
      }
    });
  }, [searchQuery, onLocationSelect]);

  // Handle location selection from map
  const handleLocationSelect = useCallback((location: LocationData) => {
    setCurrentLocation(location);
    setSearchQuery(location.address);
  }, []);

  // Clear location
  const clearLocation = useCallback(() => {
    setCurrentLocation(null);
    setSearchQuery("");
    setError(null);
  }, []);

  // Set initial map center if we have an initial location
  useEffect(() => {
    if (initialLocation) {
      setMapCenter({ lat: initialLocation.lat, lng: initialLocation.lng });
      setCurrentLocation(initialLocation);
      setSearchQuery(initialLocation.address);
    }
  }, [initialLocation]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div
        className={`w-full h-48 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center ${className}`}
      >
        <div className="text-center">
          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Google Maps API key not configured
          </p>
          <p className="text-xs text-gray-500">
            Please add VITE_GOOGLE_MAPS_API_KEY to your environment variables
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Controls */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative w-full min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                onSearchQueryChange?.(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                // Delay hiding suggestions to allow clicking on them
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              className="pl-10 rounded-lg"
            />

            {/* Dropdown Suggestions */}
            {showSuggestions &&
              (suggestions.length > 0 || isLoadingSuggestions || error) && (
                <div
                  className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                  style={{
                    width: "100%",
                    minWidth: "100%",
                    right: 0,
                  }}
                >
                  {isLoadingSuggestions && (
                    <div className="flex items-center justify-center py-3 px-4">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500 mr-2" />
                      <span className="text-sm text-gray-600">
                        Searching...
                      </span>
                    </div>
                  )}

                  {error && (
                    <div className="px-4 py-3 text-sm text-red-600 border-b border-gray-100">
                      {error}
                    </div>
                  )}

                  {!isLoadingSuggestions &&
                    !error &&
                    suggestions.map((suggestion) => (
                      <div
                        key={suggestion.placeId}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {suggestion.name}
                          </span>
                          {suggestion.isPopular && (
                            <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 truncate">
                          {suggestion.address}
                        </p>
                      </div>
                    ))}

                  {!isLoadingSuggestions &&
                    !error &&
                    suggestions.length === 0 &&
                    searchQuery.length >= 2 && (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        No locations found for "{searchQuery}"
                      </div>
                    )}
                </div>
              )}
          </div>
          <Button
            onClick={handleSearch}
            disabled={!searchQuery.trim() || isLoading}
            variant="outline"
            className="rounded-lg"
          >
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={getCurrentLocation}
            disabled={isLoading}
            variant="outline"
            className="rounded-lg flex items-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            Use Current Location
          </Button>
          {currentLocation && (
            <Button
              onClick={clearLocation}
              variant="outline"
              className="rounded-lg flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm">
          Loading location...
        </div>
      )}

      {/* Map */}
      <div className="w-full h-64 sm:h-72 md:h-80 border border-gray-200 rounded-lg overflow-hidden">
        <APIProvider apiKey={apiKey} libraries={["places"]}>
          <Map
            key={`${mapCenter.lat}-${mapCenter.lng}`}
            center={mapCenter}
            zoom={15}
            style={{ width: "100%", height: "100%" }}
            gestureHandling="greedy"
            disableDefaultUI={false}
            mapId="DEMO_MAP_ID"
          >
            <MapController onLocationSelect={handleLocationSelect} />
            {currentLocation && (
              <Marker
                position={{
                  lat: currentLocation.lat,
                  lng: currentLocation.lng,
                }}
                title={currentLocation.address}
                animation={google.maps.Animation.DROP}
              />
            )}
          </Map>
        </APIProvider>
      </div>

      {/* Selected Location Display */}
      {currentLocation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Selected Location:
              </p>
              <p className="text-sm text-green-700">
                {currentLocation.address}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Coordinates: {currentLocation.lat.toFixed(6)},{" "}
                {currentLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Click on the map to select a location</p>
        <p>• Use the search bar to find specific addresses</p>
        <p>• Click "Use Current Location" to get your current position</p>
      </div>
    </div>
  );
}
