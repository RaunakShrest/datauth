import slugify from "slugify"
import { ProductItemModel } from "../models/productItem.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ProductTypeModel } from "../models/productType.model.js"
import { slugSortingQuery } from "../utils/aggregations/slug-sorting-query.js"
import { generateUniqueSlug } from "../utils/aggregations/unique-slug-generator.js"
import { generateQr } from "../middlewares/qr-generator.middeware.js"
import { uploadFile } from "../middlewares/cloudinary.middleware.js"
import { BatchIdModal } from "../models/batchId.modal.js"
import mongoose from "mongoose"

const acceptableStatus = () => [
  process.env.PRODUCT_ITEM_STATUS_PENDING,
  process.env.PRODUCT_ITEM_STATUS_COMPLETED,
  process.env.PRODUCT_ITEM_STATUS_CANCELLED,
]
const getProductItems = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const isSuperAdmin = req.user?.userType === process.env.USER_TYPE_SUPER_ADMIN;

    if (!userId) {
      throw new ApiError(404, "unauthorized request");
    }
    const productItems = await ProductItemModel.find(isSuperAdmin ? {} : { productManufacturer: userId })
      .populate("productManufacturer", "companyName")  
      .populate("productType", "name")                 
      .populate("batchId", "batchId")      
      .select("-__v");                             

    return res.status(200).json(new ApiResponse(200, productItems, "product items fetched successfully"));
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while getting products";
    }
    next(error);
  }
};

const getSingleProduct = async (req, res, next) => {
  console.log("hitting single produ")
  try {
    const userId = req.user?._id

    if (!userId) {
      throw new ApiError(401, "unauthorized request")
    }

    const query = {
      slug: req.params?.slug,
    }

    if (req.user.userType !== process.env.USER_TYPE_SUPER_ADMIN) {
      query["productManufacturer"] = userId
    }

    const productItem = await ProductItemModel.findOne(query)
      .populate("productManufacturer", "companyName")
      .populate("productType", "name")
      .select("-__v")

    if (!productItem) {
      throw new ApiError(404, "product doesn't exist")
    }

    return res.status(200).json(new ApiResponse(200, productItem, "product item fetched successfully"))
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while getting products"
    }
    next(error)
  }
}

const createProductItem = async (req, res, next) => {
  try {
   
    const productItemAcceptableStatus = acceptableStatus();
    if (!productItemAcceptableStatus || !Array.isArray(productItemAcceptableStatus)) {
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

    const sanitizedStatus = productStatus?.toLowerCase().replace(/['"]+/g, '').trim() || "pending";

    if (!sanitizedStatus) {
      throw new ApiError(400, "Product status is required");
    }

    const requestedProductType = await ProductTypeModel.findOne({
      _id: productType,
      status: process.env.PRODUCT_TYPE_STATUS_ENABLED,
    });

    if (!requestedProductType) {
      throw new ApiError(404, `Requested product type with ID ${productType} does not exist or is disabled`);
    }

    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      console.error("Batch ID is invalid:", batchId);
      throw new ApiError(404, `Invalid batch ID format: ${batchId}`);
    }

    const requestedBatch = await BatchIdModal.findOne({ _id: batchId });
    if (!requestedBatch) {
      throw new ApiError(404, "Requested batch does not exist");
    }

    const batchObjectId = requestedBatch._id; // Store ObjectId from the found batch
    // Check if the status is acceptable
    const isStatusAcceptable = productItemAcceptableStatus.some(eachStatus =>
      typeof eachStatus === 'string' && sanitizedStatus === eachStatus.toLowerCase()
    );

    if (!isStatusAcceptable) {
      throw new ApiError(406, "Product status unacceptable");
    }

    // Validate and parse productAttributes
    let parsedAttributes;
    try {
      parsedAttributes = JSON.parse(productAttributes); // Ensures that it gets parsed immediately
    } catch (err) {
      throw new ApiError(400, "Invalid product attributes format"); // Clear error message if parsing fails
    }

    // Ensure it's an array and validate its contents
    if (!Array.isArray(parsedAttributes) || parsedAttributes.length === 0) {
      throw new ApiError(400, "Product attributes are required and must be an array"); // Ensures it’s not an empty array
    }

    // Validate each attribute
    parsedAttributes.forEach(attr => {
      if (!attr.attributeName || !attr.attributeValue) {
        throw new ApiError(400, "Each product attribute must have an attributeName and attributeValue");
      }
    });

    // Generate a unique slug for the product
    const wouldBeSlug = slugify(productName.toLowerCase());
    const existingSortedSimilarSlugs = await ProductItemModel.aggregate(slugSortingQuery(wouldBeSlug));
    const uniqueSlug = await generateUniqueSlug(existingSortedSimilarSlugs, wouldBeSlug);

    // Generate a QR code for the product
    const FRONTEND_URL = process.env.NODE_ENV === "DEV" ? process.env.FRONTEND_URL_DEV : process.env.FRONTEND_URL_PROD;
    const qrFilePath = await generateQr(`${FRONTEND_URL}/products/${uniqueSlug}`);

    // Upload QR code to the storage bucket
    const response = await uploadFile(qrFilePath);

    // Process product images from request files
    const productImages = req.files?.map(file => file.secure_url || file.path) || []; // Assuming files contain URLs

    // Create the product item in the database
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
      qrUrl: response.secure_url,
      batchId: batchObjectId, // Store ObjectId from the batch lookup
      productImages
    });

    // Respond with success
    return res.status(201).json(new ApiResponse(201, createdProductItem, "Product created successfully"));
  } catch (error) {
    // Enhanced error handling
    console.error("Error occurred while creating product:", error);
    next(new ApiError(500, error.message || "Something went wrong while creating the product"));
  }
};


