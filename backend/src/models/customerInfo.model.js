import mongoose from "mongoose";

const customerInfo = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
    },
    productManufacturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductItem",
      required: true,
    },
    soldProducts: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductItem",
      required: true,
    },

    soldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const CustomerInfoModel = mongoose.model("CustomerInfo", customerInfo);

export { CustomerInfoModel };
