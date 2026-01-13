import mongoose, { Schema, Document } from "mongoose";

export interface IFamily extends Document {
  admin: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
}

const familySchema = new Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
});

export default mongoose.model("Family", familySchema);
