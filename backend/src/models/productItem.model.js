import mongoose from "mongoose";
import { config } from "dotenv";

config();

const productItemSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      rquired: true,
    },
    productDescription: {
      type: String,
      required: true,
    },
    productPrice: {
      type: Number,
      required: true,
    },
    productSku: {
      type: String,
      required: true,
      unique: true,
    },
    batchId: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
        required: true,
      },
      batchId: { type: String, required: true },
    },
    productStatus: {
      type: String,
      enum: [
        process.env.PRODUCT_ITEM_STATUS_PENDING,
        process.env.PRODUCT_ITEM_STATUS_COMPLETED,
        process.env.PRODUCT_ITEM_STATUS_CANCELLED,
      ],
      default: process.env.PRODUCT_ITEM_STATUS_PENDING,
      required: true,
    },
    productType: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ProductType",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
      },
    ],

    productManufacturer: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      companyName: {
        type: String,
        required: true,
      },
    },
    productAttributes: [
      {
        attributeName: {
          type: String,
          required: true,
        },
        attributeValue: {
          type: String,
          required: true,
        },
      },
    ],
    slug: {
      type: String,
      unique: true,
      required: true,
    },
    qrUrl: {
      type: String,
    },
    productImages: [
      {
        type: String,
        required: true,
      },
    ],

    soldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    purchasedStatus: {
      type: Boolean,
      default: false,
      required: true,
    },
    productWebLink: {
      type: String,
    },
  },

  { timestamps: true }
);

const ProductItemModel = mongoose.model("ProductItem", productItemSchema);

export { ProductItemModel };
