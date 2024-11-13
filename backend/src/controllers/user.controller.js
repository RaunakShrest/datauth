import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UserModel } from "../models/user.model.js";

import { sendBulkEmail } from "../middlewares/sendEmail.middleware.js";
import { sendResetPasswordEmail } from "../utils/sendResetPasswordEmail.js";
import crypto from "crypto";
const userTypes = () => [
  process.env.USER_TYPE_COMPANY,
  process.env.USER_TYPE_RETAILER,
];
const userStatus = () => [
  process.env.USER_STATUS_PENDING,
  process.env.USER_STATUS_VERIFIED,
  process.env.USER_STATUS_DECLINED,
];

const generateRefreshAndAccessToken = async (userId) => {
  try {
    const user = await UserModel.findOne({ _id: userId });
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    if (!error.message) {
      error.message =
        "something went wrong while generating refresh and access tokens";
    }
    next(error);
  }
};

const userSignup = async (req, res, next) => {
  try {
    const acceptableUserTypes = userTypes();
    const acceptableUserStatus = userStatus();

    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      userType,
      companyName,
      productType,
      status,
      remarks,
      address,
    } = req.body;

    console.log(
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      userType,
      companyName,
      productType
    );

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !phoneNumber ||
      !userType ||
      !companyName ||
      !productType
    ) {
      throw new ApiError(400, "Required Fields Empty");
    }

    // user type checker
    if (
      !acceptableUserTypes.some(
        (eachAcceptableType) => userType.toLowerCase() === eachAcceptableType
      )
    ) {
      throw new ApiError(406, "user type unacceptable");
    }

    // status checker
    if (status) {
      if (
        !acceptableUserStatus.some(
          (eachAccepatbleStatus) =>
            status.toLowerCase() === eachAccepatbleStatus
        )
      ) {
        throw new ApiError(406, "user status unacceptable");
      }
    }

    const existingUser = await UserModel.findOne({ email: email });
    if (existingUser) {
      throw new ApiError(409, "user already exists with the provided email");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userFields = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      userType,
      companyName,
      productType,
      address,
      status,
      remarks,
    };

    const savedUser = await UserModel.create(userFields);
    const recentlySavedUser = await UserModel.findOne({
      _id: savedUser._id,
    }).select("-__v -password -refreshToken");

    return res
      .status(200)
      .json(
        new ApiResponse(201, recentlySavedUser, "user signed up successfully")
      );
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while creating user";
    }
    next(error);
  }
};

const userSignin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await UserModel.findOne({ email: email });

    if (!existingUser) {
      throw new ApiError(404, "User doesn't exist");
    }

    const passwordMatch = await bcrypt.compare(password, existingUser.password);

    if (!passwordMatch) {
      throw new ApiError(401, "Email or Password does not match");
    }
    if (
      existingUser.userType === "company" &&
      existingUser.status !== "enabled"
    ) {
      throw new ApiError(403, "Company user must be enabled to sign in");
    }
    if (
      existingUser.userType === "retailer" &&
      existingUser.status !== "enabled"
    ) {
      throw new ApiError(403, "Retailer must be verified to sign in");
    }

    const { refreshToken, accessToken } = await generateRefreshAndAccessToken(
      existingUser._id
    );

    const signedInUser = await UserModel.findOne({
      _id: existingUser._id,
    }).select("-__v -password -refreshToken");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { user: signedInUser, refreshToken, accessToken },
          "User logged in successfully"
        )
      );
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while signing user in";
    }
    next(error);
  }
};

const userSignout = async (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "unauthorized request");
    }

    let decodedToken;

    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
      error.statusCode = 401;
      error.data = null;
      error.success = false;
      error.name = "jwt error";
      next(error);
    }

    await UserModel.findOneAndUpdate(
      { _id: decodedToken._id },
      {
        $unset: {
          refreshToken: 1,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "user signed out successfully"));
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while signing user out";
    }
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw new ApiError(401, "unauthorized request");
    }

    const users = await UserModel.aggregate([
      {
        $group: {
          _id: "$userType",
          count: {
            $sum: 1,
          },
        },
      },
      {},
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, users, "users fetched successfully"));
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while fetching users";
    }
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const status = req.user.status;
    if (status === "disabled") {
      throw new ApiError(401, "Unauthorized request");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, req.user, "user fetched successfully"));
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while fetching current user";
    }
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while fetching users";
    }
    next(error);
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const incomingRefreshToken = req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request");
    }

    let decodedRefreshToken;

    try {
      decodedRefreshToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
    } catch (error) {
      error.statusCode = 401;
      error.data = null;
      error.success = false;
      error.name = "jwt error";
      next(error);
    }

    const user = await UserModel.findOne({ _id: decodedRefreshToken?._id });

    if (!user) {
      throw new ApiError(404, "unknown user");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "unauthorized request");
    }

    const { refreshToken: newRefreshToken, accessToken } =
      await generateRefreshAndAccessToken(user?._id);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "token refreshed successfully"
        )
      );
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while generating access token";
    }
    next(error);
  }
};
const getCompanies = async (req, res, next) => {
  try {
    const companies = await UserModel.find({ userType: "company" }).select(
      "-__v -password -refreshToken"
    );
    return res
      .status(200)
      .json(new ApiResponse(200, companies, "companies fetched successfully"));
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while fetching companies";
    }
    next(error);
  }
};

const updateCompanyStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status, remarks } = req.body;

  // Trim the ID to remove any leading or trailing whitespace/newline characters
  const trimmedId = id.trim();
  if (!trimmedId || !status) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Company ID and status are required."));
  }

  try {
    // Update both status and remarks
    const updatedCompany = await UserModel.findByIdAndUpdate(
      trimmedId,
      {
        status: status,
        remarks: remarks || "", // Store remarks if provided, default to empty string if not
      },
      { new: true, select: "-__v -password -refreshToken" }
    );

    if (!updatedCompany) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Company not found."));
    }

    if (status.toLowerCase() === "enabled") {
      const emailOptions = [
        {
          from: process.env.SENDER_ADDRESS,
          to: updatedCompany.email,
          subject: "Company enabled",
          text: `Dear ${updatedCompany.companyName}, your company status has been "enabled".`,
          html: `<p>Dear ${updatedCompany.companyName},</p><p>Your company status has been updated to <strong>"enabled"</strong>.</p>`,
        },
      ];
      const emailResult = await sendBulkEmail(emailOptions);
      console.log("Email sent (enabled):", emailResult);
    } else if (status.toLowerCase() === "disabled") {
      const emailOptions = [
        {
          from: process.env.SENDER_ADDRESS,
          to: updatedCompany.email,
          subject: "Company disabled",
          text: `Dear ${updatedCompany.companyName}, unfortunately, your company status has been "disabled".`,
          html: `<p>Dear ${
            updatedCompany.companyName
          },</p><p>Unfortunately, your company status has been updated to <strong>"disabled"</strong>.</p><p>Reason: ${
            remarks || "No additional remarks provided."
          }</p>`,
        },
      ];
      const emailResult = await sendBulkEmail(emailOptions);
      console.log("Email sent (disabled):", emailResult);
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedCompany,
          "Company status updated successfully."
        )
      );
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while updating the company status.";
    }
    next(error);
  }
};

const deleteCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trimmedId = id.trim();
    if (!trimmedId) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Company ID is required."));
    }
    const deletedCompany = await UserModel.findByIdAndDelete(trimmedId).select(
      "-__v -password -refreshToken"
    );

    if (!deletedCompany) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Company not found."));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, deletedCompany, "Company deleted successfully.")
      );
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while deleting the company.";
    }
    next(error);
  }
};

const uploadProfilePicture = async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user._id) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const updatedUser = await UserModel.findByIdAndUpdate(
      user._id,
      { profilePic: filePath },
      { new: true, select: "-__v -password -refreshToken" } // Select non-sensitive fields
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile picture uploaded successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error uploading profile picture",
      error: error.message,
    });
  }
};
const userEditProfile = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || !user._id) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }

    const {
      userId,
      firstName,
      lastName,
      email,
      phoneNumber,
      companyName,
      address,
    } = req.body;

    if (!userId) {
      throw new ApiError(400, "User ID is required");
    }

    if (
      address &&
      (typeof address !== "object" ||
        !address.zip ||
        !address.city ||
        !address.country ||
        !address.addressLine)
    ) {
      throw new ApiError(
        400,
        "Address must be an object with zip, city, country, and addressLine"
      );
    }

    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      throw new ApiError(404, "User not found");
    }

    const updatedUserFields = {
      firstName,
      lastName,
      email,
      phoneNumber,
      companyName,
      address, // Update with the new address structure
    };

    // Update the user in the database
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      updatedUserFields,
      { new: true, runValidators: true }
    ).select("-__v -password -refreshToken");

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedUser, "User profile updated successfully")
      );
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while updating user profile";
    }
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ApiError(400, "Email is required");
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new ApiError(404, "User with the provided email does not exist");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 10);
    const tokenExpiry = Date.now() + 3600000; // Token valid for 1 hour

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = tokenExpiry;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL_DEV}/resetPassword?token=${resetToken}&email=${user.email}`;
    await sendResetPasswordEmail(user.email, resetLink);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password reset link sent to your email"));
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      throw new ApiError(400, "Token, email, and new password are required");
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new ApiError(404, "User with the provided email does not exist");
    }

    if (!user.resetPasswordToken || !user.resetPasswordExpires) {
      throw new ApiError(400, "No password reset token found for this user");
    }

    if (user.resetPasswordExpires < Date.now()) {
      throw new ApiError(400, "Password reset token has expired");
    }

    const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isTokenValid) {
      throw new ApiError(400, "Invalid or expired password reset token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password has been successfully reset"));
  } catch (error) {
    next(error);
  }
};

export {
  userSignup,
  userEditProfile,
  uploadProfilePicture,
  userSignin,
  userSignout,
  getUsers,
  getCurrentUser,
  updateUser,
  refreshAccessToken,
  getCompanies,
  updateCompanyStatus,
  deleteCompany,
  forgotPassword,
  resetPassword,
};
