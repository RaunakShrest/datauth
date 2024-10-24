import { CustomerInfoModel } from "../models/customerInfo.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ProductItemModel } from "../models/productItem.model.js";
import { UserModel } from "../models/user.model.js";

const postCustomerInfo = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, soldProducts, soldBy } = req.body;
    if (!name || !email || !soldProducts || !soldBy) {
      throw new ApiError(400, "Missing required fields");
    }

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

    // Update the product with both soldBy and productStatus
    await ProductItemModel.findByIdAndUpdate(
      soldProducts,
      { 
        soldBy, // Update the soldBy field
        productStatus: 'completed' // Update the productStatus field to 'completed'
      },
      { new: true } // Option to return the updated document
    );

    res.status(201).json(new ApiResponse(201, "Customer info created successfully", newCustomerInfo));
  } catch (error) {
    next(error);
  }
};

const getSoldProductsByRetailer = async (req, res, next) => {
  try {
    const retailerId = req.user._id; 

    if (!retailerId) {
      throw new ApiError(400, "Retailer ID not found");
    }

    // Find all customer info documents where soldBy matches the logged-in retailer's ID
    const customerInfo = await CustomerInfoModel.find({ soldBy: retailerId })
      .populate("soldProducts") // Populate sold products info
      .exec();

    if (!customerInfo.length) {
      throw new ApiError(404, "No products found for this retailer");
    }

    res.status(200).json(new ApiResponse(200, "Products sold by retailer retrieved successfully", customerInfo));
  } catch (error) {
    next(error);
  }
};

export { postCustomerInfo, getSoldProductsByRetailer };
