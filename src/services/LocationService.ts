/**
 * LocationService - Singleton service for GPS/location management
 *
 * Features:
 * - GPS position tracking with accuracy settings
 * - Permission management for web and mobile
 * - Distance calculations between coordinates
 * - Reverse geocoding for address lookup
 * - Battery optimization and error handling
 * - Offline location caching
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formatted?: string;
}

export interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export interface LocationPermissionStatus {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

class LocationService {
  private static instance: LocationService;
  private currentLocation: Coordinates | null = null;
  private watchId: number | null = null;
  private lastKnownLocation: Coordinates | null = null;
  private permissionStatus: LocationPermissionStatus | null = null;
  private isWatching: boolean = false;

  // Configuration
  private readonly DEFAULT_OPTIONS: LocationOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000, // 1 minute
  };

  private readonly PRODUCTION_OPTIONS: LocationOptions = {
    enableHighAccuracy: false, // Battery optimization
    timeout: 15000,
    maximumAge: 300000, // 5 minutes
  };

  private constructor() {
    this.initializeService();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }

    return LocationService.instance;
  }

  /**
   * Initialize the location service
   */
  private initializeService(): void {
    // Load cached location from localStorage
    this.loadCachedLocation();

    // Check initial permission status
    this.checkPermissionStatus();
  }

  /**
   * Request location permissions
   */
  public async requestPermissions(): Promise<boolean> {
    try {
      if (!this.isGeolocationSupported()) {
        console.warn("Geolocation is not supported by this browser");
        return false;
      }

      // Check permission API if available
      if ("permissions" in navigator) {
        const permission = await navigator.permissions.query({ name: "geolocation" });

        this.permissionStatus = {
          granted: permission.state === "granted",
          denied: permission.state === "denied",
          prompt: permission.state === "prompt",
        };

        return permission.state === "granted";
      }

      // Fallback: try to get position to check permissions
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => {
            this.permissionStatus = { granted: true, denied: false, prompt: false };
            resolve(true);
          },
          (error) => {
            const denied = error.code === GeolocationPositionError.PERMISSION_DENIED;
            this.permissionStatus = {
              granted: false,
              denied: denied,
              prompt: !denied,
            };
            resolve(false);
          },
          { timeout: 5000 }
        );
      });
    } catch (error) {
      console.error("Error checking location permissions:", error);
      return false;
    }
  }

  /**
   * Get current location (one-time)
   */
  public async getCurrentLocation(options?: LocationOptions): Promise<Coordinates> {
    if (!this.isGeolocationSupported()) {
      throw new Error("Geolocation is not supported");
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error("Location permission denied");
    }

    const locationOptions = {
      ...this.getOptimalOptions(),
      ...options,
    };

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          this.currentLocation = coords;
          this.lastKnownLocation = coords;
          this.cacheLocation(coords);

          resolve(coords);
        },
        (error) => {
          const errorMessage = this.getLocationErrorMessage(error);
          console.error("Location error:", errorMessage);

          // Return cached location if available
          if (this.lastKnownLocation) {
            console.warn("Using cached location due to error");
            resolve(this.lastKnownLocation);
          } else {
            reject(new Error(errorMessage));
          }
        },
        locationOptions
      );
    });
  }

  /**
   * Start watching position changes
   */
  public startWatching(
    onLocationUpdate: (coords: Coordinates) => void,
    onError?: (error: string) => void,
    options?: LocationOptions
  ): boolean {
    if (!this.isGeolocationSupported() || this.isWatching) {
      return false;
    }

    const locationOptions = {
      ...this.getOptimalOptions(),
      ...options,
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };

        this.currentLocation = coords;
        this.lastKnownLocation = coords;
        this.cacheLocation(coords);

        onLocationUpdate(coords);
      },
      (error) => {
        const errorMessage = this.getLocationErrorMessage(error);
        console.error("Watch position error:", errorMessage);

        if (onError) {
          onError(errorMessage);
        }
      },
      locationOptions
    );

    this.isWatching = this.watchId !== null;
    return this.isWatching;
  }

  /**
   * Stop watching position changes
   */
  public stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isWatching = false;
    }
  }

  /**
   * Calculate distance between two coordinates (in meters)
   */
  public calculateDistance(from: Coordinates, to: Coordinates): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (from.latitude * Math.PI) / 180;
    const φ2 = (to.latitude * Math.PI) / 180;
    const Δφ = ((to.latitude - from.latitude) * Math.PI) / 180;
    const Δλ = ((to.longitude - from.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Format distance for display
   */
  public formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  }

  /**
   * Reverse geocoding - convert coordinates to address
   */
  public async reverseGeocode(coords: Coordinates): Promise<Address> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.warn("Google Maps API key not configured");
      return { formatted: `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}` };
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error("Geocoding request failed");
      }

      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const result = data.results[0];
        const components = result.address_components;

        const address: Address = {
          formatted: result.formatted_address,
        };

        // Parse address components
        components.forEach((component: AddressComponent) => {
          const types = component.types;

          if (types.includes("street_number") || types.includes("route")) {
            address.street = (address.street || "") + " " + component.long_name;
          } else if (types.includes("locality")) {
            address.city = component.long_name;
          } else if (types.includes("administrative_area_level_1")) {
            address.state = component.short_name;
          } else if (types.includes("country")) {
            address.country = component.long_name;
          } else if (types.includes("postal_code")) {
            address.postalCode = component.long_name;
          }
        });

        return address;
      } else {
        throw new Error("No results found");
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return { formatted: `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}` };
    }
  }

  /**
   * Get current location or last known location
   */
  public getCurrentOrLastKnownLocation(): Coordinates | null {
    return this.currentLocation || this.lastKnownLocation;
  }

  /**
   * Get permission status
   */
  public getPermissionStatus(): LocationPermissionStatus | null {
    return this.permissionStatus;
  }

  /**
   * Check if currently watching position
   */
  public isCurrentlyWatching(): boolean {
    return this.isWatching;
  }

  /**
   * Clear cached location data
   */
  public clearCache(): void {
    this.currentLocation = null;
    this.lastKnownLocation = null;

    if (typeof window !== "undefined") {
      localStorage.removeItem("resto_inspect_last_location");
    }
  }

  // Private helper methods

  private isGeolocationSupported(): boolean {
    return "geolocation" in navigator;
  }

  private async checkPermissionStatus(): Promise<void> {
    if ("permissions" in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: "geolocation" });
        this.permissionStatus = {
          granted: permission.state === "granted",
          denied: permission.state === "denied",
          prompt: permission.state === "prompt",
        };
      } catch (error) {
        console.warn("Could not check permission status:", error);
      }
    }
  }

  private getOptimalOptions(): LocationOptions {
    // Use production options in production environment
    const isProduction = process.env.NEXT_PUBLIC_APP_ENV === "production";
    return isProduction ? this.PRODUCTION_OPTIONS : this.DEFAULT_OPTIONS;
  }

  private getLocationErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
      case GeolocationPositionError.PERMISSION_DENIED:
        return "Location access denied. Please enable location permissions in your browser settings.";
      case GeolocationPositionError.POSITION_UNAVAILABLE:
        return "Location information is unavailable. Please check your device settings.";
      case GeolocationPositionError.TIMEOUT:
        return "Location request timed out. Please try again.";
      default:
        return "An unknown error occurred while retrieving location.";
    }
  }

  private cacheLocation(coords: Coordinates): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "resto_inspect_last_location",
          JSON.stringify({
            ...coords,
            cachedAt: Date.now(),
          })
        );
      } catch (error) {
        console.warn("Could not cache location:", error);
      }
    }
  }

  private loadCachedLocation(): void {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("resto_inspect_last_location");
        if (cached) {
          const data = JSON.parse(cached);
          const age = Date.now() - data.cachedAt;

          // Use cached location if less than 1 hour old
          if (age < 3600000) {
            this.lastKnownLocation = {
              latitude: data.latitude,
              longitude: data.longitude,
              accuracy: data.accuracy,
              timestamp: data.timestamp,
            };
          }
        }
      } catch (error) {
        console.warn("Could not load cached location:", error);
      }
    }
  }
}

// Export singleton instance
export default LocationService.getInstance();
