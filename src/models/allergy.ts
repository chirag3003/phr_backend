import mongoose, { Schema, Document } from 'mongoose';

export interface IAllergy extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  severity: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const allergySchema = new Schema<IAllergy>(
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
    severity: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High'],
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

// Index for efficient user-based queries
allergySchema.index({ userId: 1 });

export default mongoose.model<IAllergy>('Allergy', allergySchema);
