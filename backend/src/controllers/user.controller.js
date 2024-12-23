import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UserModel } from "../models/user.model.js";

import { sendBulkEmail } from "../middlewares/sendEmail.middleware.js";
import { sendResetPasswordEmail } from "../utils/sendResetPasswordEmail.js";
import crypto from "crypto";
import axios from "axios";

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
      !companyName
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
/* 
//orginal without hash code
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
*/

const getCompanyIds = async (req, res, next) => {
  try {
    const companyIds = await UserModel.find({ userType: "company" }).select(
      "_id"
    );
    const ids = companyIds.map((company) => company._id);

    // If called via an HTTP request, send a response
    if (res && req) {
      return res.status(200).json({
        status: 200,
        message: "Company IDs fetched successfully",
        data: ids,
      });
    }

    // If called programmatically, just return the IDs
    return ids;
  } catch (error) {
    if (!error.message) {
      error.message = "Failed to fetch company IDs";
    }
    if (next) next(error);
    throw error; // Rethrow error for programmatic use
  }
};

const getCompanies = async (req, res, next) => {
  const blockChainToken = "asdzxcxzcasd";
  if (!blockChainToken) {
    throw new ApiError(401, "Authorization token of blockchain not found");
  }
  console.log(
    "=================Starting getCompanies controller========================"
  );

  try {
    const companies = await UserModel.find({ userType: "company" })
      .sort({ createdAt: -1 })
      .lean();

    if (!companies || companies.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No companies found",
      });
    }

    // Transform all companies into the desired format
    const transformedCompanies = companies.map((company) => ({
      id: company._id.toString(),
      address: {
        zip: company.address?.zip || null,
        city: company.address?.city || null,
        country: company.address?.country || null,
        addressLine: company.address?.addressLine || null,
      },
      firstName: company.firstName,
      lastName: company.lastName,
      email: company.email,
      password: company.password,
      phoneNumber: company.phoneNumber,
      userType: company.userType,
      productType: company.productType,
      companyName: company.companyName,
      status: company.status,
      profilePic: company.profilePic || "http://example.com/logo.png",
      remarks: company.remarks,
      createdAt: company.createdAt.toISOString(),
    }));

    const hashedCompanies = transformedCompanies.map((company) => {
      const companyForHashing = { ...company };
      delete companyForHashing.hash; // Exclude any pre-existing hash field (if present)

      const companyString = JSON.stringify(companyForHashing);
      const hash = crypto
        .createHash("sha256")
        .update(companyString)
        .digest("hex");

      return { ...company, hash }; // Append hash to the company object
    });

    const companyIds = hashedCompanies.map((company) => company.id);

    try {
      const payload = {
        fcn: "GetCompanyWithHash",
        args: companyIds,
      };

      const response = await axios.post(
        `${process.env.BLOCKCHAIN_TEST_URL}/channels/mychannel/chaincodes/Company`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${blockChainToken}`,
          },
        }
      );

      if (
        response.data &&
        response.data.result &&
        response.data.result.result
      ) {
        const apiHashes = response.data.result.result;

        // Compare generated hashes with API hashes
        const comparisonResults = hashedCompanies.map((company) => {
          const apiCompany = apiHashes.find(
            (apiHash) => apiHash.id === company.id
          );

          if (apiCompany) {
            let blockChainVerified;
            if (apiCompany.blockHash.trim().toLowerCase() === "pending") {
              blockChainVerified = "pending";
            } else {
              blockChainVerified = apiCompany.blockHash === company.hash;
            }

            return {
              companyId: company.id,
              blockChainVerified,
              generatedHash: company.hash,
              companyName: company.companyName,
              apiHash: apiCompany.blockHash,
            };
          } else {
            return {
              companyId: company.id,
              blockChainVerified: false, // Default to false if not found
              generatedHash: company.hash,
              companyName: company.companyName,
              apiHash: null,
            };
          }
        });

        console.log("Comparison Results:", comparisonResults);

        // Add `blockChainVerified` to the transformed companies
        const companiesWithBlockchainVerification = comparisonResults.map(
          (result) => {
            const company = hashedCompanies.find(
              (comp) => comp.id === result.companyId
            );
            return {
              ...company,
              blockChainVerified: result.blockChainVerified,
            };
          }
        );

        return res.status(200).json({
          status: 200,
          message: "Companies fetched successfully",
          data: companiesWithBlockchainVerification,
        });
      }
    } catch (err) {
      console.error("Error sending request:", err.message);
    }

    return res.status(200).json({
      status: 200,
      message: "Companies fetched successfully",
      data: hashedCompanies.map((company) => ({
        ...company,
        blockChainVerified: false, // Default to false if the comparison isn't successful
      })),
    });
  } catch (error) {
    console.error("Error fetching companies:", error.message);
    next(error);
  }
};

const updateCompanyStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status, remarks } = req.body;
  console.log("the id of params is", req.params);
  const trimmedId = id.trim();
  console.log("trimmed id are ", trimmedId);
  if (!trimmedId || !status) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Company ID and status are required."));
  }

  try {
    const companyData = await UserModel.findById(
      trimmedId,
      "-__v -refreshToken"
    );

    if (!companyData) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Company not found."));
    }
    console.log("User id is ", companyData._id);
    console.log("user password is", companyData.password);

    if (
      status.toLowerCase() === "enabled" ||
      status.toLowerCase() === "disabled"
    ) {
      try {
        console.log(
          `Registering company in friend's API for status: ${status}...`
        );

        const args = [
          companyData._id.toString(),
          companyData.companyName,
          companyData.address.zip,
          companyData.address.city,
          companyData.address.country,
          companyData.address.addressLine,
          status.toLowerCase(),
          remarks || "",
          companyData.profilePic || "http://example.com/logo.png",
          companyData.firstName,
          companyData.lastName,
          companyData.email,
          companyData.password,
          companyData.phoneNumber,
          companyData.userType,
          JSON.stringify(companyData.productType || ["General"]),
          companyData.createdAt.toISOString(),
          companyData.updatedAt.toISOString(),
        ];

        console.log("Constructed args array:", args);
        console.log("current staatus is ", status);
        console.log("the remarks is", companyData.remarks);

        const payload = {
          fcn: "CreateCompany",
          // peers: ["peer0.company.example.com"],
          args,
        };

        const registerPayload = {
          userid: companyData._id,
          orgName:
            companyData.userType.charAt(0).toUpperCase() +
            companyData.userType.slice(1),

          companyName: companyData.companyName,
        };

        const registerResponse = await axios.post(
          `${process.env.BLOCKCHAIN_TEST_URL}/register`,
          registerPayload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const token = registerResponse.data?.token;
        if (!token) {
          return res
            .status(500)
            .json({ message: "Failed to fetch token from /register API." });
        }

        const apiResponse = await axios.post(
          `${process.env.BLOCKCHAIN_TEST_URL}/channels/mychannel/chaincodes/Company`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Use the fetched token here
            },
          }
        );

        console.log(
          `API Response of CompanyChaincode for ${status}:`,
          apiResponse.data
        );
        if (apiResponse.data?.errorData != null) {
          console.error(
            `API Response  failure for status: ${status}`,
            apiResponse.data
          );

          // Do not enable or disable the company
          return res.status(503).json({
            message: `Unable to update company status to "${status}" due to a DiscoveryService failure.`,
            error: apiResponse.data?.error || "Unknown error occurred",
            errorData: apiResponse.data?.errorData || null,
          });
        }

        // If API call succeeds, update the company status
        const updatedCompany = await UserModel.findByIdAndUpdate(
          trimmedId,
          { status: status.toLowerCase(), remarks: remarks || "" },
          { new: true, select: "-__v -password -refreshToken" }
        );

        if (!updatedCompany) {
          return res
            .status(404)
            .json(new ApiResponse(404, null, "Company not found."));
        }

        const emailOptions = [
          {
            from: process.env.SENDER_ADDRESS,
            to: updatedCompany.email,
            subject: `Company ${status}`,
            html: `<p>Dear ${updatedCompany.companyName},</p>
            <p>We’re excited to let you know that your company’s status has been updated to <strong>"${status}"</strong>.</>
            <p>You can log in anytime at ${
              process.env.FRONTEND_URL_DEV
            } to explore further updates.</p>
            <p>Thank you for choosing AuthyProduct. We’re thrilled to have you on board!</p>
            <p>Remarks: ${remarks || "No additional remarks at this time."}</p>
            <p>Warm regards,</p>
            <p>The AuthyProduct Team</p>`,
          },
        ];
        try {
          await sendBulkEmail(emailOptions);
          console.log(
            `Email sent successfully to ${updatedCompany.email} for status: ${status}`
          );
        } catch (emailError) {
          console.error(
            `Failed to send email for status: ${status}`,
            emailError
          );
        }

        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              updatedCompany,
              `Company status updated to "${status}" successfully.`
            )
          );
      } catch (error) {
        console.error("Error in friend's API call:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        return res.status(503).json({
          message: `Unable to update company status to "${status}" due to an error with the external API.`,
          error: error.response?.data || error.message,
        });
      }
    } else {
      // Handle status updates other than "enabled" or "disabled"
      const updatedCompany = await UserModel.findByIdAndUpdate(
        trimmedId,
        { status, remarks: remarks || "" },
        { new: true, select: "-__v -password -refreshToken" }
      );

      if (!updatedCompany) {
        return res
          .status(404)
          .json(new ApiResponse(404, null, "Company not found."));
      }

      const emailOptions = [
        {
          from: process.env.SENDER_ADDRESS,
          to: updatedCompany.email,
          subject: `Company ${status}`,
          html: `<p>Dear ${updatedCompany.companyName},</p>
                 <p>Your company status has been updated to <strong>"${status}"</strong>.</p>
                 <p>Remarks: ${remarks || "No remarks provided."}</p>`,
        },
      ];
      try {
        await sendBulkEmail(emailOptions);
        console.log(
          `Email sent successfully to ${updatedCompany.email} for status: ${status}`
        );
      } catch (emailError) {
        console.error(`Failed to send email for status: ${status}`, emailError);
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            updatedCompany,
            `Company status updated to "${status}" successfully.`
          )
        );
    }
  } catch (error) {
    console.error("Error in updating company status:", error);
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

const testHash = async (req, res, next) => {
  try {
    // Data to be hashed
    const companyForHashing = {
      id: "67556ef010c2827a01e78073",
      productName: "nothingos",
      productDescription: "asd",
      productPrice: 250,
      productSku: "axcwqs",
      batchId: [
        {
          _id: "67554a52b2ffdf0e461a0890",
          batchId: "sanitizedBatch",
        },
      ],
      productStatus: "completed",
      productType: [
        {
          _id: "673057fd720e9239c26e4e6f",
          name: "Apple",
        },
      ],
      productManufacturer: [
        {
          _id: "6704c07f37d54fbca4a5644d",
          companyName: "RamEst",
        },
      ],
      productAttributes: [
        {
          attributeName: "zxc",
          attributeValue: "zxczc",
          _id: "67556ef110c2827a01e78077",
        },
      ],
      slug: "nothingos-1",
      productImages: [
        "uploads\\productItems\\productItems-1733652208256-188790226.jpg",
        "uploads\\productItems\\productItems-1733652208260-618980227.jpg",
      ],
      productWebLink: "https://ww4.fmovies.co/tv-series/",
      createdAt: "2024-12-08T10:03:28.362Z",
      qrUrl:
        "https://res.cloudinary.com/dboot4gi3/image/upload/v1733652209/bxcxrowamuhwzjrdfjap.png",
      soldBy: null,
      purchasedStatus: false,
    };

    // Convert the object to a string
    const companyString = JSON.stringify(companyForHashing);
    // console.log(companySt);

    // Generate the SHA-256 hash
    const hash = crypto
      .createHash("sha256")
      .update(companyString)
      .digest("hex");

    // Return the response with the hash and original data
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { ...companyForHashing, hash },
          "Hash generated successfully."
        )
      );
  } catch (error) {
    // Catch any errors and pass them to the error handler
    if (!error.message) {
      error.message = "Something went wrong while generating the hash.";
    }
    next(error);
  }
};

