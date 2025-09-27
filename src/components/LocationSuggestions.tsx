import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  MapPin,
  Star,
  Building,
  Home,
  Utensils,
  Dumbbell,
  BookOpen,
  Microscope,
  Navigation,
} from "lucide-react";

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface LocationSuggestion {
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
}

interface LocationSuggestionsProps {
  searchQuery: string;
  onLocationSelect: (location: LocationData) => void;
  className?: string;
}

// Popular location suggestions database
const POPULAR_LOCATIONS: LocationSuggestion[] = [
  // UBC Locations
  {
    id: "ubc-main-mall",
    name: "UBC (1958 Main Mall)",
    address: "1958 Main Mall, Vancouver, BC V6T 1Z2",
    lat: 49.2606,
    lng: -123.246,
    category: "Education",
    icon: "🎓",
    color: "#3B82F6",
    isPopular: true,
    description: "Main pedestrian thoroughfare through UBC campus",
  },
  {
    id: "ubc-exchange",
    name: "UBC (Exchange Residence)",
    address: "5959 Student Union Blvd, Vancouver, BC V6T 1K2",
    lat: 49.258,
    lng: -123.242,
    category: "Residence",
    icon: "🏠",
    color: "#10B981",
    isPopular: true,
    description: "Student residence near Student Union Building",
  },
  {
    id: "ubc-sub",
    name: "UBC (Student Union Building)",
    address: "6138 Student Union Blvd, Vancouver, BC V6T 1Z1",
    lat: 49.2575,
    lng: -123.2415,
    category: "Dining",
    icon: "🍽️",
    color: "#F59E0B",
    isPopular: true,
    description: "Student Union Building with food court",
  },
  {
    id: "ubc-aquatic",
    name: "UBC (Aquatic Centre)",
    address: "6121 University Blvd, Vancouver, BC V6T 1Z1",
    lat: 49.257,
    lng: -123.241,
    category: "Recreation",
    icon: "🏊",
    color: "#8B5CF6",
    isPopular: true,
    description: "Swimming pool and aquatic facilities",
  },

  // Downtown Vancouver
  {
    id: "downtown-vancouver",
    name: "Downtown Vancouver",
    address: "Downtown Vancouver, BC, Canada",
    lat: 49.2827,
    lng: -123.1207,
    category: "Business",
    icon: "🏢",
    color: "#374151",
    isPopular: true,
    description: "Central business and entertainment district",
  },
  {
    id: "robson-street",
    name: "Robson Street",
    address: "Robson St, Vancouver, BC, Canada",
    lat: 49.2838,
    lng: -123.1212,
    category: "Shopping",
    icon: "🛍️",
    color: "#EF4444",
    isPopular: true,
    description: "Famous shopping and dining street",
  },
  {
    id: "gastown",
    name: "Gastown",
    address: "Gastown, Vancouver, BC, Canada",
    lat: 49.2827,
    lng: -123.1087,
    category: "Landmark",
    icon: "🏛️",
    color: "#DC2626",
    isPopular: true,
    description: "Historic neighborhood with heritage buildings",
  },

  // Burnaby
  {
    id: "metrotown",
    name: "Metropolis at Metrotown",
    address: "4700 Kingsway, Burnaby, BC V5H 4N1",
    lat: 49.2276,
    lng: -122.9996,
    category: "Shopping",
    icon: "🛍️",
    color: "#EF4444",
    isPopular: true,
    description: "Largest shopping mall in British Columbia",
  },
  {
    id: "sfu-burnaby",
    name: "Simon Fraser University",
    address: "8888 University Dr, Burnaby, BC V5A 1S6",
    lat: 49.2781,
    lng: -122.9199,
    category: "Education",
    icon: "🎓",
    color: "#3B82F6",
    isPopular: true,
    description: "Public research university on Burnaby Mountain",
  },

  // Richmond
  {
    id: "richmond-centre",
    name: "Richmond Centre",
    address: "6551 No 3 Rd, Richmond, BC V6Y 2B6",
    lat: 49.1666,
    lng: -123.1336,
    category: "Shopping",
    icon: "🛍️",
    color: "#EF4444",
    isPopular: true,
    description: "Major shopping center in Richmond",
  },
  {
    id: "yvr-airport",
    name: "Vancouver International Airport",
    address: "3211 Grant McConachie Way, Richmond, BC V7B 1Y7",
    lat: 49.1967,
    lng: -123.1815,
    category: "Transportation",
    icon: "✈️",
    color: "#6B7280",
    isPopular: true,
    description: "Major international airport",
  },
];

// Get category icon component
const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "education":
      return <Building className="w-4 h-4" />;
    case "residence":
      return <Home className="w-4 h-4" />;
    case "dining":
      return <Utensils className="w-4 h-4" />;
    case "recreation":
      return <Dumbbell className="w-4 h-4" />;
    case "library":
      return <BookOpen className="w-4 h-4" />;
    case "research":
      return <Microscope className="w-4 h-4" />;
    default:
      return <MapPin className="w-4 h-4" />;
  }
};

export function LocationSuggestions({
  searchQuery,
  onLocationSelect,
  className = "",
}: LocationSuggestionsProps) {
  const [filteredSuggestions, setFilteredSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [showAll, setShowAll] = useState(false);

  // Filter suggestions based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSuggestions([]);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = POPULAR_LOCATIONS.filter(
      (location) =>
        location.name.toLowerCase().includes(query) ||
        location.address.toLowerCase().includes(query) ||
        location.category.toLowerCase().includes(query) ||
        location.description?.toLowerCase().includes(query)
    );

    // Show up to 6 suggestions initially, or all if showAll is true
    setFilteredSuggestions(showAll ? filtered : filtered.slice(0, 6));
  }, [searchQuery, showAll]);

  const handleLocationSelect = (suggestion: LocationSuggestion) => {
    const locationData: LocationData = {
      lat: suggestion.lat,
      lng: suggestion.lng,
      address: suggestion.address,
    };
    onLocationSelect(locationData);
  };

  if (!searchQuery.trim() || filteredSuggestions.length === 0) {
    return null;
  }

  return (
    <div className={`mt-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">
          Popular Locations ({filteredSuggestions.length})
        </h3>
        {filteredSuggestions.length > 6 && (
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
        {filteredSuggestions.map((suggestion) => (
          <Card
            key={suggestion.id}
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
                      {getCategoryIcon(suggestion.category)}
                      <span className="ml-1">{suggestion.category}</span>
                    </Badge>
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

      {filteredSuggestions.length === 0 && searchQuery.trim() && (
        <div className="text-center py-4">
          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No popular locations found</p>
          <p className="text-xs text-gray-500">
            Try searching for "UBC", "Downtown", "Burnaby", or "Richmond"
          </p>
        </div>
      )}
    </div>
  );
}
