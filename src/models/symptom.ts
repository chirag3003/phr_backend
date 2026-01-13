import mongoose, { Schema, Document } from 'mongoose';

export interface ISymptom extends Document {
  userId: mongoose.Types.ObjectId;
  symptomName: string;
  intensity: string;
  dateRecorded: Date;
  time: {
    hour: number;
    minute: number;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const symptomSchema = new Schema<ISymptom>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    symptomName: {
      type: String,
      required: true,
      trim: true,
    },
    intensity: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High', 'Severe'],
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
symptomSchema.index({ userId: 1, dateRecorded: -1 });

export default mongoose.model<ISymptom>('Symptom', symptomSchema);
