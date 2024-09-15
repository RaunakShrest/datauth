import mongoose from "mongoose"

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
    itemsSold: {
      type: [
        {
          item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProductItem",
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
          },
        },
      ],
      required: true,
      default: [],
    },
    soldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
)

const CustomerInfoModel = mongoose.model("CustomerInfo", customerInfo)

export { CustomerInfoModel }
