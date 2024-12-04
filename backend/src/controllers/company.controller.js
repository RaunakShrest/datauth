import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UserModel } from "../models/user.model.js";
import mongoose from "mongoose";

import axios from "axios";

const editCompanyInfo = async (req, res, next) => {
  const blockChainToken = req.blockChainToken;
  console.log("The blockchain token is:", blockChainToken);

  try {
    const { companyId } = req.params;
    const updateData = req.body;

    const updatedCompany = await UserModel.findByIdAndUpdate(
      companyId,
      { $set: updateData }, // Apply updates from the body
      { new: true, runValidators: true, select: "-__v -password -refreshToken" }
    );

    if (!updatedCompany) {
      return next(new ApiError(404, "Company not found"));
    }

    const args = [
      updatedCompany._id.toString(),
      updatedCompany.companyName,
      updatedCompany.address?.zip,
      updatedCompany.address?.city,
      updatedCompany.address?.country,
      updatedCompany.address?.addressLine,
      updatedCompany.firstName,
      updatedCompany.lastName,
      updatedCompany.email,
      updatedCompany.phoneNumber,
      updatedCompany.userType,
      JSON.stringify(updatedCompany.productType || ["General"]),
    ];

    // Prepare the payload
    const payload = {
      fcn: "EditCompany",
      // peers: ["peer0.company.example.com"],
      args,
    };

    // Send the payload to the friend's API
    const response = await axios.post(
      `${process.env.BLOCKCHAIN_TEST_URL}/channels/mychannel/chaincodes/Company`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${blockChainToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Log the friend's API response
    console.log("Response from friend's API:", response.data);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedCompany,
          "Company info updated successfully and sent to blockchain"
        )
      );
  } catch (error) {
    console.error(
      "Error while updating company info or sending to blockchain:",
      error.message
    );

    if (!error.message) {
      error.message = "Something went wrong while updating company info";
    }
    next(error);
  }
};

const getCompanyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if the id is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid company ID format"));
    }
    const company = await UserModel.findById(id).select(
      "-__v -password -refreshToken"
    );
    if (!company) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Company not found"));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, company, "Company details fetched successfully")
      );
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while fetching company details";
    }
    next(error);
  }
};

export { editCompanyInfo, getCompanyById };
