import { BatchIdModal } from "../models/batchId.modal.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const postBatchId = async (req, res, next) => {
  try {
    const { batchId } = req.body;

    if (!batchId || batchId.trim() === "") {
      throw new ApiError(400, "Batch ID is required");
    }
    const existingBatch = await BatchIdModal.findOne({ batchId });

    if (existingBatch) {
      throw new ApiError(409, "Batch ID already exists");
    }
    const createdBatch = await BatchIdModal.create({
      batchId,
    });

    return res.status(201).json(new ApiResponse(201, createdBatch, "Batch ID posted successfully"));
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while posting the batch ID";
    }
    next(error);
  }
};
const getAllBatchIds = async (req, res, next) => {
  try {
    const batchIds = await BatchIdModal.find().select("batchId -_id");

    if (!batchIds || batchIds.length === 0) {
      throw new ApiError(404, "No batch IDs found");
    }

    return res.status(200).json(new ApiResponse(200, batchIds, "Batch IDs fetched successfully"));
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while fetching batch IDs";
    }
    next(error);
  }
};

export { postBatchId, getAllBatchIds };
