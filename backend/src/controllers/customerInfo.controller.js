import { CustomerInfoModel } from "../models/customerInfo.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const getCustomerInfo = async (req, res, next) => {
  try {
    const userId = req.user?._id

    if (!userId) {
      throw new ApiError(404, "unauthorized request")
    }

    const customerInfo = await CustomerInfoModel.find({ soldBy: userId }).select("-__v")

    return res.status(200).json(new ApiResponse(200, customerInfo, "customer info fetched successfully"))
  } catch (error) {
    if (!error.message) {
      error.message = "error fetching customer info"
    }
    next(error)
  }
}

const postCustomerInfo = async (req, res, next) => {
  try {
    const userId = req.user?._id

    if (!userId) {
      throw new ApiError(404, "unauthorized request")
    }

    const { name, email, phoneNumber, itemsSold } = req.body
    const requiredFields = [name, email]

    if (requiredFields.some((eachField) => eachField?.trim() == null || eachField?.trim() == "")) {
      throw new ApiError(400, "required fields empty")
    }

    const itemsSoldJSON = JSON.parse(itemsSold)
    if (!itemsSoldJSON?.item || !itemsSoldJSON?.quantity) {
      throw new ApiError(400, "required fields empty")
    }

    const customerInfoToPost = { name, email, phoneNumber, itemsSold, soldBy: userId }
    const newCustomerInfo = await CustomerInfoModel.create(customerInfoToPost)

    return res.status(201).json(new ApiResponse(201, newCustomerInfo, "customer created successfully"))
  } catch (error) {
    if (!error.message) {
      error.message = "error posting customer info"
    }
    next(error)
  }
}

export { getCustomerInfo, postCustomerInfo }
