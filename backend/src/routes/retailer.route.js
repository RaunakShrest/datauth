import express from "express";
import {
  checkRetailer,
  checkUserAuth,
} from "../middlewares/auth.middleware.js";
import {
  getRetailers,
  updateRetailerStatus,
  getRetailerById,
  editRetailerInfo,
} from "../controllers/retailer.controller.js";
import { blockChainToken } from "../middlewares/blockChainToken.middleware.js";

const router = express.Router();

router.get("/getRetailers", checkUserAuth, blockChainToken, getRetailers);
router.patch(
  "/updateRetailerStatus/:id",
  checkUserAuth,
  blockChainToken,
  updateRetailerStatus
);
router.get("/getSingleRetailer/:id", getRetailerById);
router.patch(
  "/editRetailerDetails/:retailerId",
  checkUserAuth,
  blockChainToken,
  editRetailerInfo
);

export default router;
