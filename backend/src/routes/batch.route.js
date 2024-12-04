import express from "express";
import {
  postBatchId,
  getBatchId,
  getAllBatchIds,
  editBatchId,
} from "../controllers/batch.controller.js";
import { checkUserAuth } from "../middlewares/auth.middleware.js";
import { blockChainToken } from "../middlewares/blockChainToken.middleware.js";

const router = express.Router();
// router.post("/createBatchId", checkUserAuth, postBatchId);
router.post("/createBatchId", checkUserAuth, blockChainToken, postBatchId);
router.get("/getBatchIds", checkUserAuth, blockChainToken, getBatchId); //for table add prod and regist
router.get("/getAllBatchIds", checkUserAuth, getAllBatchIds); // test
router.patch("/editBatchId", checkUserAuth, blockChainToken, editBatchId);

export default router;
