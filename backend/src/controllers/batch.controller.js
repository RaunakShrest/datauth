import { BatchIdModal } from "../models/batchId.modal.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const postBatchId = async (req, res, next) => {
  try {
    const { batchId, startDate, endDate } = req.body;
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
      startDate,
      endDate,
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
      batchIds = await BatchIdModal.find()
        .select("batchId startDate endDate _id createdAt createdBy")
        .populate({
          path: "createdBy",
          select: "companyName _id",
          match: { companyName: { $exists: true } },
        });
    } else {
      batchIds = await BatchIdModal.find({ createdBy: userId })
        .select("batchId startDate endDate _id createdAt createdBy")
        .populate("createdBy", "companyName _id");
    }

    batchIds = batchIds.filter((batch) => batch.createdBy);

    if (!batchIds || batchIds.length === 0) {
      throw new ApiError(404, "No batch IDs found");
    }

    const responseBatchIds = batchIds.map((batch) => ({
      _id: batch._id,
      batchId: batch.batchId,
      startDate: batch.startDate,
      endDate: batch.endDate,
      createdAt: batch.createdAt,
      createdBy: {
        userId: batch.createdBy._id,
        companyName: batch.createdBy.companyName,
      },
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
const editBatchId = async (req, res, next) => {
  try {
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
