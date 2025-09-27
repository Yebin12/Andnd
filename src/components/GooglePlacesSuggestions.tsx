import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  MapPin,
  Star,
  Navigation,
  Loader2,
  Globe,
  TrendingUp,
  Clock,
} from "lucide-react";
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

interface GooglePlacesSuggestionsProps {
  searchQuery: string;
  onLocationSelect: (location: LocationData) => void;
  className?: string;
}

export function GooglePlacesSuggestions({
  searchQuery,
  onLocationSelect,
  className = "",
}: GooglePlacesSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<GooglePlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Create debounced search function
  const debouncedSearch = useCallback(
    createDebouncedSearch(searchGooglePlaces, 300),
    []
  );

  // Search for places when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Only search if query is at least 2 characters
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    debouncedSearch(searchQuery)
      .then((results) => {
        setSuggestions(results);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Search error:", err);
        setError("Failed to search locations. Please try again.");
        setIsLoading(false);
      });
  }, [searchQuery, debouncedSearch]);

  const handleLocationSelect = (suggestion: GooglePlaceSuggestion) => {
    const locationData: LocationData = {
      lat: suggestion.lat,
      lng: suggestion.lng,
      address: suggestion.address,
    };
    onLocationSelect(locationData);
  };

  // Don't render if no query or query is too short
  if (!searchQuery.trim() || searchQuery.trim().length < 2) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className={`mt-4 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
          <span className="text-sm text-gray-600">Searching locations...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`mt-4 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-5 h-5 text-red-500 mr-2">⚠️</div>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show no results
  if (suggestions.length === 0) {
    return (
      <div className={`mt-4 ${className}`}>
        <div className="text-center py-6">
          <Globe className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No locations found</p>
          <p className="text-xs text-gray-500 mt-1">
            Try searching for cities, universities, airports, or landmarks
          </p>
        </div>
      </div>
    );
  }

  // Limit results for better UX
  const displaySuggestions = showAll ? suggestions : suggestions.slice(0, 8);

  return (
    <div className={`mt-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-700">
            Global Locations ({suggestions.length})
          </h3>
          <Badge variant="outline" className="text-xs">
            <Globe className="w-3 h-3 mr-1" />
            Google Places
          </Badge>
        </div>

        {suggestions.length > 8 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="text-xs"
          >
            {showAll ? "Show Less" : "Show All"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {displaySuggestions.map((suggestion) => (
          <Card
            key={suggestion.placeId}
            className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] border-l-4"
            style={{ borderLeftColor: suggestion.color }}
            onClick={() => handleLocationSelect(suggestion)}
          >
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0"
                  style={{ backgroundColor: suggestion.color }}
                >
                  {suggestion.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">
                      {suggestion.name}
                    </h4>
                    {suggestion.isPopular && (
                      <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-gray-600 truncate mb-2">
                    {suggestion.address}
                  </p>

                  {suggestion.description && (
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {suggestion.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{
                        borderColor: suggestion.color,
                        color: suggestion.color,
                      }}
                    >
                      {suggestion.category}
                    </Badge>

                    {suggestion.isPopular && (
                      <Badge variant="secondary" className="text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <Navigation className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search Tips */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-1">Search Tips:</p>
            <ul className="space-y-1 text-blue-600">
              <li>
                • Try "Harvard University", "YVR Airport", "Seoul", "Tokyo"
              </li>
              <li>• Search for cities, universities, airports, or landmarks</li>
              <li>• Results are powered by Google Places API</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
