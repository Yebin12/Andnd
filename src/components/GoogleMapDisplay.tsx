import React from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { MapPin } from "lucide-react";

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface GoogleMapDisplayProps {
  location: string;
  locationData?: LocationData | null;
  locationLat?: number;
  locationLng?: number;
  locationPrivacy?: "exact" | "approximate" | "hidden";
  showExactLocation?: boolean;
  className?: string;
}

export function GoogleMapDisplay({
  location,
  locationData,
  locationLat,
  locationLng,
  locationPrivacy = "approximate",
  showExactLocation = false,
  className = "",
}: GoogleMapDisplayProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Determine the coordinates to display
  const displayLat = locationData?.lat || locationLat;
  const displayLng = locationData?.lng || locationLng;
  const displayAddress = locationData?.address || location;

  // Check if we have valid coordinates
  const hasCoordinates =
    displayLat &&
    displayLng &&
    typeof displayLat === "number" &&
    typeof displayLng === "number" &&
    !isNaN(displayLat) &&
    !isNaN(displayLng);

  // Determine if we should show exact location based on privacy settings
  // Show map if we have coordinates and privacy allows it (not "hidden")
  const shouldShowMap = hasCoordinates && locationPrivacy !== "hidden";

  // If no API key, show fallback
  if (!apiKey) {
    return (
      <div
        className={`w-full h-64 rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center ${className}`}
      >
        <div className="text-center">
          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 font-medium">{displayAddress}</p>
          <p className="text-xs text-gray-500 mt-1">
            Google Maps API key not configured
          </p>
        </div>
      </div>
    );
  }

  // If no coordinates or privacy is hidden, show fallback
  if (!shouldShowMap) {
    return (
      <div
        className={`w-full h-64 rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center ${className}`}
      >
        <div className="text-center">
          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 font-medium">{displayAddress}</p>
          <p className="text-xs text-gray-500 mt-1">
            {!hasCoordinates
              ? "Location coordinates not available"
              : "Location privacy settings prevent showing map"}
          </p>
        </div>
      </div>
    );
  }

  // Show the actual Google Map
  return (
    <div
      className={`w-full h-64 rounded-lg overflow-hidden border ${className}`}
    >
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={{ lat: displayLat, lng: displayLng }}
          defaultZoom={15}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeId="roadmap"
          className="w-full h-full"
        >
          <Marker
            position={{ lat: displayLat, lng: displayLng }}
            title={displayAddress}
            animation={google.maps.Animation.DROP}
          />
        </Map>
      </APIProvider>
      <div className="p-3 bg-white border-t">
        <p className="text-sm text-gray-600">
          <MapPin className="w-4 h-4 inline mr-1" />
          {displayAddress}
        </p>
        {locationPrivacy === "approximate" && (
          <p className="text-xs text-gray-500 mt-1">
            Approximate location shown
          </p>
        )}
      </div>
    </div>
  );
}