const updateProductItem = async (req, res, next) => {
  try {
    const userId = req.user?._id
    if (!userId) {
      throw new ApiError(401, "unauthorized request")
    }

    const productId = req.body.id
    if (!productId) {
      throw new ApiError(401, "product id not provided")
    }

    const { productName, productType, productSku, productDescription, productStatus, batchId } = req.body
    const fieldPassed = { productName, productType, productSku, productDescription, productStatus, batchId }

    // status checker
    if (productStatus) {
      if (!acceptableStatus().some((eachAccepatbleStatus) => productStatus.toLowerCase() === eachAccepatbleStatus)) {
        throw new ApiError(406, "product status unacceptable")
      }
    }

    const updatedProductItem = await ProductItemModel.findOneAndUpdate({ _id: productId }, fieldPassed, {
      new: true,
      runValidators: true,
    }).select("-__v")

    if (!updatedProductItem) {
      throw new ApiError(404, "product item not found")
    }

    return res.status(200).json(new ApiResponse(200, updatedProductItem, "product item updated successfully"))
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while getting products"
    }
    next(error)
  }
}

const deleteProductItem = async (req, res, next) => {
  try {
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while getting products"
    }
    next(error)
  }
}
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params; 
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(new ApiResponse(400, null, "Invalid product ID format"));
    }

    const product = await ProductItemModel.findById(id).select("-__v -password -refreshToken");
    if (!product) {
      return res.status(404).json(new ApiResponse(404, null, "product not found"));
    }

    return res.status(200).json(new ApiResponse(200, product, "product details fetched successfully"));
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
        const removedImages = JSON.parse(updateData.removedImages || '[]'); 

        const product = await ProductItemModel.findById(productId);
        if (!product) {
            return next(new ApiError(404, "Product not found"));
        }

        // Remove images that are flagged for removal
        if (removedImages.length > 0) {
            product.productImages = product.productImages.filter(image => !removedImages.includes(image));
        }

        // If there are new images, append them to the existing array
        if (productImages && productImages.length > 0) {
            const newImagePaths = productImages.map(file => file.path); // Get paths of the uploaded files
            product.productImages = [...product.productImages, ...newImagePaths];
        }

        // Parse productAttributes if it is a string (due to FormData)
        let parsedAttributes = [];
        if (typeof updateData.productAttributes === 'string') {
            parsedAttributes = JSON.parse(updateData.productAttributes);
        } else if (Array.isArray(updateData.productAttributes)) {
            parsedAttributes = updateData.productAttributes;
        }

        const updatedAttributes = product.productAttributes.map(attr => {

            const updatedAttr = parsedAttributes.find(a => a.attributeName === attr.attributeName);
            return updatedAttr ? updatedAttr : attr; // Use updated attribute or retain the existing one
        });

        parsedAttributes.forEach(newAttr => {
            const exists = updatedAttributes.find(attr => attr.attributeName === newAttr.attributeName);
            if (!exists) {
                updatedAttributes.push(newAttr);
            }
        });

        Object.assign(product, { ...updateData, productAttributes: updatedAttributes });
        const updatedProduct = await product.save();

        return res.status(200).json(new ApiResponse(200, updatedProduct, "Product info updated successfully"));
    } catch (error) {
        console.error("Error updating product:", error);
        if (!error.message) {
            error.message = "Something went wrong while updating product info";
        }
        next(error);
    }
};







export { getProductItems, getSingleProduct, createProductItem, updateProductItem, deleteProductItem , getProductById,editProductInfo}
