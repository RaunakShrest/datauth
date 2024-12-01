import mongoose from "mongoose";
import { config } from "dotenv";

config();

const productTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        process.env.PRODUCT_TYPE_STATUS_ENABLED,
        process.env.PRODUCT_TYPE_STATUS_DISABLED,
      ],
      default: process.env.PRODUCT_TYPE_STATUS_DISABLED,
      required: true,
    },
    attributes: {
      type: [],
      default: [],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const ProductTypeModel = mongoose.model("ProductType", productTypeSchema);

export { ProductTypeModel };
