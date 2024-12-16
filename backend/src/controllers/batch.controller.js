import { BatchIdModal } from "../models/batchId.modal.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import crypto from "crypto";
import axios from "axios";
import moment from "moment";

const postBatchId = async (req, res, next) => {
  console.log("blockChainToken:", req.blockChainToken); // Log the token
  const blockChainToken = req.blockChainToken;
  try {
    const { batchId, startDate, endDate } = req.body;
    const userId = req.user._id;

    // Validate inputs
    if (!batchId || batchId.trim() === "") {
      throw new ApiError(400, "Batch ID is required");
    }
    if (!blockChainToken) {
      throw new ApiError(400, "Blockchain token is missing");
    }

    // Normalize dates to UTC
    const normalizedStartDate = moment(startDate).utc().toDate();
    const normalizedEndDate = moment(endDate).utc().toDate();

    console.log("Normalized Start Date:", normalizedStartDate);
    console.log("Normalized End Date:", normalizedEndDate);

    // Check for existing Batch ID
    const existingBatch = await BatchIdModal.findOne({ batchId });
    if (existingBatch) {
      throw new ApiError(409, "Batch ID already exists");
    }

    // Create batch object
    const createdBatch = new BatchIdModal({
      batchId,
      createdBy: userId,
      startDate: normalizedStartDate,
      endDate: normalizedEndDate,
    });

    // Save the batch to populate createdAt
    await createdBatch.save();

    console.log("Created Batch Document:", createdBatch);

    // Prepare API payload
    const apiPayload = {
      fcn: "CreateBatch",
      args: [
        createdBatch._id.toString(),
        batchId,
        userId.toString(),
        normalizedStartDate.toISOString(),
        normalizedEndDate.toISOString(),
        createdBatch.createdAt.toISOString(), // Access createdAt after save
      ],
    };

    const apiUrl = `${process.env.BLOCKCHAIN_TEST_URL}/channels/mychannel/chaincodes/Batch`;
    console.log("Sending API payload:", apiPayload);

    // Send request to API
    const apiResponse = await axios.post(apiUrl, apiPayload, {
      headers: {
        Authorization: `Bearer ${blockChainToken}`,
        "Content-Type": "application/json",
      },
    });

    // Check API response status
    if (apiResponse.status !== 200 && apiResponse.status !== 201) {
      throw new ApiError(
        apiResponse.status,
        `API call failed: ${apiResponse.data?.message || "Unknown error"}`
      );
    }

    return res
      .status(201)
      .json(new ApiResponse(201, createdBatch, "Batch ID posted successfully"));
  } catch (error) {
    console.error("Error details:", error); // Log detailed error
    if (!error.message) {
      error.message = "Something went wrong while posting the batch ID";
    }
    next(error);
  }
};

// const postBatchId = async (req, res, next) => {
//   try {
//     const { batchId, startDate, endDate } = req.body;
//     const userId = req.user._id;

//     if (!batchId || batchId.trim() === "") {
//       throw new ApiError(400, "Batch ID is required");
//     }

//     const existingBatch = await BatchIdModal.findOne({ batchId });
//     if (existingBatch) {
//       throw new ApiError(409, "Batch ID already exists");
//     }

//     const createdBatch = await BatchIdModal.create({
//       batchId,
//       createdBy: userId,
//       startDate,
//       endDate,
//     });

//     return res
//       .status(201)
//       .json(new ApiResponse(201, createdBatch, "Batch ID posted successfully"));
//   } catch (error) {
//     if (!error.message) {
//       error.message = "Something went wrong while posting the batch ID";
//     }
//     next(error);
//   }
// };

const getAllBatchIds = async (req, res, next) => {
  try {
    const batchIds = await BatchIdModal.find().select("batchId _id"); // Include _id in the selection

    if (!batchIds || batchIds.length === 0) {
      throw new ApiError(404, "No batch IDs found");
    }
    const responseBatchIds = batchIds.map((batch) => ({
      _id: batch._id, // ObjectId
      batchId: batch.batchId, // Human-readable batch ID
    }));

    return res
      .status(200)
      .json(
        new ApiResponse(200, responseBatchIds, "Batch IDs fetched successfully")
      );
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while fetching batch IDs";
    }
    next(error);
  }
};

