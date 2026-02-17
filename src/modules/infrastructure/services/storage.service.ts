import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * StorageService handles file uploads and secure access
 * 
 * Supports: S3, Cloudinary, or local storage
 * Provides signed URLs for private documents
 */
@Injectable()
export class StorageService {
    private readonly storageProvider: string;
    private readonly bucketName: string;

    constructor(private configService: ConfigService) {
        this.storageProvider = this.configService.get('STORAGE_PROVIDER', 'local');
        this.bucketName = this.configService.get('S3_BUCKET_NAME', '');
    }

    /**
     * Upload a file to storage
     * 
     * @param file File buffer or stream
     * @param filename Destination filename
     * @param folder Optional folder/prefix
     * @returns Public or private URL
     */
    async uploadFile(
        file: Buffer | ReadableStream,
        filename: string,
        folder?: string,
    ): Promise<{ url: string; key: string }> {
        const key = folder ? `${folder}/${filename}` : filename;

        if (this.storageProvider === 's3') {
            return this.uploadToS3(file, key);
        } else if (this.storageProvider === 'cloudinary') {
            return this.uploadToCloudinary(file, key);
        } else {
            // Local storage fallback
            return this.uploadToLocal(file, key);
        }
    }

    /**
     * Generate signed URL for private document access
     * 
     * @param key Storage key/path
     * @param expiresIn Expiration time in seconds (default: 1 hour)
     * @returns Temporary signed URL
     */
    async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
        if (this.storageProvider === 's3') {
            return this.getS3SignedUrl(key, expiresIn);
        } else if (this.storageProvider === 'cloudinary') {
            return this.getCloudinarySignedUrl(key, expiresIn);
        } else {
            // Local storage - return direct path (not secure in production)
            return `/uploads/${key}`;
        }
    }

    /**
     * Delete a file from storage
     */
    async deleteFile(key: string): Promise<void> {
        if (this.storageProvider === 's3') {
            await this.deleteFromS3(key);
        } else if (this.storageProvider === 'cloudinary') {
            await this.deleteFromCloudinary(key);
        } else {
            await this.deleteFromLocal(key);
        }
    }

    // ============================================
    // S3 Implementation
    // ============================================

    private async uploadToS3(
        file: any,
        key: string,
    ): Promise<{ url: string; key: string }> {
        // Placeholder for S3 upload
        // In production, use AWS SDK:
        // const uploadParams = {
        //   Bucket: this.bucketName,
        //   Key: key,
        //   Body: file,
        //   ACL: 'private', // IMPORTANT: No public access
        // };
        // const result = await s3.upload(uploadParams).promise();
        // return { url: result.Location, key: result.Key };

        console.log(`📦 [S3] Would upload: ${key}`);
        return {
            url: `https://${this.bucketName}.s3.amazonaws.com/${key}`,
            key,
        };
    }

    private async getS3SignedUrl(key: string, expiresIn: number): Promise<string> {
        // Placeholder for S3 signed URL
        // In production, use AWS SDK:
        // const params = {
        //   Bucket: this.bucketName,
        //   Key: key,
        //   Expires: expiresIn,
        // };
        // return s3.getSignedUrl('getObject', params);

        console.log(`🔐 [S3] Generating signed URL for: ${key} (expires in ${expiresIn}s)`);
        return `https://${this.bucketName}.s3.amazonaws.com/${key}?expires=${expiresIn}`;
    }

    private async deleteFromS3(key: string): Promise<void> {
        console.log(`🗑️ [S3] Would delete: ${key}`);
    }

    // ============================================
    // Cloudinary Implementation
    // ============================================

    private async uploadToCloudinary(
        file: any,
        key: string,
    ): Promise<{ url: string; key: string }> {
        // Placeholder for Cloudinary upload
        // In production, use Cloudinary SDK:
        // const result = await cloudinary.uploader.upload(file, {
        //   folder: 'ums-documents',
        //   public_id: key,
        //   resource_type: 'auto',
        // });
        // return { url: result.secure_url, key: result.public_id };

        console.log(`📦 [Cloudinary] Would upload: ${key}`);
        return {
            url: `https://res.cloudinary.com/your-cloud/ums-documents/${key}`,
            key,
        };
    }

    private async getCloudinarySignedUrl(
        key: string,
        expiresIn: number,
    ): Promise<string> {
        // Placeholder for Cloudinary signed URL
        console.log(`🔐 [Cloudinary] Generating signed URL for: ${key}`);
        return `https://res.cloudinary.com/your-cloud/authenticated/${key}`;
    }

    private async deleteFromCloudinary(key: string): Promise<void> {
        console.log(`🗑️ [Cloudinary] Would delete: ${key}`);
    }

    // ============================================
    // Local Storage Implementation (Development)
    // ============================================

    private async uploadToLocal(
        file: any,
        key: string,
    ): Promise<{ url: string; key: string }> {
        // Placeholder for local file system
        // In production, use fs module
        console.log(`📦 [Local] Would save to: ./uploads/${key}`);
        return {
            url: `/uploads/${key}`,
            key,
        };
    }

    private async deleteFromLocal(key: string): Promise<void> {
        console.log(`🗑️ [Local] Would delete: ./uploads/${key}`);
    }
}
