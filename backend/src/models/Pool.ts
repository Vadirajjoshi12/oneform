import { Schema, model } from "mongoose";
import MemberSchema from "./Member";
import MessageSchema from "./Message";

const PoolSchema = new Schema(
  {
    communityId: {
      type: String,
      required: true,
      index: true,
    },

    platform: {
      type: String,
      required: true,
      enum: [
        "Blinkit",
        "Zepto",
        "Instamart",
        "Swiggy",
      ],
    },

    pickupLocation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },

      coordinates: {
        type: [Number],
        required: true,
      },
    },

    radiusKm: {
      type: Number,
      default: 2,
    },

    targetThreshold: {
      type: Number,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "active",
        "threshold_met",
        "expired",
        "cancelled",
        "completed",
      ],
      default: "active",
    },

    deliveryStatus: {
    type: String,
    enum: [
      "Cart Open",
      "Target Reached",
      "Order Placed",
      "Preparing",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
      "Expired",
    ],
    default: "Cart Open",
},

    note: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    members: {
      type: [MemberSchema],
      default: [],
    },

    messages: {
      type: [MessageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

PoolSchema.index({
  location: "2dsphere",
});

export default model("Pool", PoolSchema);