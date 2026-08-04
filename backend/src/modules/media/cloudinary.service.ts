import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private isConfigured = false;

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.isConfigured = true;
      this.logger.log('Cloudinary initialized successfully.');
    } else {
      this.logger.warn(
        'Cloudinary environment variables missing. Falling back to local backend disk storage.',
      );
    }
  }

  async uploadFile(
    file: Express.Multer.File,
  ): Promise<{ url: string; filename: string; mimetype: string; size: number }> {
    if (this.isConfigured && file.buffer) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'cognify_uploads',
            resource_type: 'auto',
          },
          (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error || !result) {
              this.logger.error('Cloudinary upload error:', error);
              return reject(error || new Error('Upload to Cloudinary failed'));
            }
            resolve({
              url: result.secure_url,
              filename: result.public_id,
              mimetype: file.mimetype,
              size: result.bytes || file.size,
            });
          },
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    }

    // Fallback: Local disk storage if buffer exists or file saved locally
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || 'file.jpg');
    const filename = `file-${uniqueSuffix}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    if (file.buffer) {
      fs.writeFileSync(filePath, file.buffer);
    } else if (file.path && fs.existsSync(file.path)) {
      fs.copyFileSync(file.path, filePath);
    }

    const backendUrl =
      this.configService.get<string>('BACKEND_URL') ||
      `http://localhost:${this.configService.get('PORT') || 4000}`;
    const url = `${backendUrl}/uploads/${filename}`;

    return {
      url,
      filename,
      mimetype: file.mimetype,
      size: file.size,
    };
  }
}
