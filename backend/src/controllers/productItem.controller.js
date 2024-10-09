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

// const getProductItems = async (req, res, next) => {
//   try {
//      const userId = req.user?._id
//     const isSuperAdmin = req.user?.userType === process.env.USER_TYPE_SUPER_ADMIN

//     if (!userId) {
//       throw new ApiError(404, "unauthorized request")
//     }

//     const productItems = await ProductItemModel.find(isSuperAdmin ? {} : { productManufacturer: userId })
//       .populate("productManufacturer", "companyName")
//       .populate("productType", "name")
//       .select("-__v")

//     return res.status(200).json(new ApiResponse(200, productItems, "product items fetched successfully"))
//   } catch (error) {
//     if (!error.message) {
//       error.message = "something went wrong while getting products"
//     }
//     next(error)
//   }
// }
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
  const productItemAcceptableStatus = acceptableStatus();

  try {
    const userId = req.user?._id;

    if (!userId) {
      throw new ApiError(404, "unauthorized request");
    }
    const { productName, productType, productSku, productDescription, productStatus, productPrice, batchId } = req.body;

    const requiredFields = [productName, productType, productSku, productPrice, productDescription, productStatus, batchId];

    // requirement checker
    if (requiredFields.some((eachField) => eachField?.trim() == null || eachField?.trim() == "")) {
      throw new ApiError(404, "required fields empty");
    }

    const requestedProductType = await ProductTypeModel.findOne({
      _id: productType,
      status: process.env.PRODUCT_TYPE_STATUS_ENABLED,
    });

    if (!requestedProductType) {
      throw new ApiError(404, "requested product type does not exist");
    }
    const batchString = batchId; // This can be a batch name, code, etc.
    const requestedBatch = await BatchIdModal.findOne({ batchId: batchString });

    if (!requestedBatch) {
      throw new ApiError(404, "requested batch does not exist");
    }

    const batchObjectId = requestedBatch._id; // Extract the ObjectId from the found batch

    if (productStatus) {
      if (
        !productItemAcceptableStatus.some(
          (eachAccepatbleStatus) => productStatus.toLowerCase() === eachAccepatbleStatus
        )
      ) {
        throw new ApiError(406, "product status unacceptable");
      }
    }

    // generate unique slug
    const wouldBeSlug = slugify(productName.toLowerCase());
    const existingSortedSimilarSlugs = await ProductItemModel.aggregate(slugSortingQuery(wouldBeSlug));
    const uniqueSlug = await generateUniqueSlug(existingSortedSimilarSlugs, wouldBeSlug);

    // generate qr code based off of above unique slug
    const FRONTEND_URL = process.env.NODE_ENV === "DEV" ? process.env.FRONTEND_URL_DEV : process.env.FRONTEND_URL_PROD;
    const qrFilePath = await generateQr(`${FRONTEND_URL}/products/${uniqueSlug}`);

    // upload the qr to the storage bucket
    const response = await uploadFile(qrFilePath);

    const createdProductItem = await ProductItemModel.create({
      productName,
      productType,
      productPrice,
      productSku,
      productDescription,
      productStatus,
      productManufacturer: userId,
      productAttributes: req.body.productAttributes,
      slug: uniqueSlug,
      qrUrl: response.secure_url,
      batchId: batchObjectId, // Store the ObjectId from the Batch lookup
    });

    return res.status(201).json(new ApiResponse(201, createdProductItem, "product created successfully"));
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while getting products";
    }
    next(error);
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
    const updatedProduct = await ProductItemModel.findByIdAndUpdate(
      productId, 
      { $set: updateData }, // Apply updates from the body
      { new: true, runValidators: true, select: "-__v -password -refreshToken" } 
    );

    if (!updatedProduct) {
      return next(new ApiError(404, "Product not found"));
    }
    return res.status(200).json(new ApiResponse(200, updatedProduct, "Product info updated successfully"));
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while updating product info";
    }
    next(error);
  }
};
export { getProductItems, getSingleProduct, createProductItem, updateProductItem, deleteProductItem , getProductById,editProductInfo}
