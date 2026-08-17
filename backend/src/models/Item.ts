import { Schema } from "mongoose";

const ItemSchema = new Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    _id: true,
  }
);

export default ItemSchema;