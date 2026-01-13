import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import Upload from "../models/upload";

const UPLOAD_DIR = join(process.cwd(), "uploads");

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

export interface UploadResult {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
}

export class UploadService {
  async uploadFile(userId: string, file: File, baseUrl: string): Promise<UploadResult> {
    await ensureUploadDir();

    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}-${sanitizedName}`;
    const filepath = join(UPLOAD_DIR, filename);

    // Write file to disk
    const arrayBuffer = await file.arrayBuffer();
    await Bun.write(filepath, arrayBuffer);

    const url = `${baseUrl}/uploads/${filename}`;

    // Save to database
    const upload = await Upload.create({
      userId,
      filename,
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

  async uploadFiles(userId: string, files: File[], baseUrl: string): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (const file of files) {
      const result = await this.uploadFile(userId, file, baseUrl);
      results.push(result);
    }

    return results;
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
      const filepath = join(UPLOAD_DIR, upload.filename);
      try {
        await Bun.file(filepath).exists() && await Bun.write(filepath, "");
        // Note: Bun doesn't have a direct delete, using unlink from node:fs
        const { unlink } = await import("node:fs/promises");
        await unlink(filepath);
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }
    return Upload.findByIdAndDelete(id);
  }
}
