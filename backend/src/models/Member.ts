import { Schema } from "mongoose";
import ItemSchema from "./Item";

const MemberSchema = new Schema(
  {
    isHost: {
      type: Boolean,
      default: false,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    phone: {
      type: String,
      required: true,
    },

    cartTotal: {
      type: Number,
      default: 0,
    },

    items: {
      type: [ItemSchema],
      default: [],
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

export default MemberSchema;