import mongoose, { Schema, Document } from "mongoose";

export interface IFamilyPermission extends Document {
  userId: mongoose.Types.ObjectId;
  permissionTo: mongoose.Types.ObjectId;
  write: boolean;
  permissions: {
    documents: boolean;
    symptoms: boolean;
    meals: boolean;
    glucose: boolean;
    allergies: boolean;
    water: boolean;
    steps: boolean;
  };
}

const familyPermissionSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
    glucose: {
      type: Boolean,
      default: false,
    },
    allergies: {
      type: Boolean,
      default: true,
    },
    water: {
      type: Boolean,
      default: false,
    },
    steps: {
      type: Boolean,
      default: false,
    },
  },
});

export default mongoose.model("FamilyPermission", familyPermissionSchema);
