import { Document } from "../models";
import type { CreateDocumentInput, DocumentUpdateInput } from "../validators";

export class DocumentService {
  async getDocuments(userId: string) {
    return Document.find({ userId });
  }

  async getDocumentById(id: string) {
    return await Document.findById(id);
  }

  async getDocumentsByType(userId: string, documentType: string) {
    return Document.find({ userId, documentType });
  }

  async createDocument(userId: string, document: CreateDocumentInput) {
    return await Document.create({ ...document, userId });
  }

  async updateDocument(id: string, document: DocumentUpdateInput) {
    return await Document.findByIdAndUpdate(id, document);
  }

  async deleteDocument(id: string) {
    return await Document.findByIdAndDelete(id);
  }
}