const uploadProfilePicture = async (req, res) => {
  const blockChainToken = req.blockChainToken;
  console.log("The blockchain token is:", blockChainToken);

  if (!blockChainToken) {
    return res
      .status(401)
      .json({ message: "Authorization token of blockchain not found" });
  }

  try {
    const user = req.user;

    if (!user || !user._id) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;

    // Prepare data for the external API
    const payload = {
      fcn: "EditCompanyProfile",
      peers: ["peer0.company.example.com"],
      args: [
        user._id,
        filePath,
        user.firstName,
        user.lastName,
        user.email,
        user.phoneNumber,
        user.companyName || "DefaultCompany",
        user.address.zip || "00000",
        user.address.city || "City",
        user.address.country || "Country",
        user.address.addressLine || "Address Line",
      ],
    };

    console.log("Sending profilePic to external API:", filePath);

    // Call the external API
    const apiResponse = await axios.post(
      `${process.env.BLOCKCHAIN_TEST_URL}/channels/mychannel/chaincodes/Company`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${blockChainToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Response from uploadProfile:", apiResponse.data);

    // Check if the response contains an  warning
    if (
      apiResponse.data &&
      (apiResponse.data.error || !apiResponse.data.result)
    ) {
      console.error("External API error:", apiResponse.data.errorData);
      return res.status(503).json({
        message:
          "Unable to update company profile due to an external API failure.",
        error: apiResponse.data.error || "Unknown error occurred",
        errorData: apiResponse.data.errorData || null,
      });
    }

    // Proceed with updating the user in the database only if the external API is successful
    const updatedUser = await UserModel.findByIdAndUpdate(
      user._id,
      { profilePic: filePath },
      { new: true, select: "-__v -password -refreshToken" }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return a combined response
    return res.status(200).json({
      message: "Profile picture uploaded and external API called successfully",
      user: updatedUser,
      externalApiResponse: apiResponse.data,
    });
  } catch (error) {
    console.error("Unexpected error:", error.message);
    return res.status(500).json({
      message: "Error uploading profile picture or calling external API",
      error: error.message,
    });
  }
};

// const userEditProfile = async (req, res, next) => {
//   try {
//     const user = req.user;
//     if (!user || !user._id) {
//       return res.status(401).json({ message: "Unauthorized. User not found." });
//     }

//     const {
//       userId,
//       firstName,
//       lastName,
//       email,
//       phoneNumber,
//       companyName,
//       address,
//     } = req.body;

//     if (!userId) {
//       throw new ApiError(400, "User ID is required");
//     }

//     if (
//       address &&
//       (typeof address !== "object" ||
//         !address.zip ||
//         !address.city ||
//         !address.country ||
//         !address.addressLine)
//     ) {
//       throw new ApiError(
//         400,
//         "Address must be an object with zip, city, country, and addressLine"
//       );
//     }

//     const existingUser = await UserModel.findById(userId);
//     if (!existingUser) {
//       throw new ApiError(404, "User not found");
//     }

//     const updatedUserFields = {
//       firstName,
//       lastName,
//       email,
//       phoneNumber,
//       companyName,
//       address, // Update with the new address structure
//     };

//     // Update the user in the database
//     const updatedUser = await UserModel.findByIdAndUpdate(
//       userId,
//       updatedUserFields,
//       { new: true, runValidators: true }
//     ).select("-__v -password -refreshToken");

//     return res
//       .status(200)
//       .json(
//         new ApiResponse(200, updatedUser, "User profile updated successfully")
//       );
//   } catch (error) {
//     if (!error.message) {
//       error.message = "Something went wrong while updating user profile";
//     }
//     next(error);
//   }
// };

const userEditProfile = async (req, res, next) => {
  const blockChainToken = req.blockChainToken;
  console.log("The blockchain token is:", blockChainToken);

  if (!blockChainToken) {
    return res
      .status(401)
      .json({ message: "Authorization token of blockchain not found" });
  }

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

    // Prepare data for the external API
    const payload = {
      fcn: "EditCompanyProfile",
      // peers: ["peer0.company.example.com"],
      args: [
        userId,
        existingUser.profilePic,
        firstName || existingUser.firstName,
        lastName || existingUser.lastName,
        email || existingUser.email,
        phoneNumber || existingUser.phoneNumber,
        companyName || existingUser.companyName,
        address?.zip || existingUser.address.zip,
        address?.city || existingUser.address.city,
        address?.country || existingUser.address.country,
        address?.addressLine || existingUser.address.addressLine,
      ],
    };

    console.log("Sending profile data to external API:", payload);

    // Call the external API
    const apiResponse = await axios.post(
      `${process.env.BLOCKCHAIN_TEST_URL}/channels/mychannel/chaincodes/Company`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${blockChainToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Check if the API response indicates a failure
    if (
      apiResponse.status !== 200 ||
      apiResponse.data?.error ||
      !apiResponse.data?.result
    ) {
      console.error("External API error:", apiResponse.data?.errorData);
      return res.status(503).json({
        message: "Failed to update profile via external API",
        error: apiResponse.data?.error || "Unknown error occurred",
        errorData: apiResponse.data?.errorData || null,
      });
    }

    // If the external API succeeds, update the user in the database
    const updatedUserFields = {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(email && { email }),
      ...(phoneNumber && { phoneNumber }),
      ...(companyName && { companyName }),
      ...(address && { address }),
    };

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      updatedUserFields,
      { new: true, runValidators: true }
    ).select("-__v -password -refreshToken");

    if (!updatedUser) {
      throw new ApiError(404, "Failed to update user");
    }

    // Return a success response
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: updatedUser,
          externalApiResponse: apiResponse.data,
        },
        "User profile updated successfully and external API called"
      )
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
const blockChainTokenController = async (req, res, next) => {
  // console.log(req.user);
  try {
    // Check if req.user is defined
    if (!req.user) {
      throw new ApiError(401, "User not authenticated");
    }

    const { firstName, _id, userType } = req.user;
    if (!firstName || !_id) {
      throw new ApiError(400, "Missing required user information");
    }

    // Capitalize the first letter of userType
    const formattedUserType =
      userType === "super-admin"
        ? "Superadmin"
        : userType.charAt(0).toUpperCase() + userType.slice(1);
    const payload = {
      username: firstName,
      orgName: formattedUserType,
    };

    // Call the external API
    const response = await axios.post(
      `${process.env.BLOCKCHAIN_TEST_URL}/users/token`,
      payload
    );
    console.log("response from blockChainToken", response.data);

    // Extract token from response
    const blockChainToken = response.data?.message?.token;

    if (!blockChainToken) {
      throw new ApiError(500, "Token not received from blockchain API");
    }

    // Store the token in the request object for later use
    req.token = blockChainToken;

    next();
  } catch (error) {
    // Handle errors and provide appropriate message
    if (!error.message) {
      error.message = "Something went wrong while calling the user token API";
    }
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
  getCompanyIds,
  testHash,
  blockChainTokenController,
};
