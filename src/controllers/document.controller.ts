import type { Context } from "hono";
import { DocumentService } from "../services";
import { StatusCodes } from "http-status-codes";
import { createDocumentSchema, updateDocumentSchema } from "../validators";

const documentService = new DocumentService();

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
      const body = createDocumentSchema.parse(await ctx.req.json());
      const createdDocument = await documentService.createDocument(userId, body);
      return ctx.json(createdDocument, StatusCodes.CREATED);
    } catch (err) {
      console.error(err);
      return ctx.json({}, StatusCodes.INTERNAL_SERVER_ERROR);
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
