import mongoose, { Schema, Document } from "mongoose";

export interface IDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  documentType: string;
  fileUrl: string;
  fileSize?: string;
  lastUpdatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    documentType: {
      type: String,
      required: true,
      enum: ["Prescription", "Report", "LabResult", "Other"],
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: String,
      trim: true,
    },
    lastUpdatedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient user-based and type-based queries
documentSchema.index({ userId: 1, documentType: 1 });
documentSchema.index({ userId: 1, lastUpdatedAt: -1 });

export default mongoose.model<IDocument>("Document", documentSchema);
