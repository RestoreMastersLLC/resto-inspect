import { create } from "zustand";
import { persist } from "zustand/middleware";
import { InspectionData, MediaItem, Address, MapPin, DamageTemplate, InspectionStatus, OwnerInfo } from "@/types";
import locationService from "@/services/LocationService";
import storageService from "@/services/StorageService";
import offlineService from "@/services/OfflineService";

interface InspectionState {
  currentInspection: InspectionData | null;
  inspections: InspectionData[];
  damageTemplates: DamageTemplate[];
  isLoading: boolean;
  error: string | null;
  autoSaveEnabled: boolean;
  lastAutoSave: Date | null;

  // Actions
  startNewInspection: () => void;
  updateInspectionAddress: (address: Address) => void;
  addMedia: (files: File[], ownerInfo?: OwnerInfo) => Promise<void>;
  removeMedia: (mediaId: string) => void;
  updateMediaTags: (mediaId: string, tags: string[]) => void;
  updateMediaOwnerInfo: (mediaId: string, ownerInfo: OwnerInfo) => void;
  addMapPin: (pin: Omit<MapPin, "id" | "timestamp">) => void;
  removeMapPin: (pinId: string) => void;
  updateNotes: (notes: string) => void;
  toggleUrgent: () => void;
  setProgress: (step: number) => void;
  saveDraft: () => Promise<void>;
  submitInspection: () => Promise<void>;
  loadInspection: (id: string) => void;
  deleteDraft: (id: string) => void;
  getDraftInspections: () => InspectionData[];
  clearCurrentInspection: () => void;
  enableAutoSave: () => void;
  disableAutoSave: () => void;
  applyDamageTemplate: (templateId: string) => void;
  retakeMedia: (mediaId: string) => Promise<void>;
}

const DAMAGE_TEMPLATES: DamageTemplate[] = [
  {
    id: "roof-damage",
    name: "Roof Damage",
    description: "Missing shingles, holes, structural damage",
    commonTags: ["Roof Damage", "Missing Shingles", "Structural Damage"],
    icon: "🏠",
  },
  {
    id: "water-damage",
    name: "Water Damage",
    description: "Flooding, water intrusion, mold",
    commonTags: ["Water Intrusion", "Flooding", "Mold", "Water Damage"],
    icon: "💧",
  },
  {
    id: "structural",
    name: "Structural Issues",
    description: "Foundation cracks, wall damage, support issues",
    commonTags: ["Structural Damage", "Foundation Issues", "Wall Damage"],
    icon: "🏗️",
  },
  {
    id: "electrical",
    name: "Electrical Hazards",
    description: "Exposed wiring, electrical damage",
    commonTags: ["Electrical Hazard", "Exposed Wiring", "Power Issues"],
    icon: "⚡",
  },
  {
    id: "exterior",
    name: "Exterior Damage",
    description: "Siding, windows, doors, gutters",
    commonTags: ["Siding Issue", "Broken Windows", "Gutter Damage"],
    icon: "🏡",
  },
];

let autoSaveInterval: NodeJS.Timeout | null = null;

