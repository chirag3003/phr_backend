import mongoose, { Schema, Document } from "mongoose";

export interface IFamilyPermission extends Document {
  userId: mongoose.Types.ObjectId;
  family: mongoose.Types.ObjectId;
  permissionTo: mongoose.Types.ObjectId;
  write: boolean;
  permissions: {
    documents: boolean;
    symptoms: boolean;
    meals: boolean;
    trends: boolean;
  };
}

const familyPermissionSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  family: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Family",
    required: true,
  },
  permissionTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  write:{
    type: Boolean,
    default: false,
  },
  permissions: {
    documents: {
      type: Boolean,
      default: false,
    },
    symptoms: {
      type: Boolean,
      default: false,
    },
    meals: {
      type: Boolean,
      default: false,
    },
    trends: {
      type: Boolean,
      default: false,
    },
  },
});

export default mongoose.model("FamilyPermission", familyPermissionSchema);
