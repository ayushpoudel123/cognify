import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { CloudinaryService } from './cloudinary.service';
import { Public } from '../../common/decorators';

@ApiTags('Media Uploads')
@Controller('media')
export class MediaController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Public()
  @Post('upload')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload an image or video file to Cloudinary / storage' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|mp4|webm|quicktime)$/i)) {
          return callback(
            new BadRequestException('Unsupported file type. Allowed: jpg, jpeg, png, gif, webp, mp4, webm, quicktime'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is missing');
    }
    return this.cloudinaryService.uploadFile(file);
  }
}
