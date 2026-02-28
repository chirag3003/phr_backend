import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import Upload from "../models/upload";
import { buildObjectKey, buildPublicUrl, getS3Client, getStorageConfig } from "../config/storage";


export interface UploadResult {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
}

export class UploadService {
  async uploadFile(
    userId: string,
    file: File,
    options?: { folder?: string },
  ): Promise<UploadResult> {
    const s3 = getS3Client();
    const { bucket } = getStorageConfig();
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}-${sanitizedName}`;
    const folder = options?.folder;
    const key = buildObjectKey(filename, folder);
    const arrayBuffer = await file.arrayBuffer();

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: Buffer.from(arrayBuffer),
        ContentType: file.type || "application/octet-stream",
        ACL: "public-read",
      }),
    );

    const url = buildPublicUrl(key);

    const upload = await Upload.create({
      userId,
      filename: key,
      originalName: file.name,
      mimetype: file.type,
      size: file.size,
      url,
    });

    return {
      filename: upload.filename,
      originalName: upload.originalName,
      mimetype: upload.mimetype,
      size: upload.size,
      url: upload.url,
    };
  }

  async uploadFiles(
    userId: string,
    files: File[],
    options?: { folder?: string },
  ): Promise<UploadResult[]> {
    return Promise.all(files.map((file) => this.uploadFile(userId, file, options)));
  }

  async getUploadsByUserId(userId: string) {
    return Upload.find({ userId });
  }

  async getUploadById(id: string) {
    return Upload.findById(id);
  }

  async deleteUpload(id: string) {
    const upload = await Upload.findById(id);
    if (upload) {
      try {
        const s3 = getS3Client();
        const { bucket } = getStorageConfig();
        const key = upload.filename;
        await s3.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
          }),
        );
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }
    return Upload.findByIdAndDelete(id);
  }
}
