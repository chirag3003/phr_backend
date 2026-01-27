import mongoose, { Schema, Document } from "mongoose";

export interface IDocument extends Document {
  userId: mongoose.Types.ObjectId;
  documentType: "Prescription" | "Report";
  // For Prescriptions - reference to the doctor
  docDoctorId?: mongoose.Types.ObjectId;
  // For Reports - title of the report
  title?: string;
  // Common fields
  date: Date;
  fileUrl: string;
  fileSize?: string;
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
    documentType: {
      type: String,
      required: true,
      enum: ["Prescription", "Report"],
    },
    docDoctorId: {
      type: Schema.Types.ObjectId,
      ref: "DocDoctor",
      required: function (this: IDocument) {
        return this.documentType === "Prescription";
      },
    },
    title: {
      type: String,
      trim: true,
      required: function (this: IDocument) {
        return this.documentType === "Report";
      },
    },
    date: {
      type: Date,
      required: true,
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
  },
  {
    timestamps: true,
  },
);

// Index for efficient user-based and type-based queries
documentSchema.index({ userId: 1, documentType: 1 });
documentSchema.index({ userId: 1, date: -1 });
documentSchema.index({ userId: 1, docDoctorId: 1 });

export default mongoose.model<IDocument>("Document", documentSchema);
