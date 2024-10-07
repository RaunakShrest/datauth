import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { UserModel } from "../models/user.model.js"
import mongoose from "mongoose";

const editCompanyInfo = async (req, res, next) => {
  try {
    const { companyId } = req.params; // Get companyId from the URL params
    const updateData = req.body; 
    const updatedCompany = await UserModel.findByIdAndUpdate(
      companyId, 
      { $set: updateData }, // Apply updates from the body
      { new: true, runValidators: true, select: "-__v -password -refreshToken" } 
    );

    if (!updatedCompany) {
      return next(new ApiError(404, "Company not found"));
    }
    return res.status(200).json(new ApiResponse(200, updatedCompany, "Company info updated successfully"));
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while updating company info";
    }
    next(error);
  }
};
const getCompanyById = async (req, res, next) => {
  try {
    const { id } = req.params; 
    
    // Check if the id is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(new ApiResponse(400, null, "Invalid company ID format"));
    }
    const company = await UserModel.findById(id).select("-__v -password -refreshToken");
    if (!company) {
      return res.status(404).json(new ApiResponse(404, null, "Company not found"));
    }
    return res.status(200).json(new ApiResponse(200, company, "Company details fetched successfully"));
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while fetching company details";
    }
    next(error); 
  }
};

export { editCompanyInfo, getCompanyById }
