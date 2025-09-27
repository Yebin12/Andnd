import React, { useState } from "react";
import { GoogleMapLocationPicker } from "./GoogleMapLocationPicker";

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

export function MapDemo() {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null
  );

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
    console.log("Selected location:", location);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">
          Google Maps Integration Demo
        </h1>
        <p className="text-gray-600">
          This demonstrates the Google Maps location picker component
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Location Picker</h2>
        <GoogleMapLocationPicker
          onLocationSelect={handleLocationSelect}
          initialLocation={selectedLocation}
        />
      </div>

      {selectedLocation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">
            Selected Location:
          </h3>
          <div className="space-y-1 text-sm">
            <p>
              <strong>Address:</strong> {selectedLocation.address}
            </p>
            <p>
              <strong>Latitude:</strong> {selectedLocation.lat.toFixed(6)}
            </p>
            <p>
              <strong>Longitude:</strong> {selectedLocation.lng.toFixed(6)}
            </p>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Features:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Interactive Google Maps with click-to-select</li>
          <li>• Location search with autocomplete</li>
          <li>• Current location detection</li>
          <li>• Reverse geocoding (coordinates to address)</li>
          <li>• Responsive design</li>
          <li>• Error handling and loading states</li>
        </ul>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Setup Required:</h3>
        <p className="text-sm text-yellow-700">
          To use this component, you need to:
        </p>
        <ol className="text-sm text-yellow-700 mt-2 space-y-1 list-decimal list-inside">
          <li>Get a Google Maps API key from Google Cloud Console</li>
          <li>Enable Maps JavaScript API and Geocoding API</li>
          <li>
            Add{" "}
            <code className="bg-yellow-100 px-1 rounded">
              VITE_GOOGLE_MAPS_API_KEY=your_key
            </code>{" "}
            to your .env file
          </li>
          <li>See GOOGLE_MAPS_SETUP.md for detailed instructions</li>
        </ol>
      </div>
    </div>
  );
}
