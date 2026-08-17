import { Schema } from "mongoose";

const MessageSchema = new Schema(
  {
    sender: {
      type: String,
      required: true,
    },

    text: {
      type: String,
      required: true,
    },

    isHost: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

export default MessageSchema;