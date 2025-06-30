import { OfflineQueueItem, MediaItem, InspectionData, MapPin } from "@/types";

interface SyncStatus {
  isOnline: boolean;
  pendingItems: number;
  lastSyncTime: Date | null;
  syncInProgress: boolean;
}

class OfflineService {
  private static instance: OfflineService;
  private syncQueue: OfflineQueueItem[] = [];
  private isOnline: boolean = navigator.onLine;
  private syncCallbacks: Set<(status: SyncStatus) => void> = new Set();
  private syncInProgress: boolean = false;
  private lastSyncTime: Date | null = null;

  private constructor() {
    this.initializeEventListeners();
    this.loadQueueFromStorage();
  }

  static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  private initializeEventListeners(): void {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.notifyStatusChange();
      this.processSyncQueue();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.notifyStatusChange();
    });

    // Auto-sync on visibility change
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && this.isOnline && this.syncQueue.length > 0) {
        this.processSyncQueue();
      }
    });
  }

  /**
   * Add item to sync queue
   */
  addToQueue(
    type: "inspection" | "media-upload" | "pin-save",
    data: InspectionData | MediaItem | MapPin,
    priority: number = 1
  ): void {
    const queueItem: OfflineQueueItem = {
      id: crypto.randomUUID(),
      type,
      data,
      priority,
      attempts: 0,
      maxAttempts: 3,
    };

    this.syncQueue.push(queueItem);
    this.syncQueue.sort((a, b) => b.priority - a.priority); // Higher priority first
    this.saveQueueToStorage();
    this.notifyStatusChange();

    // Try to sync immediately if online
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  /**
   * Process the sync queue
   */
  async processSyncQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    this.notifyStatusChange();

    const itemsToProcess = [...this.syncQueue];

    for (const item of itemsToProcess) {
      try {
        await this.processSyncItem(item);
        this.removeFromQueue(item.id);
      } catch (error) {
        console.error(`Sync failed for item ${item.id}:`, error);
        this.handleSyncError(item, error as Error);
      }
    }

    this.syncInProgress = false;
    this.lastSyncTime = new Date();
    this.saveQueueToStorage();
    this.notifyStatusChange();
  }

  /**
   * Process individual sync item
   */
  private async processSyncItem(item: OfflineQueueItem): Promise<void> {
    item.attempts++;
    item.lastAttempt = new Date();

    switch (item.type) {
      case "inspection":
        await this.syncInspection(item.data as InspectionData);
        break;
      case "media-upload":
        await this.syncMediaUpload(item.data as MediaItem);
        break;
      case "pin-save":
        await this.syncPinSave(item.data as MapPin);
        break;
      default:
        throw new Error(`Unknown sync type: ${item.type}`);
    }
  }

  /**
   * Sync inspection data
   */
  private async syncInspection(inspection: InspectionData): Promise<void> {
    // In a real app, this would call your API
    const response = await fetch("/api/inspections", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inspection),
    });

    if (!response.ok) {
      throw new Error(`Inspection sync failed: ${response.statusText}`);
    }
  }

  /**
   * Sync media upload
   */
  private async syncMediaUpload(media: MediaItem): Promise<void> {
    // In a real app, this would upload to S3 and update the database
    const response = await fetch("/api/media/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(media),
    });

    if (!response.ok) {
      throw new Error(`Media sync failed: ${response.statusText}`);
    }
  }

  /**
   * Sync pin save
   */
  private async syncPinSave(pinData: MapPin): Promise<void> {
    const response = await fetch("/api/pins", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pinData),
    });

    if (!response.ok) {
      throw new Error(`Pin sync failed: ${response.statusText}`);
    }
  }

  /**
   * Handle sync error
   */
  private handleSyncError(item: OfflineQueueItem, error: Error): void {
    item.error = error.message;

    if (item.attempts >= item.maxAttempts) {
      console.warn(`Max attempts reached for item ${item.id}, removing from queue`);
      this.removeFromQueue(item.id);
    }
  }

  /**
   * Remove item from queue
   */
  removeFromQueue(itemId: string): void {
    this.syncQueue = this.syncQueue.filter((item) => item.id !== itemId);
    this.saveQueueToStorage();
    this.notifyStatusChange();
  }

  /**
   * Clear all items from queue
   */
  clearQueue(): void {
    this.syncQueue = [];
    this.saveQueueToStorage();
    this.notifyStatusChange();
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      pendingItems: this.syncQueue.length,
      lastSyncTime: this.lastSyncTime,
      syncInProgress: this.syncInProgress,
    };
  }

  /**
   * Subscribe to sync status changes
   */
  onStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.syncCallbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.syncCallbacks.delete(callback);
    };
  }

  /**
   * Get pending items by type
   */
  getPendingItemsByType(type: "inspection" | "media-upload" | "pin-save"): OfflineQueueItem[] {
    return this.syncQueue.filter((item) => item.type === type);
  }

  /**
   * Force sync now
   */
  async forcSync(): Promise<void> {
    if (!this.isOnline) {
      throw new Error("Cannot sync while offline");
    }

    await this.processSyncQueue();
  }

  /**
   * Retry failed item
   */
  retryItem(itemId: string): void {
    const item = this.syncQueue.find((q) => q.id === itemId);
    if (item) {
      item.attempts = 0;
      item.error = undefined;

      if (this.isOnline) {
        this.processSyncQueue();
      }
    }
  }

  /**
   * Check if data needs to be compressed for offline storage
   */
  shouldCompressForOffline(dataSize: number): boolean {
    // Compress if data is larger than 1MB
    return dataSize > 1024 * 1024;
  }

  /**
   * Estimate sync time
   */
  estimateSyncTime(): number {
    // Rough estimation: 2 seconds per item
    return this.syncQueue.length * 2000;
  }

  /**
   * Get storage usage for offline data
   */
  getOfflineStorageUsage(): number {
    const queueSize = JSON.stringify(this.syncQueue).length;
    const localStorageSize = new Blob([localStorage.getItem("restoInspect_offlineQueue") || ""]).size;
    return queueSize + localStorageSize;
  }

  private notifyStatusChange(): void {
    const status = this.getSyncStatus();
    this.syncCallbacks.forEach((callback) => {
      try {
        callback(status);
      } catch (error) {
        console.error("Status callback error:", error);
      }
    });
  }

  private saveQueueToStorage(): void {
    try {
      localStorage.setItem("restoInspect_offlineQueue", JSON.stringify(this.syncQueue));
      localStorage.setItem("restoInspect_lastSyncTime", this.lastSyncTime?.toISOString() || "");
    } catch (error) {
      console.error("Failed to save queue to storage:", error);
    }
  }

  private loadQueueFromStorage(): void {
    try {
      const savedQueue = localStorage.getItem("restoInspect_offlineQueue");
      const savedSyncTime = localStorage.getItem("restoInspect_lastSyncTime");

      if (savedQueue) {
        this.syncQueue = JSON.parse(savedQueue);
      }

      if (savedSyncTime) {
        this.lastSyncTime = new Date(savedSyncTime);
      }
    } catch (error) {
      console.error("Failed to load queue from storage:", error);
      this.syncQueue = [];
    }
  }
}

// Export singleton instance
export default OfflineService.getInstance();
