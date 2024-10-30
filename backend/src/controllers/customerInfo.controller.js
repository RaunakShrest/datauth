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

    const product = await ProductItemModel.findById(soldProducts).populate(
      "productManufacturer"
    );

    const userExists = await UserModel.findById(soldBy);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    if (!userExists) {
      throw new ApiError(404, "User not found");
    }

    // Get the productManufacturer from the product
    const productManufacturer = product.productManufacturer;

    // Find existing customer info by soldProducts
    const existingCustomer = await CustomerInfoModel.findOne({ soldProducts });

    // If customer info exists, check if the data matches
    if (existingCustomer) {
      const isDataSame =
        existingCustomer.name === name &&
        existingCustomer.email === email &&
        existingCustomer.phoneNumber === phoneNumber &&
        existingCustomer.productManufacturer.toString() ===
          productManufacturer.toString(); // Compare productManufacturer

      if (isDataSame) {
        return res
          .status(409)
          .json(
            new ApiResponse(
              409,
              null,
              "Customer data already exists. No changes made."
            )
          );
      }

      // If the data is different, update the existing record
      existingCustomer.name = name;
      existingCustomer.email = email;
      existingCustomer.phoneNumber = phoneNumber;
      existingCustomer.productManufacturer = productManufacturer; // Update manufacturer

      await existingCustomer.save();

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            existingCustomer,
            "Customer info updated successfully"
          )
        );
    } else {
      // Create a new customer record if no existing record is found
      const newCustomerInfo = new CustomerInfoModel({
        name,
        email,
        phoneNumber,
        soldProducts,
        soldBy,
        productManufacturer, // Add manufacturer to new customer info
      });

      await newCustomerInfo.save();

      // Update the product with soldBy and productStatus
      await ProductItemModel.findByIdAndUpdate(
        soldProducts,
        {
          soldBy,
          productStatus: "completed", // Keep productStatus as completed for new entries
        },
        { new: true }
      );

      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            newCustomerInfo,
            "Customer info created successfully"
          )
        );
    }
  } catch (error) {
    next(error);
  }
};

const getSoldProductsByRetailer = async (req, res, next) => {
  try {
    // Check if the logged-in user is super-admin
    let customerInfo;

    if (req.user.userType === "super-admin") {
      // Super-admin can view all sold products by all retailers
      customerInfo = await CustomerInfoModel.find()
        .populate("soldProducts") // Populate sold products info
        .exec();
    } else {
      // For regular retailer, fetch sold products only by their ID
      const retailerId = req.user._id;

      if (!retailerId) {
        throw new ApiError(400, "Retailer ID not found");
      }

      customerInfo = await CustomerInfoModel.find({ soldBy: retailerId })
        .populate("soldProducts") // Populate sold products info
        .exec();
    }

    if (!customerInfo.length) {
      throw new ApiError(404, "No products found");
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Products sold by retailers retrieved successfully",
          customerInfo
        )
      );
  } catch (error) {
    next(error);
  }
};

const getCustomerInfo = async (req, res, next) => {
  try {
    const { productId } = req.query;

    // Validate productId
    if (!productId) {
      throw new ApiError(400, "Missing productId parameter");
    }

    // Check if the product exists
    const productExists = await ProductItemModel.findById(productId);
    if (!productExists) {
      throw new ApiError(404, "Product not found");
    }

    // Find the customer information linked to this product
    const customerInfo = await CustomerInfoModel.findOne({
      soldProducts: productId,
    });
    if (!customerInfo) {
      throw new ApiError(404, "Customer info not found for this product");
    }

    // Return the customer info
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Customer info retrieved successfully",
          customerInfo
        )
      );
  } catch (error) {
    next(error);
  }
};

const getSoldProductsByCompany = async (req, res, next) => {
  try {
    console.log("role", req.user.userType);
    const companyId = req.user._id;
    const userType = req.user.userType;

    // If userType is not super-admin, proceed to get products for the specific company
    let customerInfo;

    if (userType === "super-admin") {
      // If the user is a super-admin, fetch all sold products for all companies
      customerInfo = await CustomerInfoModel.find({})
        .populate({
          path: "soldProducts", // Populate sold products info
        })
        .populate({
          path: "soldBy", // Assuming 'soldBy' references the retailer
          select: "companyName", // Only select the companyName field from the Retailer model
        })
        .exec();
    } else {
      // For non-super-admin users, only fetch products for the logged-in company
      if (!companyId) {
        throw new ApiError(400, "companyId not found");
      }

      customerInfo = await CustomerInfoModel.find({
        productManufacturer: companyId,
      })
        .populate({
          path: "soldProducts", // Populate sold products info
        })
        .populate({
          path: "soldBy", // Assuming 'soldBy' references the retailer
          select: "companyName", // Only select the companyName field from the Retailer model
        })
        .exec();
    }

    // Check if customerInfo is empty
    if (!customerInfo.length) {
      throw new ApiError(404, "No products found");
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          userType === "super-admin"
            ? "All sold products retrieved successfully"
            : "Products sold by company retrieved successfully",
          customerInfo
        )
      );
  } catch (error) {
    next(error);
  }
};

export {
  postCustomerInfo,
  getSoldProductsByRetailer,
  getCustomerInfo,
  getSoldProductsByCompany,
};
