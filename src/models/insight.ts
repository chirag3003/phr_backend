import mongoose, { Schema, Document } from "mongoose";

export type InsightType = "meal" | "glucose" | "water" | "activity";

export interface IInsight extends Document {
  userId: mongoose.Types.ObjectId;
  type: InsightType;
  dateKey: string;
  payload: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const insightSchema = new Schema<IInsight>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["meal", "glucose", "water", "activity"],
    },
    dateKey: {
      type: String,
      required: true,
      trim: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

insightSchema.index({ userId: 1, type: 1, dateKey: 1 }, { unique: true });

export default mongoose.model<IInsight>("Insight", insightSchema);
