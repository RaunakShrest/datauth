import { ApiResponse } from "../utils/ApiResponse.js";
import { UserModel } from "../models/user.model.js";
import { sendBulkEmail } from "../middlewares/sendEmail.middleware.js";
import mongoose from "mongoose";

const getRetailers = async (req, res, next) => {
  try {
    const retailers = await UserModel.find({ userType: "retailer" });
    return res
      .status(200)
      .json(new ApiResponse(200, retailers, "Retailers fetched sucessfully"));
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while fetching retailers";
    }
    next(error);
  }
};
const updateRetailerStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status, remarks } = req.body;
  const trimmedId = id.trim();
  if (!trimmedId || !status) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Retailer ID and status are required."));
  }

  try {
    const updatedRetailer = await UserModel.findByIdAndUpdate(
      trimmedId,
      { status: status, remarks: remarks || "" },
      { new: true, select: "-__v -password -refreshToken" }
    );
    if (!updatedRetailer) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Retailer not found."));
    }
    if (status.toLowerCase() === "enabled") {
      const emailOptions = [
        {
          from: process.env.SENDER_ADDRESS,
          to: updatedRetailer.email,
          subject: "Retailer Verified",
          text: `Dear ${updatedRetailer.companyName}, your retailer status has been  "verified" .`,
          html: `<p>Dear ${updatedRetailer.companyName},</p><p>Your retailer status has been updated to <strong>"verified"</strong>.</p>`,
        },
      ];

      const emailResult = await sendBulkEmail(emailOptions);
      console.log("Email sent (enabled): ", emailResult);
    } else if (status.toLowerCase() === "disabled") {
      const emailOptions = [
        {
          from: process.env.SENDER_ADDRESS,
          to: updatedRetailer.email,
          subject: "Retailer disabled",
          text: `Dear  ${updatedRetailer.companyName}, unfortunately, your retailer status has been "disabled".`,
          html: `<p>Dear ${
            updatedRetailer.companyName
          },</p><p>Unfortunately, your retailer status has been updated to <strong>"disabled"</strong>.</p><p>Reason: ${
            remarks || "No additional remarks provided."
          }</p>`,
        },
      ];
      const emailResult = await sendBulkEmail(emailOptions);
      console.log("Email send (disabled", emailResult);
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedRetailer,
          "Retailer status updated successfully."
        )
      );
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while updating the company status.";
    }
    next(error);
  }
};
const getRetailerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid retailer ID format"));
    }

    const retailer = await UserModel.findById(id).select(
      "-__v -password -refreshToken"
    );
    if (!retailer) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Retailer not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, retailer, "Retailer details fetched successfully")
      );
  } catch (error) {
    console.error(error);
    if (!error.message) {
      error.message = "Something went wrong while fetching retailer details";
    }
    next(error);
  }
};

const editRetailerInfo = async (req, res, next) => {
  try {
    const { retailerId } = req.params; // Get retailerId from the URL params
    const updateData = req.body;
    const updatedRetailer = await UserModel.findByIdAndUpdate(
      retailerId,
      { $set: updateData }, // Apply updates from the body
      { new: true, runValidators: true, select: "-__v -password -refreshToken" }
    );

    if (!updatedRetailer) {
      return next(new ApiError(404, "Retailer not found"));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedRetailer,
          "Retailer info updated successfully"
        )
      );
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while retailer retailer info";
    }
    next(error);
  }
};

export {
  getRetailers,
  updateRetailerStatus,
  getRetailerById,
  editRetailerInfo,
};
