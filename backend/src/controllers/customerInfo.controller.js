import { CustomerInfoModel } from "../models/customerInfo.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ProductItemModel } from "../models/productItem.model.js";
import { UserModel } from "../models/user.model.js";

const postCustomerInfo = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, soldProducts, soldBy } = req.body;

    // Validate the required fields
    if (!name || !email || !soldProducts || !soldBy) {
      throw new ApiError(400, "Missing required fields");
    }

    // Check if the product and user exist
    const productExists = await ProductItemModel.findById(soldProducts);
    const userExists = await UserModel.findById(soldBy);

    if (!productExists) {
      throw new ApiError(404, "Product not found");
    }

    if (!userExists) {
      throw new ApiError(404, "User not found");
    }

    if (productExists.productStatus === "completed") {
      throw new ApiError(400, "Cannot assign another customer. The product is already marked as completed.");
    }

    const newCustomerInfo = new CustomerInfoModel({
      name,
      email,
      phoneNumber,
      soldProducts,
      soldBy,
    });

    await newCustomerInfo.save();
    await ProductItemModel.findByIdAndUpdate(
      soldProducts,
      { productStatus: 'completed' },
      { new: true } // Option to return the updated document
    );

    res.status(201).json(new ApiResponse(201, "Customer info created successfully", newCustomerInfo));
  } catch (error) {
    next(error);
  }
};


export { postCustomerInfo };
