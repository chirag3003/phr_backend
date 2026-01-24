import mongoose, { Schema, Document } from "mongoose";

export interface IGlucose extends Document {
  userId: mongoose.Types.ObjectId;
  value: number;
  unit: "mg/dL" | "mmol/L";
  dateRecorded: Date;
  time: {
    hour: number;
    minute: number;
  };
  mealContext?: "Fasting" | "Before Meal" | "After Meal" | "Bedtime" | "Random";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const glucoseSchema = new Schema<IGlucose>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
      max: 1000,
    },
    unit: {
      type: String,
      enum: ["mg/dL", "mmol/L"],
      default: "mg/dL",
    },
    dateRecorded: {
      type: Date,
      required: true,
    },
    time: {
      hour: {
        type: Number,
        required: true,
        min: 0,
        max: 23,
      },
      minute: {
        type: Number,
        required: true,
        min: 0,
        max: 59,
      },
    },
    mealContext: {
      type: String,
      enum: ["Fasting", "Before Meal", "After Meal", "Bedtime", "Random"],
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

// Index for efficient querying by user and date
glucoseSchema.index({ userId: 1, dateRecorded: -1 });

export default mongoose.model<IGlucose>("Glucose", glucoseSchema);