const useInspectionStore = create<InspectionState>()(
  persist(
    (set, get) => ({
      currentInspection: null,
      inspections: [],
      damageTemplates: DAMAGE_TEMPLATES,
      isLoading: false,
      error: null,
      autoSaveEnabled: true,
      lastAutoSave: null,

      startNewInspection: async () => {
        const currentLocation = await locationService.getCurrentLocation();

        const newInspection: InspectionData = {
          id: crypto.randomUUID(),
          address: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "US",
            formatted: "",
            coordinates: currentLocation
              ? {
                  lat: currentLocation.latitude,
                  lng: currentLocation.longitude,
                }
              : undefined,
          },
          media: [],
          notes: "",
          isUrgent: false,
          tags: [],
          mapPins: [],
          progress: {
            currentStep: 1,
            totalSteps: 3,
            completedSteps: [],
          },
          status: "draft",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set({ currentInspection: newInspection, error: null });

        // Start auto-save if enabled
        if (get().autoSaveEnabled) {
          get().enableAutoSave();
        }
      },

      updateInspectionAddress: (address: Address) => {
        const { currentInspection } = get();
        if (!currentInspection) return;

        const updated = {
          ...currentInspection,
          address,
          updatedAt: new Date(),
        };

        set({ currentInspection: updated });

        // Auto-save
        if (get().autoSaveEnabled) {
          setTimeout(() => get().saveDraft(), 1000);
        }
      },

      addMedia: async (files: File[], ownerInfo?: OwnerInfo) => {
        const { currentInspection } = get();
        if (!currentInspection) return;

        set({ isLoading: true, error: null });

        try {
          const currentLocation = await locationService.getCurrentLocation();
          const mediaItems: MediaItem[] = [];

          for (const file of files) {
            try {
              if (navigator.onLine && storageService.isConfigured()) {
                // Upload immediately if online
                const mediaItem = await storageService.createMediaItem(file, {
                  tags: [],
                  ownerInfo,
                  location: currentLocation as GeolocationCoordinates,
                  quality: "medium",
                });
                mediaItems.push(mediaItem);
              } else {
                // Queue for offline upload
                const tempMediaItem: MediaItem = {
                  id: crypto.randomUUID(),
                  type: file.type.startsWith("video/") ? "video" : "photo",
                  url: URL.createObjectURL(file),
                  thumbnail: URL.createObjectURL(file),
                  filename: file.name,
                  size: file.size,
                  timestamp: new Date(),
                  location: currentLocation as GeolocationCoordinates,
                  tags: [],
                  ownerInfo,
                  uploadStatus: "pending",
                  isCompressed: false,
                  quality: "medium",
                };

                mediaItems.push(tempMediaItem);
                offlineService.addToQueue("media-upload", tempMediaItem, 2);
              }
            } catch (error) {
              console.error("Failed to process file:", error);
              // Continue with other files
            }
          }

          const updated = {
            ...currentInspection,
            media: [...currentInspection.media, ...mediaItems],
            updatedAt: new Date(),
          };

          set({ currentInspection: updated, isLoading: false });

          // Auto-save
          if (get().autoSaveEnabled) {
            setTimeout(() => get().saveDraft(), 1000);
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to add media",
            isLoading: false,
          });
        }
      },

      removeMedia: (mediaId: string) => {
        const { currentInspection } = get();
        if (!currentInspection) return;

        const updated = {
          ...currentInspection,
          media: currentInspection.media.filter((item) => item.id !== mediaId),
          updatedAt: new Date(),
        };

        set({ currentInspection: updated });

        // Auto-save
        if (get().autoSaveEnabled) {
          setTimeout(() => get().saveDraft(), 500);
        }
      },

      updateMediaTags: (mediaId: string, tags: string[]) => {
        const { currentInspection } = get();
        if (!currentInspection) return;

        const updated = {
          ...currentInspection,
          media: currentInspection.media.map((item) => (item.id === mediaId ? { ...item, tags } : item)),
          updatedAt: new Date(),
        };

        set({ currentInspection: updated });

        // Auto-save
        if (get().autoSaveEnabled) {
          setTimeout(() => get().saveDraft(), 1000);
        }
      },

      updateMediaOwnerInfo: (mediaId: string, ownerInfo: OwnerInfo) => {
        const { currentInspection } = get();
        if (!currentInspection) return;

        const updated = {
          ...currentInspection,
          media: currentInspection.media.map((item) => (item.id === mediaId ? { ...item, ownerInfo } : item)),
          updatedAt: new Date(),
        };

        set({ currentInspection: updated });

        // Auto-save
        if (get().autoSaveEnabled) {
          setTimeout(() => get().saveDraft(), 1000);
        }
      },

      addMapPin: (pin: Omit<MapPin, "id" | "timestamp">) => {
        const { currentInspection } = get();
        if (!currentInspection) return;

        const newPin: MapPin = {
          ...pin,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        };

        const updated = {
          ...currentInspection,
          mapPins: [...currentInspection.mapPins, newPin],
          updatedAt: new Date(),
        };

        set({ currentInspection: updated });

        // Auto-save
        if (get().autoSaveEnabled) {
          setTimeout(() => get().saveDraft(), 1000);
        }
      },

      removeMapPin: (pinId: string) => {
        const { currentInspection } = get();
        if (!currentInspection) return;

        const updated = {
          ...currentInspection,
          mapPins: currentInspection.mapPins.filter((pin) => pin.id !== pinId),
          updatedAt: new Date(),
        };

        set({ currentInspection: updated });
      },

      updateNotes: (notes: string) => {
        const { currentInspection } = get();
        if (!currentInspection) return;

        const updated = {
          ...currentInspection,
          notes,
          updatedAt: new Date(),
        };

        set({ currentInspection: updated });

        // Auto-save
        if (get().autoSaveEnabled) {
          setTimeout(() => get().saveDraft(), 1500);
        }
      },

      toggleUrgent: () => {
        const { currentInspection } = get();
        if (!currentInspection) return;

        const updated = {
          ...currentInspection,
          isUrgent: !currentInspection.isUrgent,
          updatedAt: new Date(),
        };

        set({ currentInspection: updated });
      },

      setProgress: (step: number) => {
        const { currentInspection } = get();
        if (!currentInspection) return;

        const updated = {
          ...currentInspection,
          progress: {
            ...currentInspection.progress,
            currentStep: step,
          },
          updatedAt: new Date(),
        };

        set({ currentInspection: updated });
      },

      saveDraft: async () => {
        const { currentInspection } = get();
        if (!currentInspection) return;

        try {
          const updated = {
            ...currentInspection,
            draftSavedAt: new Date(),
            status: "draft" as InspectionStatus,
          };

          // Update in the inspections array
          const { inspections } = get();
          const existingIndex = inspections.findIndex((i) => i.id === updated.id);

          let updatedInspections;
          if (existingIndex >= 0) {
            updatedInspections = inspections.map((inspection, index) =>
              index === existingIndex ? updated : inspection
            );
          } else {
            updatedInspections = [...inspections, updated];
          }

          set({
            currentInspection: updated,
            inspections: updatedInspections,
            lastAutoSave: new Date(),
          });
        } catch (error) {
          console.error("Failed to save draft:", error);
        }
      },

      submitInspection: async () => {
        const { currentInspection } = get();
        if (!currentInspection) return;

        set({ isLoading: true, error: null });

        try {
          const submittedInspection = {
            ...currentInspection,
            status: "submitted" as InspectionStatus,
            submittedAt: new Date(),
            updatedAt: new Date(),
          };

          // Add to offline queue for sync
          offlineService.addToQueue("inspection", submittedInspection, 3);

          // Update local state
          const { inspections } = get();
          const updatedInspections = inspections.map((inspection) =>
            inspection.id === submittedInspection.id ? submittedInspection : inspection
          );

          set({
            currentInspection: null,
            inspections: updatedInspections,
            isLoading: false,
          });

          // Clear auto-save
          if (autoSaveInterval) {
            clearInterval(autoSaveInterval);
            autoSaveInterval = null;
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to submit inspection",
            isLoading: false,
          });
          throw error;
        }
      },

      loadInspection: (id: string) => {
        const { inspections } = get();
        const inspection = inspections.find((i) => i.id === id);

        if (inspection) {
          set({ currentInspection: inspection });

          if (get().autoSaveEnabled && inspection.status === "draft") {
            get().enableAutoSave();
          }
        }
      },

      deleteDraft: (id: string) => {
        const { inspections } = get();
        const updatedInspections = inspections.filter((i) => i.id !== id);

        set({ inspections: updatedInspections });

        // Clear current inspection if it's the one being deleted
        const { currentInspection } = get();
        if (currentInspection?.id === id) {
          set({ currentInspection: null });
        }
      },

      getDraftInspections: () => {
        const { inspections } = get();
        return inspections.filter((i) => i.status === "draft");
      },

      clearCurrentInspection: () => {
        set({ currentInspection: null });

        // Clear auto-save
        if (autoSaveInterval) {
          clearInterval(autoSaveInterval);
          autoSaveInterval = null;
        }
      },

      enableAutoSave: () => {
        if (autoSaveInterval) {
          clearInterval(autoSaveInterval);
        }

        autoSaveInterval = setInterval(() => {
          const { currentInspection, autoSaveEnabled } = get();
          if (currentInspection && autoSaveEnabled) {
            get().saveDraft();
          }
        }, 30000); // Auto-save every 30 seconds

        set({ autoSaveEnabled: true });
      },

      disableAutoSave: () => {
        if (autoSaveInterval) {
          clearInterval(autoSaveInterval);
          autoSaveInterval = null;
        }

        set({ autoSaveEnabled: false });
      },

      applyDamageTemplate: (templateId: string) => {
        const { currentInspection, damageTemplates } = get();
        if (!currentInspection) return;

        const template = damageTemplates.find((t) => t.id === templateId);
        if (!template) return;

        const updated = {
          ...currentInspection,
          tags: [...new Set([...currentInspection.tags, ...template.commonTags])],
          updatedAt: new Date(),
        };

        set({ currentInspection: updated });
      },

      retakeMedia: async (mediaId: string) => {
        const { currentInspection } = get();
        if (!currentInspection) return;

        // Remove the existing media item
        get().removeMedia(mediaId);

        // In a real app, this would trigger the camera to open
        // For now, we'll just log it
        console.log("Retaking media for:", mediaId);
      },
    }),
    {
      name: "restoInspect-inspections",
      partialize: (state) => ({
        inspections: state.inspections,
        autoSaveEnabled: state.autoSaveEnabled,
      }),
    }
  )
);

export default useInspectionStore;
