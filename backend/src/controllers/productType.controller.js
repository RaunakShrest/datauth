import { ProductTypeModel } from "../models/productType.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const acceptableStatus = () => [process.env.PRODUCT_TYPE_STATUS_ENABLED, process.env.PRODUCT_TYPE_STATUS_DISABLED]

const getEnabledProductTypes = async (req, res, next) => {
  try {
    const productTypes = await ProductTypeModel.find({ status: process.env.PRODUCT_TYPE_STATUS_ENABLED }).select("-__v")

    return res.status(200).json(new ApiResponse(200, productTypes, "product types fetched successfully"))
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong fetching product type"
    }
    next(error)
  }
}

const getAllProductTypes = async (req, res, next) => {
  try {
    const productTypes = await ProductTypeModel.find({}).select("-__v")

    return res.status(200).json(new ApiResponse(200, productTypes, "product types fetched successfully"))
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong fetching product type"
    }
    next(error)
  }
}

const createProductType = async (req, res, next) => {
  try {
    const { name, price, description, status, attributes } = req.body;
    if ([name, price, description, status].some((each) => each == null || each.trim() === "")) {
      throw new ApiError(400, "Required Fields Empty");
    }
    if (attributes?.length <= 0) {
      throw new ApiError(400, "Required Fields Empty");
    }
    if (status) {
      if (!acceptableStatus().some((eachAcceptableStatus) => status?.toLowerCase() === eachAcceptableStatus)) {
        throw new ApiError(406, "status value unacceptable");
      }
    }
    const sanitizedDescription = description.replace(/<\/?p>/g, ""); // Strips <p> and </p> tags
    const providedFields = {
      name,
      price,
      description: sanitizedDescription, 
      status,
      attributes,
    };
    const createdProductType = await ProductTypeModel.create({ ...providedFields });
    return res.status(201).json(new ApiResponse(201, createdProductType, "product type successfully created"));
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while creating product type";
    }
    next(error);
  }
};


const updateProductType = async (req, res, next) => {
  try {
    const productTypeId = req.body?.id
    const { name,price, description, status, attributes } = req.body

    if (!productTypeId) {
      throw new ApiError(400, "product type id not provided")
    }

    if (status) {
      if (!acceptableStatus().some((eachAccepatbleStatus) => status.toLowerCase() === eachAccepatbleStatus)) {
        throw new ApiError(406, "status value unacceptable")
      }
    }

    const providedFields = { name, price, description, status, attributes }
    const updatedProductType = await ProductTypeModel.findOneAndUpdate({ _id: productTypeId }, providedFields, {
      new: true,
      runValidators: true,
    }).select("-__v")

    if (!updatedProductType) {
      throw new ApiError(404, "product type doesn't exist")
    }

    return res.status(200).json(new ApiResponse(200, updatedProductType, "product type updated successfully"))
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while updating product type"
    }
    next(error)
  }
}

const deleteProductType = async (req, res, next) => {
  try {
    const productTypeId = req.body?.id

    if (!productTypeId) {
      throw new ApiError(400, "product type id not provided")
    }

    const productType = await ProductTypeModel.findOneAndDelete({ _id: productTypeId })

    if (!productType) {
      throw new ApiError(404, "product type doesn't exist")
    }

    return res.status(200).json(new ApiResponse(200, {}, "product type deleted successfully"))
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while deleting product type"
    }
    next(error)
  }
}
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
    if (!acceptableStatus().some((acceptableStatus) => status.toLowerCase() === acceptableStatus.toLowerCase())) {
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

    return res.status(200).json(new ApiResponse(200, updatedProductType, "Product type status updated successfully"));
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while updating product type status";
    }
    next(error);
  }
};


export { getAllProductTypes, getEnabledProductTypes, createProductType, updateProductType, deleteProductType, updateProductTypeStatus }
