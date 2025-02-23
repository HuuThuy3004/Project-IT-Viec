import {
  Body,
  Controller,
  Delete,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { Public } from 'src/commons/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { UploadedFileDto } from './dtos/upload-file.dto';
import { File } from 'src/commons/types/interfaces';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Public()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UploadedFileDto,
  })
  @Post('/upload/image')
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    // const filePath = `/images/${Date.now()}/${file.originalname}` -> cách này nó sẽ hiển thị 2 folder
    // const filePath = `/images/${Date.now()}-${file.originalname}` -> cách này nó ko hiển thị 2 folder mà nó sẽ hiển hiện thị tên file ảnh mới được nối từ: Date.now() + file

    // Validate the uploaded file type
    const validMineType = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validMineType.includes(file.mimetype)) {
      throw new Error(
        'Invalid file type. Only JPEG, PNG, and GIF are allowed.',
      );
    }

    // Validate size of uploaded ( <5MB )
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size is too large. Maximum allowed size is 5MB.');
    }

    // Upload the file to the server
    const filePath = `/images/${file.originalname}`;
    const uploadResult = await this.storageService.uploadImage(
      filePath,
      file.buffer,
    );
    const publicUrl = await this.storageService.getSignedUrl(uploadResult.path);

    return {
      message: 'Image uploaded successfully',
      result: {
        publicUrl,
        path: uploadResult.path,
      },
    };
  }

  @Public()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UploadedFileDto,
  })
  @Post('/upload/cv')
  async uploadFilePdf(@UploadedFile() file: Express.Multer.File) {
    const [fileName, fileType] = file.originalname.split('.');

    // Validate the uploaded file type
    const validMineType = ['pdf', 'doc', 'docx', 'xlsx'];
    if (!validMineType.includes(fileType)) {
      throw new Error(
        'Invalid file type. Only JPEG, PNG, and GIF are allowed.',
      );
    }

    // Validate size of uploaded ( <3MB )
    const maxSize = 3 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size is too large. Maximum allowed size is 3MB.');
    }

    // Upload the file to the server
    const filePath = `/cvs/${file.originalname}`;
    const uploadResult = await this.storageService.uploadImage(
      filePath,
      file.buffer,
    );
    const publicUrl = await this.storageService.getSignedUrl(uploadResult.path);

    return {
      message: 'CV uploaded successfully',
      result: {
        publicUrl,
        path: uploadResult.path,
      },
    };
  }

  @Public()
  @Delete('/delete')
  @ApiBody({ type: File })
  async deleteFile(@Body() body: File) {
    // const result1 = await this.storageService.deleteFile('images/' + body.path);
    // const result2 = await this.storageService.deleteFile('cvs/' + body.path);
    const result = await this.storageService.deleteFile(body.path);
    
    return {
        message: 'File deleted successfully',
        result,
    }
  }
}
