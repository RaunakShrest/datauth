import slugify from "slugify";
import { ProductItemModel } from "../models/productItem.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ProductTypeModel } from "../models/productType.model.js";
import { slugSortingQuery } from "../utils/aggregations/slug-sorting-query.js";
import { generateUniqueSlug } from "../utils/aggregations/unique-slug-generator.js";
import { generateQr } from "../middlewares/qr-generator.middeware.js";
import { uploadFile } from "../middlewares/cloudinary.middleware.js";
import { BatchIdModal } from "../models/batchId.modal.js";
import mongoose from "mongoose";

const acceptableStatus = () => [
  process.env.PRODUCT_ITEM_STATUS_PENDING,
  process.env.PRODUCT_ITEM_STATUS_COMPLETED,
  process.env.PRODUCT_ITEM_STATUS_CANCELLED,
];

const getProductItems = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const userType = req.user?.userType;
    const isSuperAdmin = userType === process.env.USER_TYPE_SUPER_ADMIN;
    const isRetailer = userType === process.env.USER_TYPE_RETAILER;

    if (!userId) {
      throw new ApiError(404, "Unauthorized request");
    }

    // If user is Super Admin or Retailer, fetch all products
    const filter =
      isSuperAdmin || isRetailer ? {} : { productManufacturer: userId };
    const productItems = await ProductItemModel.find(filter)
      .populate("productManufacturer", "companyName")
      .populate("productType", "name")
      .populate("batchId", "batchId")
      .select("-__v");

    return res
      .status(200)
      .json(
        new ApiResponse(200, productItems, "Product items fetched successfully")
      );
  } catch (error) {
    console.error(
      "Error fetching product items:",
      error.message || "unknown error"
    );
    next(error);
  }
};

const getSingleProduct = async (req, res, next) => {
  // for company left
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw new ApiError(401, "unauthorized request");
    }

    // Always query by slug
    const query = {
      _id: req.params?.productId,
    };

    // If the user is not a Super Admin, we will not restrict the query
    // This allows Retailers to see all products based on the slug
    const productItem = await ProductItemModel.findOne(query)
      .populate("productManufacturer", "companyName")
      .populate("productType", "name")
      .select("-__v");

    if (!productItem) {
      throw new ApiError(404, "product doesn't exist");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, productItem, "product item fetched successfully")
      );
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while getting products";
    }
    next(error);
  }
};

const createProductItem = async (req, res, next) => {
  try {
    const productItemAcceptableStatus = acceptableStatus();
    if (
      !productItemAcceptableStatus ||
      !Array.isArray(productItemAcceptableStatus)
    ) {
      throw new ApiError(500, "Acceptable status array is invalid");
    }

    const userId = req.user?._id;
    if (!userId) {
      throw new ApiError(404, "Unauthorized request");
    }

    const {
      productName,
      productType,
      productSku,
      productDescription,
      productPrice,
      batchId,
      productStatus,
      productAttributes,
    } = req.body;

    const sanitizedStatus =
      productStatus?.toLowerCase().replace(/['"]+/g, "").trim() || "pending";
    if (!sanitizedStatus) {
      throw new ApiError(400, "Product status is required");
    }

    const requestedProductType = await ProductTypeModel.findOne({
      _id: productType,
      status: process.env.PRODUCT_TYPE_STATUS_ENABLED,
    });
    if (!requestedProductType) {
      throw new ApiError(
        404,
        `Requested product type with ID ${productType} does not exist or is disabled`
      );
    }

    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      console.error("Batch ID is invalid:", batchId);
      throw new ApiError(
        400,
        `Invalid batch ID format: ${batchId}. A valid batch ID must be a 24-character hexadecimal string.`
      );
    }

    const requestedBatch = await BatchIdModal.findOne({ _id: batchId });
    if (!requestedBatch) {
      throw new ApiError(404, "Requested batch does not exist");
    }

    const batchObjectId = requestedBatch._id;

    const isStatusAcceptable = productItemAcceptableStatus.some(
      (eachStatus) =>
        typeof eachStatus === "string" &&
        sanitizedStatus === eachStatus.toLowerCase()
    );
    if (!isStatusAcceptable) {
      throw new ApiError(406, "Product status unacceptable");
    }

    let parsedAttributes;
    try {
      parsedAttributes = JSON.parse(productAttributes);
    } catch (err) {
      throw new ApiError(400, "Invalid product attributes format");
    }

    if (!Array.isArray(parsedAttributes) || parsedAttributes.length === 0) {
      throw new ApiError(
        400,
        "Product attributes are required and must be an array"
      );
    }

    parsedAttributes.forEach((attr) => {
      if (!attr.attributeName || !attr.attributeValue) {
        throw new ApiError(
          400,
          "Each product attribute must have an attributeName and attributeValue"
        );
      }
    });

    const wouldBeSlug = slugify(productName.toLowerCase());
    const existingSortedSimilarSlugs = await ProductItemModel.aggregate(
      slugSortingQuery(wouldBeSlug)
    );
    const uniqueSlug = await generateUniqueSlug(
      existingSortedSimilarSlugs,
      wouldBeSlug
    );

    const productImages =
      req.files?.map((file) => file.secure_url || file.path) || [];

    // Step 1: Create the product item without the QR code
    const createdProductItem = await ProductItemModel.create({
      productName,
      productType,
      productPrice,
      productSku,
      productDescription,
      productStatus: sanitizedStatus,
      productManufacturer: userId,
      productAttributes: parsedAttributes,
      slug: uniqueSlug,
      batchId: batchObjectId,
      productImages,
    });

    // Step 2: Generate the QR code using the product's _id
    const FRONTEND_URL =
      process.env.NODE_ENV === "DEV"
        ? process.env.FRONTEND_URL_DEV
        : process.env.FRONTEND_URL_PROD;
    const qrFilePath = await generateQr(
      `${FRONTEND_URL}/products/${createdProductItem._id}`
    );
    const response = await uploadFile(qrFilePath);

    // Step 3: Update the product item with the QR code URL
    createdProductItem.qrUrl = response.secure_url;
    await createdProductItem.save();

    return res
      .status(201)
      .json(
        new ApiResponse(201, createdProductItem, "Product created successfully")
      );
  } catch (error) {
    console.error("Error occurred while creating product:", error);
    next(
      new ApiError(
        500,
        error.message || "Something went wrong while creating the product"
      )
    );
  }
};

const updateProductItem = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      throw new ApiError(401, "unauthorized request");
    }

    const productId = req.body.id;
    if (!productId) {
      throw new ApiError(401, "product id not provided");
    }

    const {
      productName,
      productType,
      productSku,
      productDescription,
      productStatus,
      batchId,
    } = req.body;
    const fieldPassed = {
      productName,
      productType,
      productSku,
      productDescription,
      productStatus,
      batchId,
    };

    // status checker
    if (productStatus) {
      if (
        !acceptableStatus().some(
          (eachAccepatbleStatus) =>
            productStatus.toLowerCase() === eachAccepatbleStatus
        )
      ) {
        throw new ApiError(406, "product status unacceptable");
      }
    }

    const updatedProductItem = await ProductItemModel.findOneAndUpdate(
      { _id: productId },
      fieldPassed,
      {
        new: true,
        runValidators: true,
      }
    ).select("-__v");

    if (!updatedProductItem) {
      throw new ApiError(404, "product item not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedProductItem,
          "product item updated successfully"
        )
      );
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while getting products";
    }
    next(error);
  }
};

