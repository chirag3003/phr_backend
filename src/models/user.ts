import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  phoneNumber: string;
}

const userSchema = new Schema({
  phoneNumber: {
    type: String,
    required: true,
  },
});

export default mongoose.model('User', userSchema);
