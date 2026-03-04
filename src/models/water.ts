import mongoose, { Schema, Document } from "mongoose";

export interface IWater extends Document {
  userId: mongoose.Types.ObjectId;
  dateRecorded: Date;
  glasses: number;
  createdAt: Date;
  updatedAt: Date;
}

const waterSchema = new Schema<IWater>(
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
    glasses: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

waterSchema.index({ userId: 1, dateRecorded: 1 }, { unique: true });

export default mongoose.model<IWater>("Water", waterSchema);
