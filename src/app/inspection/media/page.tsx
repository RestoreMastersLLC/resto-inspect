"use client";

import React, { useState } from "react";
import { ArrowLeft, Camera, Video, UserCheck, Phone, Mail, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface MediaItem {
  id: string;
  type: "photo" | "video";
  thumbnail: string;
  ownerInfo?: {
    name: string;
    email: string;
    phone: string;
    role: string;
  };
}

interface OwnerInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ownerInfo: { name: string; email: string; phone: string; role: string }) => void;
  initialData?: {
    name: string;
    email: string;
    phone: string;
    role: string;
  };
}

const OwnerInfoModal: React.FC<OwnerInfoModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [role, setRole] = useState(initialData?.role || "");

  const handleSave = () => {
    onSave({ name, email, phone, role });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Owner Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Owner Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              placeholder="Enter owner name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              placeholder="owner@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
            >
              <option value="">Select role</option>
              <option value="owner">Property Owner</option>
              <option value="tenant">Tenant</option>
              <option value="manager">Property Manager</option>
              <option value="contractor">Contractor</option>
              <option value="adjuster">Insurance Adjuster</option>
            </select>
          </div>
        </div>
        <div className="flex space-x-3 mt-6">
          <button onClick={onClose} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-lg">
            Cancel
          </button>
          <button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default function InspectionMediaPage() {
  const [currentStep] = useState(2);
  const [totalSteps] = useState(3);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);

  const router = useRouter();

  const handleMediaCapture = async (type: "photo" | "video") => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: type === "video",
        });

        // In a real app, you'd capture the photo/video here
        // For now, we'll simulate capturing and create a mock item
        stream.getTracks().forEach((track) => track.stop()); // Clean up stream

        const newMedia: MediaItem = {
          id: Date.now().toString(),
          type: type,
          thumbnail: `/api/placeholder/150/150`,
        };

        setMedia((prev) => [...prev, newMedia]);
      } else {
        // Fallback for browsers without camera support
        const newMedia: MediaItem = {
          id: Date.now().toString(),
          type: type,
          thumbnail: `data:image/svg+xml,${encodeURIComponent(`
            <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
              <rect width="150" height="150" fill="#374151"/>
              <text x="75" y="75" font-family="Arial" font-size="14" fill="white" text-anchor="middle" dy="0.3em">
                ${type === "photo" ? "📷 Photo" : "🎥 Video"}
              </text>
            </svg>
          `)}`,
        };

        setMedia((prev) => [...prev, newMedia]);
      }
    } catch (error) {
      console.error("Camera access denied or not available:", error);
      // Still create a placeholder item
      const newMedia: MediaItem = {
        id: Date.now().toString(),
        type: type,
        thumbnail: `data:image/svg+xml,${encodeURIComponent(`
          <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
            <rect width="150" height="150" fill="#374151"/>
            <text x="75" y="75" font-family="Arial" font-size="14" fill="white" text-anchor="middle" dy="0.3em">
              ${type === "photo" ? "📷 Photo" : "🎥 Video"}
            </text>
          </svg>
        `)}`,
      };

      setMedia((prev) => [...prev, newMedia]);

      // Show user-friendly message
      alert(`Camera access is not available. ${type === "photo" ? "Photo" : "Video"} placeholder created.`);
    }
  };

  const addOwnerInfoToMedia = (mediaId: string) => {
    setSelectedMediaId(mediaId);
    setShowOwnerModal(true);
  };

  const saveOwnerInfo = (ownerInfo: { name: string; email: string; phone: string; role: string }) => {
    if (selectedMediaId) {
      setMedia((prev) => prev.map((item) => (item.id === selectedMediaId ? { ...item, ownerInfo } : item)));
    }
    setSelectedMediaId(null);
  };

  const removeMedia = (mediaId: string) => {
    setMedia((prev) => prev.filter((item) => item.id !== mediaId));
  };

  const handleNext = () => {
    router.push("/inspection/submit");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white safe-area-top safe-area-bottom">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-4 flex items-center shadow-lg">
        <button
          onClick={() => router.push("/inspection/address")}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors mr-3 btn-touch"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Take Photos & Videos</h1>
          <div className="text-xs text-gray-400">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
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

      <div className="px-6 py-8 pb-32">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Document the Damage</h2>
          <p className="text-gray-400">Capture photos and videos with owner information</p>
        </div>

        {/* Media Capture Buttons */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => handleMediaCapture("photo")}
            className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-lg p-4 flex items-center justify-center space-x-2 transition-colors btn-touch"
          >
            <Camera size={24} />
            <span>Take Photo</span>
          </button>
          <button
            onClick={() => handleMediaCapture("video")}
            className="flex-1 bg-purple-600 hover:bg-purple-700 rounded-lg p-4 flex items-center justify-center space-x-2 transition-colors btn-touch"
          >
            <Video size={24} />
            <span>Record Video</span>
          </button>
        </div>

        {/* Media Gallery */}
        {media.length > 0 && (
          <div>
            <h3 className="font-semibold mb-4">Captured Media ({media.length})</h3>
            <div className="photo-grid">
              {media.map((item) => (
                <div key={item.id} className="bg-gray-800 rounded-lg p-3 relative">
                  <Image
                    src={item.thumbnail}
                    alt={item.type}
                    className="w-full h-24 rounded object-cover bg-gray-700"
                  />

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {item.type === "photo" ? "📷" : "🎥"} {item.type}
                    </span>
                    <button onClick={() => removeMedia(item.id)} className="text-red-400 hover:text-red-300 btn-touch">
                      <X size={16} />
                    </button>
                  </div>

                  {/* Owner Info Display */}
                  {item.ownerInfo ? (
                    <div className="mt-2 p-2 bg-gray-700 rounded text-xs">
                      <div className="flex items-center space-x-1 text-green-400 mb-1">
                        <UserCheck size={12} />
                        <span>Owner Info Added</span>
                      </div>
                      <div className="text-gray-300">
                        <div>{item.ownerInfo.name}</div>
                        <div className="flex items-center space-x-2">
                          <Mail size={10} />
                          <span>{item.ownerInfo.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone size={10} />
                          <span>{item.ownerInfo.phone}</span>
                        </div>
                        <div className="text-gray-400">{item.ownerInfo.role}</div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => addOwnerInfoToMedia(item.id)}
                      className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded transition-colors btn-touch"
                    >
                      + Add Owner Info
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Text */}
        {media.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Camera size={48} className="mx-auto mb-2 opacity-50" />
              <p>No media captured yet</p>
              <p className="text-sm">Take photos or videos to document damage</p>
            </div>
          </div>
        )}
      </div>

      {/* Owner Info Modal */}
      <OwnerInfoModal
        isOpen={showOwnerModal}
        onClose={() => {
          setShowOwnerModal(false);
          setSelectedMediaId(null);
        }}
        onSave={saveOwnerInfo}
      />

      {/* Next Button */}
      <div className="fixed bottom-6 left-6 right-6">
        <button
          onClick={handleNext}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors btn-touch ripple"
        >
          Next: Review & Submit
        </button>
      </div>
    </div>
  );
}
