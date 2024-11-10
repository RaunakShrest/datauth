import { CustomerInfoModel } from "../models/customerInfo.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ProductItemModel } from "../models/productItem.model.js";
import { UserModel } from "../models/user.model.js";

import sendBulkEmail from "../middlewares/sendEmail.middleware.js";

const postCustomerInfo = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, soldProducts, soldBy } = req.body;

    // Validate required fields
    if (!name || !email || !soldProducts || !soldBy) {
      throw new ApiError(400, "Missing required fields");
    }

    // Check if product and company exist
    const product = await ProductItemModel.findById(soldProducts).populate(
      "productManufacturer"
    );
    const companyUser = await UserModel.findById(soldBy);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    if (!companyUser) {
      throw new ApiError(404, "Company not found");
    }

    const productManufacturer = product.productManufacturer;
    const existingCustomer = await CustomerInfoModel.findOne({ soldProducts });
    const companyEmail = companyUser.email; // Company’s email address

    // Company email options
    const companyEmailOptions = [
      {
        from: process.env.SENDER_ADDRESS,
        to: companyEmail,
        subject: "Customer Information Notification",
        text: `A customer record has been created for product ID: ${soldProducts}.`,
        html: `<p>A customer record has been created for product ID: ${soldProducts}.</p>`,
      },
    ];

    if (existingCustomer) {
      // Check if data is identical to avoid duplicate entries
      const isDataSame =
        existingCustomer.name === name &&
        existingCustomer.email === email &&
        existingCustomer.phoneNumber === phoneNumber &&
        existingCustomer.productManufacturer.toString() ===
          productManufacturer.toString();

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

      // Update customer info
      existingCustomer.name = name;
      existingCustomer.email = email;
      existingCustomer.phoneNumber = phoneNumber;
      existingCustomer.productManufacturer = productManufacturer;

      await existingCustomer.save();

      const customerUpdateEmailOptions = [
        {
          from: process.env.SENDER_ADDRESS,
          to: email,
          subject: "Your Information has been Updated",
          text: `Dear ${name}, your customer information has been updated successfully.`,
          html: `<p>Dear ${name},</p><p>Your customer information has been updated successfully.</p>`,
        },
      ];

      // Send update emails
      await sendBulkEmail([
        ...customerUpdateEmailOptions,
        ...companyEmailOptions,
      ]);

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
      // Create a new customer with auto-incremented orderId
      const newCustomerInfo = new CustomerInfoModel({
        name,
        email,
        phoneNumber,
        soldProducts,
        soldBy,
        productManufacturer,
      });

      await newCustomerInfo.save(); // orderId generated via pre-save hook

      // Update product status
      await ProductItemModel.findByIdAndUpdate(
        soldProducts,
        { soldBy, productStatus: "completed" },
        { new: true }
      );

      const customerCreationEmailOptions = [
        {
          from: process.env.SENDER_ADDRESS,
          to: email,
          subject: "Product Purchased",
          text: `Dear ${name}, Thank you for purchasing our product using productAuth, powered by blockchain technology.`,
          html: `<p>Dear ${name},</p><p>Thank you for purchasing our product using productAuth, powered by blockchain technology.</p>`,
        },
      ];

      // Send creation emails
      await sendBulkEmail([
        ...customerCreationEmailOptions,
        ...companyEmailOptions,
      ]);

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
        .populate({
          path: "soldProducts",
          populate: {
            path: "productManufacturer", // Assuming this is the field containing the company ObjectId
            select: "companyName", // Select only the companyName field
          },
        })
        .populate({
          path: "soldBy",
          select: "companyName",
        })
        .exec();
    } else {
      // For regular retailer, fetch sold products only by their ID
      const retailerId = req.user._id;

      if (!retailerId) {
        throw new ApiError(400, "Retailer ID not found");
      }

      customerInfo = await CustomerInfoModel.find({ soldBy: retailerId })
        .populate({
          path: "soldProducts",
          populate: {
            path: "productManufacturer", // Populate the manufacturer field
            select: "companyName", // Select the companyName to include in the response
          },
        })
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
