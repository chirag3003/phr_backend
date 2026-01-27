import mongoose, { Schema, Document } from "mongoose";

export interface IDocDoctor extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const docDoctorSchema = new Schema<IDocDoctor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient user-based queries
docDoctorSchema.index({ userId: 1 });

export default mongoose.model<IDocDoctor>("DocDoctor", docDoctorSchema);
