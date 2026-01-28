import type { Context } from "hono";
import { DocumentService, UploadService } from "../services";
import { StatusCodes } from "http-status-codes";
import { createDocumentSchema, updateDocumentSchema } from "../validators";

const documentService = new DocumentService();
const uploadService = new UploadService();

export class DocumentController {
  async getDocuments(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const documents = await documentService.getDocuments(userId);
      return ctx.json(documents, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getDocumentById(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      const document = await documentService.getDocumentById(id);
      if (!document) {
        return ctx.json(
          { error: "Document not found" },
          StatusCodes.NOT_FOUND,
        );
      }
      return ctx.json(document, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getDocumentsByType(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const documentType = ctx.req.query("documentType") as
        | "Prescription"
        | "Report";

      if (!documentType || !["Prescription", "Report"].includes(documentType)) {
        return ctx.json(
          { error: "Invalid document type. Must be 'Prescription' or 'Report'" },
          StatusCodes.BAD_REQUEST,
        );
      }

      const documents = await documentService.getDocumentsByType(
        userId,
        documentType,
      );
      return ctx.json(documents, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getDocumentsByDoctor(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const docDoctorId = ctx.req.param("docDoctorId");

      if (!docDoctorId) {
        return ctx.json(
          { error: "Doctor ID is required" },
          StatusCodes.BAD_REQUEST,
        );
      }

      const documents = await documentService.getDocumentsByDoctor(
        userId,
        docDoctorId,
      );
      return ctx.json(documents, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async createDocument(ctx: Context) {
    try {
      const userId = ctx.get("userId");
      const formData = await ctx.req.formData();

      // Get the file
      const file = formData.get("file") as File | null;
      if (!file) {
        return ctx.json(
          { error: "File is required" },
          StatusCodes.BAD_REQUEST,
        );
      }

      // Parse document data from form
      const documentType = formData.get("documentType") as string;
      const date = formData.get("date") as string;
      const docDoctorId = formData.get("docDoctorId") as string | null;
      const title = formData.get("title") as string | null;

      // Build the data object based on document type
      const documentData: Record<string, unknown> = { documentType, date };
      if (documentType === "Prescription" && docDoctorId) {
        documentData.docDoctorId = docDoctorId;
      }
      if (documentType === "Report" && title) {
        documentData.title = title;
      }

      // Validate the document data
      const validatedData = createDocumentSchema.parse(documentData);

      // Upload the file
      // const baseUrl = new URL(ctx.req.url).origin;
      const baseUrl = "https://phr.chirag.codes";
      const uploadResult = await uploadService.uploadFile(userId, file, baseUrl);

      // Create document with file URL and size
      const createdDocument = await documentService.createDocument(userId, {
        ...validatedData,
        fileUrl: uploadResult.url,
        fileSize: formatFileSize(uploadResult.size),
      });

      return ctx.json(createdDocument, StatusCodes.CREATED);
    } catch (err) {
      console.error(err);
      return ctx.json(
        { error: err instanceof Error ? err.message : "Internal server error" },
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateDocument(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      const body = updateDocumentSchema.parse(await ctx.req.json());
      const updatedDocument = await documentService.updateDocument(id, body);
      if (!updatedDocument) {
        return ctx.json(
          { error: "Document not found" },
          StatusCodes.NOT_FOUND,
        );
      }
      return ctx.json(updatedDocument, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteDocument(ctx: Context) {
    try {
      const id = ctx.req.param("id");
      const deleted = await documentService.deleteDocument(id);
      if (!deleted) {
        return ctx.json(
          { error: "Document not found" },
          StatusCodes.NOT_FOUND,
        );
      }
      return ctx.json({ message: "Document deleted successfully" }, StatusCodes.OK);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
