"use client";

import React, { useState } from "react";
import { ArrowLeft, Search, Navigation, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

export default function InspectionAddressPage() {
  const [address, setAddress] = useState("");
  const [currentStep] = useState(1);
  const [totalSteps] = useState(3);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const router = useRouter();

  const addressSuggestions = [
    "123 Oak Street, Arlington, TX",
    "456 Pine Avenue, Arlington, TX",
    "789 Maple Drive, Arlington, TX",
    "321 Elm Street, Arlington, TX",
  ];

  const useMyLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // In a real app, you'd reverse geocode this
          const locationAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setAddress(locationAddress);
          setLastSaved(new Date());
        },
        () => {
          alert("Unable to get your location. Please enter address manually.");
        }
      );
    }
  };

  const handleNext = () => {
    if (address.trim()) {
      // Save the address data (in a real app, use context/state management)
      if (typeof window !== "undefined") {
        sessionStorage.setItem("inspection_address", address);
        sessionStorage.setItem("inspection_started", new Date().toISOString());
      }
      router.push("/inspection/media");
    } else {
      alert("Please enter a valid address before continuing.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white safe-area-top safe-area-bottom">
      {/* Enhanced Header with Progress */}
      <div className="bg-gray-800 px-4 py-4 flex items-center shadow-lg">
        <button
          onClick={() => router.push("/dashboard")}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors mr-3 btn-touch"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">New Inspection</h1>
          <div className="text-xs text-gray-400">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
        {lastSaved && <div className="text-xs text-gray-400">Saved {lastSaved.toLocaleTimeString()}</div>}
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-800 px-4 pb-2">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="container-mobile py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Enter Property Address</h2>
          <p className="text-gray-400 text-sm sm:text-base">Search or manually enter the property address</p>
        </div>

        <div className="space-y-6">
          {/* Enhanced Address Input with Location Button */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-field pl-10 pr-16"
            />
            <button
              onClick={useMyLocation}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300 btn-touch"
              title="Use My Location"
            >
              <Navigation size={20} />
            </button>
          </div>

          {/* Enhanced Address Suggestions */}
          {address && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
              {addressSuggestions
                .filter((addr) => addr.toLowerCase().includes(address.toLowerCase()))
                .map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setAddress(suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0 btn-touch"
                  >
                    <div className="flex items-center space-x-3">
                      <MapPin size={16} className="text-gray-400" />
                      <span>{suggestion}</span>
                    </div>
                  </button>
                ))}
            </div>
          )}

          {/* Manual Entry Section */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="font-semibold mb-4">Or enter manually:</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Street Address"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 btn-touch"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 btn-touch"
                />
                <input
                  type="text"
                  placeholder="ZIP Code"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 btn-touch"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Next Button */}
        <div className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 z-30">
          <button
            onClick={handleNext}
            disabled={!address}
            className="btn-primary w-full disabled:bg-gray-700 disabled:cursor-not-allowed haptic-medium"
          >
            Next: Add Photos & Videos
          </button>
        </div>
      </div>
    </div>
  );
}
