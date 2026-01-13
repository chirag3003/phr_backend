import mongoose, { Schema, Document } from 'mongoose';

export interface IMeal extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  detail: string;
  type: string;
  mealImage?: string;
  calories: number;
  protein: number;
  carbs: number;
  fiber: number;
  dateRecorded: Date;
  time: string;
  addedBy: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const mealSchema = new Schema<IMeal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    detail: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
    },
    mealImage: {
      type: String,
      trim: true,
    },
    calories: {
      type: Number,
      required: true,
      min: 0,
    },
    protein: {
      type: Number,
      required: true,
      min: 0,
    },
    carbs: {
      type: Number,
      required: true,
      min: 0,
    },
    fiber: {
      type: Number,
      required: true,
      min: 0,
    },
    dateRecorded: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    addedBy: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient user-based and date-based queries
mealSchema.index({ userId: 1, dateRecorded: -1 });
mealSchema.index({ userId: 1, type: 1 });

export default mongoose.model<IMeal>('Meal', mealSchema);
