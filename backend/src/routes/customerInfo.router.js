import express from "express";
import { checkUserAuth } from "../middlewares/auth.middleware.js";
import {
  postCustomerInfo,
  getSoldProductsByRetailer,
  getCustomerInfo,
  getSoldProductsByCompany,
  getProductWithOrderNumber,
} from "../controllers/customerInfo.controller.js";
import { blockChainToken } from "../middlewares/blockChainToken.middleware.js";

const router = express.Router();

router.post(
  "/createCustomer",
  checkUserAuth,
  blockChainToken,
  postCustomerInfo
);
router.get(
  "/soldProducts",
  checkUserAuth,
  blockChainToken,
  getSoldProductsByRetailer
); // retailersales
router.get("/getCustomerInfo", checkUserAuth, getCustomerInfo);
router.get("/soldProductsByCompany", checkUserAuth, getSoldProductsByCompany);
router.get(
  "/getProductByOrderNumber",
  checkUserAuth,
  getProductWithOrderNumber
);

export default router;
