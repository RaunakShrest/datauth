import express from "express";
import {
  postBatchId,
  getBatchId,
  getAllBatchIds,
  editBatchId,
} from "../controllers/batch.controller.js";
import { checkUserAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.post("/createBatchId", checkUserAuth, postBatchId);
router.get("/getBatchIds", checkUserAuth, getBatchId);
router.get("/getAllBatchIds", checkUserAuth, getAllBatchIds);
router.patch("/editBatchId", checkUserAuth, editBatchId);

export default router;
