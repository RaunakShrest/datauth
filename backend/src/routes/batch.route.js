import express from "express";
import {
  postBatchId,
  getBatchId,
  getAllBatchIds,
} from "../controllers/batch.controller.js";
import { checkUserAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.post("/createBatchId", checkUserAuth, postBatchId);
router.get("/getBatchIds", checkUserAuth, getBatchId);
router.get("/getAllBatchIds", checkUserAuth, getAllBatchIds);
export default router;
