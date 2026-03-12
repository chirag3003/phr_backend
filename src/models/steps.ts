import mongoose, { Schema, Document } from "mongoose";

export interface ISteps extends Document {
  userId: mongoose.Types.ObjectId;
  dateRecorded: Date;
  stepCount: number;
  source: "AppleHealthKit" | "GoogleFit" | "Manual";
  syncedAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const stepsSchema = new Schema<ISteps>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dateRecorded: {
      type: Date,
      required: true,
    },
    stepCount: {
      type: Number,
      required: true,
      min: 0,
    },
    source: {
      type: String,
      enum: ["AppleHealthKit", "GoogleFit", "Manual"],
      default: "AppleHealthKit",
      required: true,
    },
    syncedAt: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index: one entry per user per day
stepsSchema.index({ userId: 1, dateRecorded: 1 }, { unique: true });

// Index for efficient range queries
stepsSchema.index({ userId: 1, dateRecorded: -1 });

export default mongoose.model<ISteps>("Steps", stepsSchema);
