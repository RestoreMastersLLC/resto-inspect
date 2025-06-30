import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { MediaItem } from "@/types";
import Compressor from "compressorjs";

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  quality?: "low" | "medium" | "high";
  maxWidth?: number;
  maxHeight?: number;
}

class StorageService {
  private static instance: StorageService;
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  private constructor() {
    this.region = process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1";
    this.bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || "";

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || "",
      },
    });
  }

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Compress image based on quality settings
   */
  private compressImage(file: File, quality: "low" | "medium" | "high" = "medium"): Promise<File> {
    return new Promise((resolve) => {
      const qualityMap = {
        low: 0.3,
        medium: 0.6,
        high: 0.8,
      };

      const maxWidthMap = {
        low: 800,
        medium: 1200,
        high: 1920,
      };

      new Compressor(file, {
        quality: qualityMap[quality],
        maxWidth: maxWidthMap[quality],
        maxHeight: maxWidthMap[quality],
        convertSize: 1000000, // Convert to JPEG if larger than 1MB
        success: (compressedFile) => {
          resolve(compressedFile as File);
        },
        error: (error) => {
          console.error("Compression error:", error);
          // Return original file if compression fails
          resolve(file);
        },
      });
    });
  }

  /**
   * Generate unique filename with timestamp and random suffix
   */
  private generateFileName(originalName: string, prefix: string = "media"): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split(".").pop() || "";
    return `${prefix}/${timestamp}-${randomSuffix}.${extension}`;
  }

  /**
   * Upload file to S3
   */
  async uploadFile(
    file: File,
    options: UploadOptions = {}
  ): Promise<{ url: string; key: string; compressedSize?: number }> {
    try {
      let fileToUpload = file;
      let compressedSize: number | undefined;

      // Compress image if it's an image file
      if (file.type.startsWith("image/")) {
        const compressedFile = await this.compressImage(file, options.quality);
        fileToUpload = compressedFile;
        compressedSize = compressedFile.size;
      }

      const key = this.generateFileName(file.name);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileToUpload,
        ContentType: file.type,
        Metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      });

      // Upload to S3
      await this.s3Client.send(command);

      // Generate public URL
      const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

      // Simulate progress callback
      if (options.onProgress) {
        options.onProgress({
          loaded: fileToUpload.size,
          total: fileToUpload.size,
          percentage: 100,
        });
      }

      return {
        url,
        key,
        compressedSize,
      };
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error(`Upload failed: ${error}`);
    }
  }

  /**
   * Upload multiple files with progress tracking
   */
  async uploadMultipleFiles(
    files: File[],
    options: UploadOptions & {
      onFileProgress?: (fileIndex: number, progress: UploadProgress) => void;
      onOverallProgress?: (progress: UploadProgress) => void;
    } = {}
  ): Promise<Array<{ url: string; key: string; compressedSize?: number }>> {
    const results: Array<{ url: string; key: string; compressedSize?: number }> = [];
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    let uploadedSize = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        const result = await this.uploadFile(file, {
          ...options,
          onProgress: (progress) => {
            options.onFileProgress?.(i, progress);

            const currentFileProgress = (progress.loaded / progress.total) * file.size;
            const overallProgress = {
              loaded: uploadedSize + currentFileProgress,
              total: totalSize,
              percentage: Math.round(((uploadedSize + currentFileProgress) / totalSize) * 100),
            };

            options.onOverallProgress?.(overallProgress);
          },
        });

        results.push(result);
        uploadedSize += file.size;
      } catch (error) {
        console.error(`Failed to upload file ${i}:`, error);
        throw error;
      }
    }

    return results;
  }

  /**
   * Create MediaItem from uploaded file
   */
  async createMediaItem(
    file: File,
    options: UploadOptions & {
      tags?: string[];
      ownerInfo?: {
        name: string;
        email: string;
        phone: string;
        role: string;
      };
      location?: GeolocationCoordinates;
    } = {}
  ): Promise<MediaItem> {
    const uploadResult = await this.uploadFile(file, options);

    // Create thumbnail for videos (in real app, you'd use a video processing service)
    const thumbnail = file.type.startsWith("video/") ? "/api/video-thumbnail/" + uploadResult.key : uploadResult.url;

    const mediaItem: MediaItem = {
      id: crypto.randomUUID(),
      type: file.type.startsWith("video/") ? "video" : "photo",
      url: uploadResult.url,
      thumbnail,
      filename: file.name,
      size: file.size,
      compressedSize: uploadResult.compressedSize,
      timestamp: new Date(),
      location: options.location,
      tags: options.tags || [],
      ownerInfo: options.ownerInfo,
      uploadStatus: "completed",
      isCompressed: !!uploadResult.compressedSize,
      quality: options.quality || "medium",
    };

    return mediaItem;
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error("Delete error:", error);
      throw new Error(`Delete failed: ${error}`);
    }
  }

  /**
   * Generate presigned URL for direct upload (for large files)
   */
  async generatePresignedUrl(filename: string, contentType: string): Promise<string> {
    // In a real implementation, you'd generate a presigned URL with expiration
    // For now, return a placeholder
    console.log("Content type:", contentType); // Avoid unused parameter warning
    const key = this.generateFileName(filename);
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * Check if S3 configuration is valid
   */
  isConfigured(): boolean {
    return !!(
      this.bucketName &&
      process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID &&
      process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY
    );
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    usedSpace: string;
  }> {
    // In a real implementation, you'd query S3 for statistics
    // For now, return mock data
    return {
      totalFiles: 0,
      totalSize: 0,
      usedSpace: "0 MB",
    };
  }

  /**
   * Batch upload with retry logic
   */
  async uploadWithRetry(
    file: File,
    options: UploadOptions & { maxRetries?: number } = {}
  ): Promise<{ url: string; key: string; compressedSize?: number }> {
    const maxRetries = options.maxRetries || 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.uploadFile(file, options);
      } catch (error) {
        lastError = error as Error;
        console.warn(`Upload attempt ${attempt} failed:`, error);

        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`Upload failed after ${maxRetries} attempts: ${lastError?.message || "Unknown error"}`);
  }
}

// Export singleton instance
export default StorageService.getInstance();
