import { BatchIdModal } from "../models/batchId.modal.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const postBatchId = async (req, res, next) => {
  try {
    const { batchId } = req.body;
    const userId = req.user._id;

    if (!batchId || batchId.trim() === "") {
      throw new ApiError(400, "Batch ID is required");
    }

    const existingBatch = await BatchIdModal.findOne({ batchId });
    if (existingBatch) {
      throw new ApiError(409, "Batch ID already exists");
    }

    const createdBatch = await BatchIdModal.create({
      batchId,
      createdBy: userId,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, createdBatch, "Batch ID posted successfully"));
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while posting the batch ID";
    }
    next(error);
  }
};
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

const getBatchId = async (req, res, next) => {
  try {
    const { userType, _id: userId } = req.user;
    let batchIds;

    if (userType === "super-admin") {
      batchIds = await BatchIdModal.find().select("batchId _id");
    } else {
      // For other users (e.g., company): Fetch only the batch IDs created by the logged-in user
      batchIds = await BatchIdModal.find({ createdBy: userId }).select(
        "batchId _id"
      );
    }

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

export { postBatchId, getBatchId, getAllBatchIds };
