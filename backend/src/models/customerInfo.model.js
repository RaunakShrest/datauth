import mongoose from "mongoose";

const customerInfoSchema = new mongoose.Schema(
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
      required: true,
    },
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
    soldProducts: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductItem",
        required: true,
      },
      productName: { type: String, required: true },
      productPrice: { type: Number, required: true },
    },
    soldBy: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      companyName: { type: String, required: true },
    },
    batchId: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
        required: true,
      },
      batchId: { type: String, required: true },
    },

    orderId: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
      },
      orderNumber: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

customerInfoSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const lastCustomer = await this.constructor
        .findOne()
        .sort({ createdAt: -1 })
        .select("orderId.orderNumber");

      let newOrderNumber = "10001";
      if (
        lastCustomer &&
        lastCustomer.orderId &&
        lastCustomer.orderId.orderNumber
      ) {
        const lastOrderNum = parseInt(lastCustomer.orderId.orderNumber, 10);
        newOrderNumber = String(lastOrderNum + 1).padStart(5, "0");
      }
      this.orderId.orderNumber = newOrderNumber;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

const CustomerInfoModel = mongoose.model("CustomerInfo", customerInfoSchema);

export { CustomerInfoModel };
