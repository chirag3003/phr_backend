import { Document } from "../models";
import type { CreateDocumentInput, DocumentUpdateInput } from "../validators";
import mongoose from "mongoose";

export class DocumentService {
  async getDocuments(userId: string) {
    return Document.find({ userId }).populate("docDoctorId").sort({ date: -1 });
  }

  async getDocumentById(id: string) {
    return await Document.findById(id).populate("docDoctorId");
  }

  async getDocumentsByType(
    userId: string,
    documentType: "Prescription" | "Report",
  ) {
    return Document.find({ userId, documentType })
      .populate("docDoctorId")
      .sort({ date: -1 });
  }

  async getDocumentsByDoctor(userId: string, docDoctorId: string) {
    return Document.find({
      userId,
      docDoctorId: new mongoose.Types.ObjectId(docDoctorId),
      documentType: "Prescription",
    })
      .populate("docDoctorId")
      .sort({ date: -1 });
  }

  async createDocument(userId: string, document: CreateDocumentInput) {
    const docData = {
      ...document,
      userId,
      docDoctorId:
        "docDoctorId" in document
          ? new mongoose.Types.ObjectId(document.docDoctorId)
          : undefined,
    };
    return await Document.create(docData);
  }

  async updateDocument(id: string, document: DocumentUpdateInput) {
    const updateData = {
      ...document,
      docDoctorId: document.docDoctorId
        ? new mongoose.Types.ObjectId(document.docDoctorId)
        : undefined,
    };
    return await Document.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("docDoctorId");
  }

  async deleteDocument(id: string) {
    return await Document.findByIdAndDelete(id);
  }
}
