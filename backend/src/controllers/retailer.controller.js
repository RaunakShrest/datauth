import { ApiResponse } from "../utils/ApiResponse.js";
import { UserModel } from "../models/user.model.js";
import { sendBulkEmail } from "../middlewares/sendEmail.middleware.js";
import mongoose from "mongoose";
import axios from "axios";
import { ApiError } from "../utils/ApiError.js";
import crypto from "crypto";

const getRetailers = async (req, res, next) => {
  const blockChainToken = req.blockChainToken;
  console.log("The blockchain token is:", blockChainToken);
  if (!blockChainToken) {
    throw new ApiError(401, "Authorization token of blockchain not found");
  }
  console.log(
    "=================Starting getRetailers controller========================"
  );

  try {
    const { page = 1, limit = 10 } = req.query;

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    // Fetch retailers with pagination
    const filters = { userType: "retailer" };
    const retailers = await UserModel.find(filters)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .lean()
      .sort({ createdAt: -1 });

    const totalItems = await UserModel.countDocuments(filters);

    if (!retailers || retailers.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No retailers found",
      });
    }

    // Transform retailers into the desired format
    const transformedRetailers = retailers.map((retailer) => ({
      id: retailer._id.toString(),
      address: {
        zip: retailer.address?.zip || null,
        city: retailer.address?.city || null,
        country: retailer.address?.country || null,
        addressLine: retailer.address?.addressLine || null,
      },
      firstName: retailer.firstName,
      lastName: retailer.lastName,
      email: retailer.email,
      password: retailer.password,
      phoneNumber: retailer.phoneNumber,
      userType: retailer.userType,
      productType: retailer.productType,
      companyName: retailer.companyName,
      status: retailer.status,
      profilePic: retailer.profilePic || "http://example.com/logo.png",
      remarks: retailer.remarks,
      createdAt: retailer.createdAt.toISOString(),
    }));

    // Generate hashes for each retailer
    const hashedRetailers = transformedRetailers.map((retailer) => {
      const retailerForHashing = { ...retailer };
      delete retailerForHashing.hash; // Remove any existing hash field if present

      const retailerString = JSON.stringify(retailerForHashing);

      const hash = crypto
        .createHash("sha256")
        .update(retailerString)
        .digest("hex");

      return { ...retailer, hash }; // Append hash to the retailer object
    });

    const retailerIds = hashedRetailers.map((retailer) => retailer.id);

    let retailersWithBlockchainVerification = [];

    try {
      // External API call
      const payload = {
        fcn: "GetCompanyWithHash",
        args: retailerIds,
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
        const comparisonResults = hashedRetailers.map((retailer) => {
          const apiRetailer = apiHashes.find(
            (apiHash) => apiHash.id === retailer.id
          );

          if (apiRetailer) {
            let blockChainVerified;
            if (apiRetailer.blockHash.trim().toLowerCase() === "pending") {
              blockChainVerified = "pending";
            } else {
              blockChainVerified = apiRetailer.blockHash === retailer.hash;
            }

            return {
              retailerId: retailer.id,
              blockChainVerified,
              generatedHash: retailer.hash,
              retailerName: retailer.companyName,
              apiHash: apiRetailer.blockHash,
            };
          } else {
            return {
              retailerId: retailer.id,
              blockChainVerified: false, // Default to false if not found
              generatedHash: retailer.hash,
              retailerName: retailer.companyName,
              apiHash: null,
            };
          }
        });

        console.log("Comparison Results:", comparisonResults);

        // Add `blockChainVerified` to the transformed retailers
        retailersWithBlockchainVerification = comparisonResults.map(
          (result) => {
            const retailer = hashedRetailers.find(
              (ret) => ret.id === result.retailerId
            );
            return {
              ...retailer,
              blockChainVerified: result.blockChainVerified,
            };
          }
        );
      }
    } catch (err) {
      console.error("Error sending request:", err.message);
      retailersWithBlockchainVerification = hashedRetailers.map((retailer) => ({
        ...retailer,
        blockChainVerified: false, // Default to false if comparison fails
      }));
    }

    // Final Response with Pagination
    return res.status(200).json({
      statusCode: 200,
      data: "Retailers fetched successfully",
      message: {
        retailers: retailersWithBlockchainVerification,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / options.limit),
          currentPage: options.page,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching retailers:", error.message);
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
    const retailerData = await UserModel.findById(
      trimmedId,
      "-__v -refreshToken"
    );

    if (!retailerData) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Retailer not found."));
    }

    console.log("Retailer data:", retailerData);

    if (
      status.toLowerCase() === "enabled" ||
      status.toLowerCase() === "disabled"
    ) {
      try {
        console.log(`Processing retailer status change to: ${status}`);

        const args = [
          retailerData._id.toString(),
          retailerData.companyName,
          retailerData.address?.zip,
          retailerData.address?.city,
          retailerData.address?.country,
          retailerData.address?.addressLine,
          status.toLowerCase(),
          remarks || "",
          retailerData.profilePic || "http://example.com/logo.png",
          retailerData.firstName,
          retailerData.lastName,
          retailerData.email,
          retailerData.password,
          retailerData.phoneNumber,
          retailerData.userType,
          JSON.stringify(retailerData.productType || ["General"]),
          retailerData.createdAt.toISOString(),
          retailerData.updatedAt.toISOString(),
        ];

        console.log("Constructed args array for retailer:", args);

        const payload = {
          fcn: "CreateCompany",
          args,
        };

        const registerPayload = {
          userid: retailerData._id,
          orgName:
            retailerData.userType.charAt(0).toUpperCase() +
            retailerData.userType.slice(1),
          companyName: retailerData.companyName,
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
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (apiResponse.data?.errorData) {
          return res.status(503).json({
            message: `Unable to update retailer status to "${status}" due to an external API error.`,
            error: apiResponse.data?.error || "Unknown error occurred",
            errorData: apiResponse.data?.errorData || null,
          });
        }

        const updatedRetailer = await UserModel.findByIdAndUpdate(
          trimmedId,
          { status: status.toLowerCase(), remarks: remarks || "" },
          { new: true, select: "-__v -password -refreshToken" }
        );

        const emailOptions = [
          {
            from: process.env.SENDER_ADDRESS,
            to: updatedRetailer.email,
            subject: `Retailer ${status}`,
            html: `<p>Dear ${updatedRetailer.companyName},</p>
                   <p>Your retailer status has been updated to <strong>"${status}"</strong>.</p>
                   <p>Remarks: ${remarks || "No remarks provided."}</p>`,
          },
        ];

        await sendBulkEmail(emailOptions);

        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              updatedRetailer,
              `Retailer status updated to "${status}" successfully.`
            )
          );
      } catch (error) {
        console.error("Error in external API call:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        return res.status(503).json({
          message: `Unable to update retailer status to "${status}" due to an error with the external API.`,
          error: error.response?.data || error.message,
        });
      }
    } else {
      const updatedRetailer = await UserModel.findByIdAndUpdate(
        trimmedId,
        { status, remarks: remarks || "" },
        { new: true, select: "-__v -password -refreshToken" }
      );

      if (!updatedRetailer) {
        return res
          .status(404)
          .json(new ApiResponse(404, null, "Retailer not found."));
      }

      const emailOptions = [
        {
          from: process.env.SENDER_ADDRESS,
          to: updatedRetailer.email,
          subject: `Retailer ${status}`,
          html: `<p>Dear ${updatedRetailer.companyName},</p>
                 <p>Your retailer status has been updated to <strong>"${status}"</strong>.</p>
                 <p>Remarks: ${remarks || "No remarks provided."}</p>`,
        },
      ];

      await sendBulkEmail(emailOptions);

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            updatedRetailer,
            `Retailer status updated to "${status}" successfully.`
          )
        );
    }
  } catch (error) {
    console.error("Error in updating retailer status:", error);
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
  const blockChainToken = req.blockChainToken;
  console.log("The blockchain token is:", blockChainToken);

  try {
    const { retailerId } = req.params;
    const updateData = req.body;

    const updatedRetailer = await UserModel.findByIdAndUpdate(
      retailerId,
      { $set: updateData }, // Apply updates from the body
      { new: true, runValidators: true, select: "-__v -password -refreshToken" }
    );

    if (!updatedRetailer) {
      return next(new ApiError(404, "Retailer not found"));
    }

    // Prepare blockchain arguments
    const args = [
      updatedRetailer._id.toString(),
      updatedRetailer.companyName || "",
      updatedRetailer.address?.zip || "",
      updatedRetailer.address?.city || "",
      updatedRetailer.address?.country || "",
      updatedRetailer.address?.addressLine || "",
      updatedRetailer.firstName || "",
      updatedRetailer.lastName || "",
      updatedRetailer.email || "",
      updatedRetailer.phoneNumber || "",
      updatedRetailer.userType || "",
      JSON.stringify(updatedRetailer.productType || ["General"]),
    ];

    const payload = {
      fcn: "EditCompany",
      args,
    };

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

    // Log the response from the blockchain API
    console.log("Response from blockchain API:", response.data);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedRetailer,
          "Retailer info updated successfully and sent to blockchain"
        )
      );
  } catch (error) {
    console.error(
      "Error while updating retailer info or sending to blockchain:",
      error.message
    );

    if (!error.message) {
      error.message = "Something went wrong while updating retailer info";
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