// const getBatchId = async (req, res, next) => {
//   try {
//     const { userType, _id: userId } = req.user;
//     let batchIds;

//     if (userType === "super-admin") {
//       batchIds = await BatchIdModal.find()
//         .select("batchId startDate endDate _id createdAt updatedAt createdBy")
//         .populate({
//           path: "createdBy",
//           select: "companyName _id",
//           match: { companyName: { $exists: true } },
//         });
//     } else {
//       batchIds = await BatchIdModal.find({ createdBy: userId })
//         .select("batchId startDate endDate _id createdAt updatedAt createdBy")
//         .populate("createdBy", "companyName _id");
//     }

//     batchIds = batchIds.filter((batch) => batch.createdBy);

//     if (!batchIds || batchIds.length === 0) {
//       throw new ApiError(404, "No batch IDs found");
//     }

//     const responseBatchIds = batchIds.map((batch) => ({
//       _id: batch._id,
//       batchId: batch.batchId,
//       createdBy: {
//         userId: batch.createdBy._id,
//         companyName: batch.createdBy.companyName,
//       },
//       startDate: batch.startDate,
//       endDate: batch.endDate,
//       createdAt: batch.createdAt,
//       updatedAt: batch.updatedAt || null, // Ensure `updatedAt` exists, fallback to null
//     }));

//     return res
//       .status(200)
//       .json(
//         new ApiResponse(200, responseBatchIds, "Batch IDs fetched successfully")
//       );
//   } catch (error) {
//     if (!error.message) {
//       error.message = "Something went wrong while fetching batch IDs";
//     }
//     next(error);
//   }
// };

