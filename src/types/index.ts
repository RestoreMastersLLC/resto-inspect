// Core Types for RestoInspect Application

export interface User {
  id: string;
  email: string;
  name: string;
  role: "inspector" | "admin" | "guest";
  avatar?: string;
}

export interface OwnerInfo {
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface MediaItem {
  id: string;
  type: "photo" | "video";
  url: string;
  thumbnail: string;
  filename: string;
  size: number;
  compressedSize?: number;
  timestamp: Date;
  location?: GeolocationCoordinates;
  tags: string[];
  ownerInfo?: OwnerInfo;
  uploadStatus: "pending" | "uploading" | "completed" | "failed";
  isCompressed: boolean;
  quality: "low" | "medium" | "high";
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  formatted: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface MapPin {
  id: string;
  location: {
    lat: number;
    lng: number;
  };
  description: string;
  timestamp: Date;
  media: MediaItem[];
  isUrgent: boolean;
}

export interface InspectionData {
  id: string;
  address: Address;
  media: MediaItem[];
  notes: string;
  isUrgent: boolean;
  tags: string[];
  mapPins: MapPin[];
  progress: InspectionProgress;
  draftSavedAt?: Date;
  status: InspectionStatus;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  distance?: number; // Distance from current location in meters
}

export interface InspectionProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
}

export type InspectionStatus =
  | "draft"
  | "in-progress"
  | "pending-upload"
  | "uploading"
  | "submitted"
  | "under-review"
  | "completed"
  | "rejected";

export interface DamageTemplate {
  id: string;
  name: string;
  description: string;
  commonTags: string[];
  icon: string;
}

export interface LocationData {
  coordinates: GeolocationCoordinates;
  address?: Address;
  accuracy: number;
  timestamp: Date;
}

export interface OfflineQueueItem {
  id: string;
  type: "inspection" | "media-upload" | "pin-save";
  data: InspectionData | MediaItem | MapPin;
  priority: number;
  attempts: number;
  maxAttempts: number;
  lastAttempt?: Date;
  error?: string;
}

export interface AppSettings {
  photoQuality: "low" | "medium" | "high";
  autoSave: boolean;
  useLocation: boolean;
  offlineMode: boolean;
  compressionEnabled: boolean;
  maxFileSize: number; // in MB
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface InspectionForm {
  address: Partial<Address>;
  notes: string;
  isUrgent: boolean;
  tags: string[];
}

// Filter and search types
export interface InspectionFilters {
  status?: InspectionStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  isUrgent?: boolean;
  hasMedia?: boolean;
  search?: string;
}

export interface SearchOptions {
  query: string;
  filters: InspectionFilters;
  sortBy: "date" | "status" | "distance" | "urgency";
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}
