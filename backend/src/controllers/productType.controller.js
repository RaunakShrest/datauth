import { ProductTypeModel } from "../models/productType.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const acceptableStatus = () => [
  process.env.PRODUCT_TYPE_STATUS_ENABLED,
  process.env.PRODUCT_TYPE_STATUS_DISABLED,
];

const getEnabledProductTypes = async (req, res, next) => {
  try {
    const { userType, _id: userId } = req.user;

    let productTypes;
    if (userType === "super-admin") {
      productTypes = await ProductTypeModel.find({
        status: process.env.PRODUCT_TYPE_STATUS_ENABLED,
      }).select("-__v");
    } else if (userType === "company") {
      // Company: Fetch only the product types created by this company (logged-in user)
      productTypes = await ProductTypeModel.find({
        status: process.env.PRODUCT_TYPE_STATUS_ENABLED,
        createdBy: userId,
      }).select("-__v");
    } else {
      throw new ApiError(403, "You are not authorized to view product types.");
    }

    if (!productTypes || productTypes.length === 0) {
      throw new ApiError(404, "No product types found.");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, productTypes, "Product types fetched successfully")
      );
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong fetching product types";
    }
    next(error);
  }
};

const getEnabledProductTypesRegistration = async (req, res, next) => {
  // this is used for registration page
  try {
    const productTypes = await ProductTypeModel.find({
      status: process.env.PRODUCT_TYPE_STATUS_ENABLED,
    }).select("-__v");

    return res
      .status(200)
      .json(
        new ApiResponse(200, productTypes, "product types fetched successfully")
      );
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong fetching product type";
    }
    next(error);
  }
};

const getAllProductTypes = async (req, res, next) => {
  try {
    let productTypes;
    if (req.user.userType === "super-admin") {
      // Super-admin: Fetch all product types
      productTypes = await ProductTypeModel.find({})
        .select("-__v")
        .populate("createdBy", "companyName");
    } else if (req.user.userType === "company") {
      const companyId = req.user._id;
      productTypes = await ProductTypeModel.find({
        createdBy: companyId,
      })
        .select("-__v")
        .populate("createdBy", "companyName"); // Populate with 'companyName' field from the 'user' schema
    } else {
      throw new ApiError(403, "Unauthorized access to product types");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, productTypes, "Product types fetched successfully")
      );
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong fetching product types";
    }
    next(error);
  }
};

const createProductType = async (req, res, next) => {
  try {
    const { name, price, description, status, attributes } = req.body;
    const userId = req.user._id; // Assuming the user's ID is stored in req.user._id
    const userType = req.user.userType; // Assuming the user's type is stored in req.user.userType

    // Validate required fields
    if (
      [name, price, description, status].some(
        (each) => each == null || each.trim() === ""
      )
    ) {
      throw new ApiError(400, "Required Fields Empty");
    }

    // Validate attributes
    if (attributes?.length <= 0) {
      throw new ApiError(400, "Attributes are required");
    }

    // Validate status
    if (status) {
      if (
        !acceptableStatus().some(
          (eachAcceptableStatus) =>
            status?.toLowerCase() === eachAcceptableStatus
        )
      ) {
        throw new ApiError(406, "Status value unacceptable");
      }
    }

    // Strip <p> and </p> tags from description
    const sanitizedDescription = description.replace(/<\/?p>/g, "");

    // Prepare product type fields
    const providedFields = {
      name,
      price,
      description: sanitizedDescription,
      status,
      attributes,
    };

    // If the user is a company, include createdBy field
    if (userType === "company") {
      providedFields.createdBy = userId;
    }

    // Create the product type
    const createdProductType = await ProductTypeModel.create({
      ...providedFields,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          createdProductType,
          "Product type successfully created"
        )
      );
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while creating the product type";
    }
    next(error);
  }
};

const updateProductType = async (req, res, next) => {
  try {
    const productTypeId = req.body?.id;
    const { name, price, description, status, attributes } = req.body;

    if (!productTypeId) {
      throw new ApiError(400, "product type id not provided");
    }

    if (status) {
      if (
        !acceptableStatus().some(
          (eachAccepatbleStatus) =>
            status.toLowerCase() === eachAccepatbleStatus
        )
      ) {
        throw new ApiError(406, "status value unacceptable");
      }
    }

    const providedFields = { name, price, description, status, attributes };
    const updatedProductType = await ProductTypeModel.findOneAndUpdate(
      { _id: productTypeId },
      providedFields,
      {
        new: true,
        runValidators: true,
      }
    ).select("-__v");

    if (!updatedProductType) {
      throw new ApiError(404, "product type doesn't exist");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedProductType,
          "product type updated successfully"
        )
      );
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while updating product type";
    }
    next(error);
  }
};

const deleteProductType = async (req, res, next) => {
  try {
    const productTypeId = req.body?.id;

    if (!productTypeId) {
      throw new ApiError(400, "product type id not provided");
    }

    const productType = await ProductTypeModel.findOneAndDelete({
      _id: productTypeId,
    });

    if (!productType) {
      throw new ApiError(404, "product type doesn't exist");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "product type deleted successfully"));
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while deleting product type";
    }
    next(error);
  }
};
const updateProductTypeStatus = async (req, res, next) => {
  try {
    const productTypeId = req.params.id;
    const { status } = req.body;

    if (!productTypeId) {
      throw new ApiError(400, "Product type ID not provided");
    }

    if (!status) {
      throw new ApiError(400, "Status not provided");
    }
    // Check if the provided status is acceptable (enabled/disabled)
    if (
      !acceptableStatus().some(
        (acceptableStatus) =>
          status.toLowerCase() === acceptableStatus.toLowerCase()
      )
    ) {
      throw new ApiError(406, "Status value unacceptable");
    }
    const updatedProductType = await ProductTypeModel.findOneAndUpdate(
      { _id: productTypeId },
      { status: status.toLowerCase() },
      {
        new: true,
        runValidators: true,
      }
    ).select("-__v");

    if (!updatedProductType) {
      throw new ApiError(404, "Product type doesn't exist");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedProductType,
          "Product type status updated successfully"
        )
      );
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while updating product type status";
    }
    next(error);
  }
};
const getProductTypeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid productType ID format"));
    }

    const productType = await ProductTypeModel.findById(id).select(
      "-__v -password -refreshToken"
    );
    if (!productType) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "productType not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          productType,
          "productType details fetched successfully"
        )
      );
  } catch (error) {
    console.error(error);
    if (!error.message) {
      error.message = "Something went wrong while fetching productType details";
    }
    next(error);
  }
};
const editProductTypeInfo = async (req, res, next) => {
  try {
    const { productTypeId } = req.params;
    const updateData = req.body;
    const updatedProductType = await ProductTypeModel.findByIdAndUpdate(
      productTypeId,
      { $set: updateData }, // Apply updates from the body
      { new: true, runValidators: true, select: "-__v -password -refreshToken" }
    );

    if (!updatedProductType) {
      return next(new ApiError(404, "ProductType not found"));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedProductType,
          "Product info updated successfully"
        )
      );
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while updating product info";
    }
    next(error);
  }
};

export {
  getAllProductTypes,
  editProductTypeInfo,
  getEnabledProductTypes,
  createProductType,
  updateProductType,
  deleteProductType,
  updateProductTypeStatus,
  getProductTypeById,
  getEnabledProductTypesRegistration,
};
