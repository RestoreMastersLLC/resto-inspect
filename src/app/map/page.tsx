"use client";

import React, { useState } from "react";
import { ArrowLeft, MapPin, Navigation, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MapPage() {
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [pins, setPins] = useState([
    { id: 1, lat: 32.7767, lng: -96.797, address: "123 Oak Street", status: "Completed" },
    { id: 2, lat: 32.7757, lng: -96.798, address: "456 Pine Avenue", status: "Pending" },
  ]);

  const router = useRouter();

  const handleMyLocation = () => {
    setIsLocating(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          setIsLocating(false);

          // Show success message
          alert(`📍 Located at: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        },
        (error) => {
          console.warn("Location access denied:", error);
          setIsLocating(false);
          alert("Unable to get your location. Please enable location services.");
        }
      );
    } else {
      setIsLocating(false);
      alert("Geolocation is not supported by this browser.");
    }
  };

  const navigateToProperty = (pin: { id: number; lat: number; lng: number; address: string; status: string }) => {
    if (currentLocation) {
      const url = `https://www.google.com/maps/dir/${currentLocation.lat},${currentLocation.lng}/${pin.lat},${pin.lng}`;
      window.open(url, "_blank");
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${pin.lat},${pin.lng}`;
      window.open(url, "_blank");
    }
  };

  const handleAddPin = () => {
    setIsAddingPin(true);

    // Try to get current location for pin
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPin = {
            id: pins.length + 1,
            lat: latitude,
            lng: longitude,
            address: `Property at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            status: "New",
          };
          setPins((prev) => [...prev, newPin]);
          setIsAddingPin(false);
        },
        (error) => {
          console.warn("Location access denied:", error);
          // Fallback to Dallas area with slight randomization
          const newPin = {
            id: pins.length + 1,
            lat: 32.776 + (Math.random() - 0.5) * 0.01,
            lng: -96.7975 + (Math.random() - 0.5) * 0.01,
            address: "New Property (Estimated Location)",
            status: "New",
          };
          setPins((prev) => [...prev, newPin]);
          setIsAddingPin(false);
        }
      );
    } else {
      // Fallback if geolocation not supported
      setTimeout(() => {
        const newPin = {
          id: pins.length + 1,
          lat: 32.776 + (Math.random() - 0.5) * 0.01,
          lng: -96.7975 + (Math.random() - 0.5) * 0.01,
          address: "New Property",
          status: "New",
        };
        setPins((prev) => [...prev, newPin]);
        setIsAddingPin(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white safe-area-top safe-area-bottom">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-4 flex items-center shadow-lg">
        <button
          onClick={() => router.push("/dashboard")}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors mr-3 btn-touch"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold flex-1">Property Map</h1>
        <button
          onClick={handleAddPin}
          disabled={isAddingPin}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors btn-touch"
        >
          {isAddingPin ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Plus size={20} />
          )}
        </button>
      </div>

      <div className="flex-1">
        {/* Map Placeholder */}
        <div className="relative h-96 bg-gray-800 flex items-center justify-center">
          <div className="text-center">
            <MapPin size={48} className="mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
            <p className="text-gray-400 mb-4">Google Maps integration would be displayed here</p>
            <div className="text-sm text-gray-500">
              • View properties on map
              <br />
              • Drop pins for new properties
              <br />• Navigate to locations
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-6 py-4 bg-gray-850">
          <div className="flex space-x-3">
            <button
              onClick={handleMyLocation}
              disabled={isLocating}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg p-3 flex items-center justify-center space-x-2 transition-colors btn-touch"
            >
              <Navigation size={18} />
              <span className="text-sm">{isLocating ? "Locating..." : "My Location"}</span>
            </button>
            <button
              onClick={handleAddPin}
              disabled={isAddingPin}
              className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 rounded-lg p-3 flex items-center justify-center space-x-2 transition-colors btn-touch"
            >
              <MapPin size={18} />
              <span className="text-sm">{isAddingPin ? "Adding..." : "Drop Pin"}</span>
            </button>
          </div>
        </div>

        {/* Pin List */}
        <div className="px-6 py-4">
          <h3 className="font-semibold mb-4">📍 Nearby Properties ({pins.length})</h3>
          <div className="space-y-3">
            {pins.map((pin) => (
              <div key={pin.id} className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{pin.address}</div>
                  <div className="text-sm text-gray-400">
                    📍 {pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      pin.status === "Completed"
                        ? "status-completed"
                        : pin.status === "Pending"
                          ? "status-pending"
                          : "status-in-progress"
                    }`}
                  >
                    {pin.status}
                  </span>
                  <button
                    onClick={() => navigateToProperty(pin)}
                    className="text-blue-400 hover:text-blue-300 btn-touch"
                    title="Navigate to property"
                  >
                    <Navigation size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Help Text */}
        <div className="px-6 py-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h4 className="font-medium mb-2">🗺️ How to Use the Map</h4>
            <div className="text-sm text-gray-400 space-y-1">
              <p>• Tap &quot;Drop Pin&quot; to mark a property location</p>
              <p>• Use &quot;My Location&quot; to center the map on your position</p>
              <p>• Tap the navigation icon to get directions to a property</p>
              <p>• Properties are color-coded by inspection status</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
