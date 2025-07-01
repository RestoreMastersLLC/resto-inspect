// Core Types for RestoInspect Application

export enum UserRole {
  ADMIN = "admin",
  INSPECTOR = "inspector",
  VIEWER = "viewer",
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

// Define permissions for different features
export enum Permission {
  // Inspection permissions
  CREATE_INSPECTION = "create_inspection",
  VIEW_INSPECTION = "view_inspection",
  EDIT_INSPECTION = "edit_inspection",
  DELETE_INSPECTION = "delete_inspection",
  SUBMIT_INSPECTION = "submit_inspection",

  // User management permissions
  VIEW_USERS = "view_users",
  CREATE_USER = "create_user",
  EDIT_USER = "edit_user",
  DELETE_USER = "delete_user",

  // Report permissions
  VIEW_REPORTS = "view_reports",
  GENERATE_REPORTS = "generate_reports",
  EXPORT_REPORTS = "export_reports",

  // System permissions
  VIEW_ANALYTICS = "view_analytics",
  MANAGE_SETTINGS = "manage_settings",
  VIEW_AUDIT_LOGS = "view_audit_logs",
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

// JWT types
export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  exp?: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
  details?: unknown;
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