const deleteProductItem = async (req, res, next) => {
  try {
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while getting products";
    }
    next(error);
  }
};
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid product ID format"));
    }

    const product = await ProductItemModel.findById(id).select(
      "-__v -password -refreshToken"
    );
    if (!product) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "product not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, product, "product details fetched successfully")
      );
  } catch (error) {
    console.error(error);
    if (!error.message) {
      error.message = "Something went wrong while fetching product details";
    }
    next(error);
  }
};

const editProductInfo = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;
    const productImages = req.files;
    const removedImages = JSON.parse(updateData.removedImages || "[]");

    const product = await ProductItemModel.findById(productId);
    if (!product) {
      return next(new ApiError(404, "Product not found"));
    }

    // Remove images that are flagged for removal
    if (removedImages.length > 0) {
      product.productImages = product.productImages.filter(
        (image) => !removedImages.includes(image)
      );
    }

    // If there are new images, append them to the existing array
    if (productImages && productImages.length > 0) {
      const newImagePaths = productImages.map((file) => file.path); // Get paths of the uploaded files
      product.productImages = [...product.productImages, ...newImagePaths];
    }

    // Parse productAttributes if it is a string (due to FormData)
    let parsedAttributes = [];
    if (typeof updateData.productAttributes === "string") {
      parsedAttributes = JSON.parse(updateData.productAttributes);
    } else if (Array.isArray(updateData.productAttributes)) {
      parsedAttributes = updateData.productAttributes;
    }

    const updatedAttributes = product.productAttributes.map((attr) => {
      const updatedAttr = parsedAttributes.find(
        (a) => a.attributeName === attr.attributeName
      );
      return updatedAttr ? updatedAttr : attr; // Use updated attribute or retain the existing one
    });

    parsedAttributes.forEach((newAttr) => {
      const exists = updatedAttributes.find(
        (attr) => attr.attributeName === newAttr.attributeName
      );
      if (!exists) {
        updatedAttributes.push(newAttr);
      }
    });

    Object.assign(product, {
      ...updateData,
      productAttributes: updatedAttributes,
    });
    const updatedProduct = await product.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedProduct,
          "Product info updated successfully"
        )
      );
  } catch (error) {
    console.error("Error updating product:", error);
    if (!error.message) {
      error.message = "Something went wrong while updating product info";
    }
    next(error);
  }
};

const getCompanyProductItems = async (req, res, next) => {
  try {
    const companyId = req.params.companyId;
    const userId = req.user?._id;
    const userType = req.user?.userType;
    const isSuperAdmin = userType === process.env.USER_TYPE_SUPER_ADMIN;
    const isRetailer = userType === process.env.USER_TYPE_RETAILER;

    if (!companyId) {
      throw new ApiError(400, "Company ID is required");
    }

    let filter = {
      productManufacturer: companyId, // Match by company ID
    };

    // If the user is a retailer, apply a more specific filter
    if (isRetailer) {
      filter.$or = [
        { soldBy: userId }, // Products sold by the logged-in retailer
        { productStatus: "pending" }, // Products that are unsold (status pending)
      ];
    }

    // Fetch products based on the filter
    const productItems = await ProductItemModel.find(filter)
      .populate("productManufacturer", "companyName")
      .populate("productType", "name")
      .populate("batchId", "batchId")
      .select("-__v");

    return res
      .status(200)
      .json(
        new ApiResponse(200, productItems, "Product items fetched successfully")
      );
  } catch (error) {
    console.error(
      "Error fetching product items:",
      error.message || "unknown error"
    );
    next(error);
  }
};

export {
  getProductItems,
  getCompanyProductItems,
  getSingleProduct,
  createProductItem,
  updateProductItem,
  deleteProductItem,
  getProductById,
  editProductInfo,
};