const getBatchId = async (req, res, next) => {
  try {
    const { userType, _id: userId } = req.user;
    const { page = 1, limit = 50 } = req.query;

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    let batchIdsQuery;

    if (userType === "super-admin") {
      batchIdsQuery = BatchIdModal.find()
        .select("batchId startDate endDate _id createdAt updatedAt createdBy")
        .populate({
          path: "createdBy",
          select: "companyName _id",
        });
    } else {
      batchIdsQuery = BatchIdModal.find({ createdBy: userId })
        .select("batchId startDate endDate _id createdAt updatedAt createdBy")
        .populate("createdBy", "companyName _id");
    }

    const totalItems = await BatchIdModal.find(batchIdsQuery.getQuery())
      .populate({
        path: "createdBy",
        select: "companyName _id",
      })
      .countDocuments();

    if (totalItems === 0) {
      throw new ApiError(404, "No batch IDs found");
    }

    const batchIds = await batchIdsQuery
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort({ createdAt: -1 });

    const filteredBatchIds = batchIds.filter(
      (batch) => batch.createdBy || userType === "super-admin"
    );

    if (!filteredBatchIds || filteredBatchIds.length === 0) {
      throw new ApiError(404, "No batch IDs found");
    }

    const hashedBatches = filteredBatchIds.map((batch) => {
      const batchData = {
        id: batch._id,
        batchId: batch.batchId,
        createdBy: batch.createdBy ? batch.createdBy._id : null,
        startDate: batch.startDate,
        endDate: batch.endDate,
        createdAt: batch?.createdAt,
      };

      const batchString = JSON.stringify(batchData);

      console.log(" Hashed string from mern", batchString);
      const hash = crypto
        .createHash("sha256")
        .update(batchString)
        .digest("hex");

      return {
        ...batchData,
        hash,
      };
    });

    const batchIdList = hashedBatches.map((batch) => batch.id.toString());

    let externalApiResponse = [];
    try {
      const payload = {
        fcn: "GetBatchWithHash",
        args: batchIdList,
      };

      const blockchainToken = req.blockChainToken;
      if (!blockchainToken) {
        throw new ApiError(401, "Authorization token of blockchain not found");
      }

      const response = await axios.post(
        `${process.env.BLOCKCHAIN_TEST_URL}/channels/mychannel/chaincodes/Batch`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${blockchainToken}`,
          },
        }
      );

      // Inspect the API response structure
      console.log("API Response Data:", response.data);

      if (
        response.data &&
        response.data.result &&
        Array.isArray(response.data.result.result)
      ) {
        externalApiResponse = response.data.result.result;
        console.log("External API Batch Details:", externalApiResponse);
      } else {
        console.error("Unexpected API response format:", response.data);
      }
    } catch (err) {
      console.error("Error in external API call:", err.message);
    }

    // Compare hashes and log comparison results
    const comparisonResults = hashedBatches.map((batch) => {
      // Find the corresponding API batch using 'Batch' field
      const apiBatch = externalApiResponse.find(
        (apiData) => apiData.BatchID === batch.id.toString() // Match 'Batch' with the MongoDB '_id'
      );

      if (apiBatch) {
        const blockChainVerified =
          apiBatch.blockHash === batch.hash ? true : "unverified";

        console.log(`Batch ID: ${batch.id}`);
        console.log(`Generated Hash: ${batch.hash}`);
        console.log(`API Hash: ${apiBatch.blockHash}`);
        console.log(`BlockChain Verified: ${blockChainVerified}`);

        return {
          ...batch,
          blockChainVerified,
        };
      } else {
        console.log(`Batch ID: ${batch.id} - Not found in API response`);

        return {
          ...batch,
          blockChainVerified: false,
        };
      }
    });

    return res.status(200).json({
      statusCode: 200,
      data: "Batch IDs fetched successfully",
      message: {
        batches: comparisonResults,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / options.limit),
          currentPage: options.page,
        },
      },
    });
  } catch (error) {
    console.error("Error in getBatchId:", error);
    if (!error.message) {
      error.message = "Something went wrong while fetching batch IDs";
    }
    next(error);
  }
};

const editBatchId = async (req, res, next) => {
  try {
    const blockChainToken = req.blockChainToken;
    const { userType, _id: userId } = req.user;
    const { batchId: queryBatchId } = req.query;
    const { batchId, startDate, endDate } = req.body;

    if (!queryBatchId) {
      throw new ApiError(400, "Batch ID is required");
    }

    // Find the batch based on user type
    const query =
      userType === "super-admin"
        ? { _id: queryBatchId }
        : { _id: queryBatchId, createdBy: userId };

    let batch = await BatchIdModal.findOne(query);

    if (!batch) {
      throw new ApiError(404, "Batch ID not found or you do not have access");
    }

    // Check if the batchId already exists in the database
    if (userType === "company" && batchId && batchId !== batch.batchId) {
      const existingBatch = await BatchIdModal.findOne({
        batchId,
        createdBy: userId,
      });
      if (existingBatch) {
        throw new ApiError(400, "Batch ID with this name already exists");
      }
    }

    // Update batchId, startDate, and endDate if provided
    if (batchId) batch.batchId = batchId; // Update the batchId
    if (startDate) batch.startDate = startDate;
    if (endDate) batch.endDate = endDate;

    await batch.save();

    const responseBatch = {
      _id: batch._id,
      batchId: batch.batchId,
      startDate: batch.startDate,
      endDate: batch.endDate,
      createdAt: batch.createdAt,
      createdBy: {
        userId: batch.createdBy,
      },
    };

    // Prepare data for external API
    const payload = {
      fcn: "EditBatch",
      args: [
        batch._id.toString(),
        batch.batchId,
        batch.startDate,
        batch.endDate,
      ],
    };

    // Call the external API
    try {
      const externalApiResponse = await axios.post(
        `${process.env.BLOCKCHAIN_TEST_URL}/channels/mychannel/chaincodes/Batch`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${blockChainToken}`,
          },
        }
      );
      console.log("External API response:", externalApiResponse.data);
    } catch (externalApiError) {
      console.error("Error calling external API:", externalApiError.message);
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, responseBatch, "Batch ID updated successfully")
      );
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while updating the batch ID";
    }
    next(error);
  }
};

export { postBatchId, getBatchId, getAllBatchIds, editBatchId };
