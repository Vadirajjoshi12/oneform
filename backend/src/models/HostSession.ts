import { Schema, model } from "mongoose";

const HostSessionSchema = new Schema(
  {
    poolId: {
      type: Schema.Types.ObjectId,
      ref: "Pool",
      required: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically delete expired sessions
HostSessionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export default model(
  "HostSession",
  HostSessionSchema
);