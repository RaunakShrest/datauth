import express from "express";
import { checkUserAuth } from "../middlewares/auth.middleware.js";
import {
  postCustomerInfo,
  getSoldProductsByRetailer,
  getCustomerInfo,
  getSoldProductsByCompany,
  getProductWithOrderNumber,
} from "../controllers/customerInfo.controller.js";

const router = express.Router();

router.post("/createCustomer", postCustomerInfo);
router.get("/soldProducts", checkUserAuth, getSoldProductsByRetailer);
router.get("/getCustomerInfo", getCustomerInfo);
router.get("/soldProductsByCompany", checkUserAuth, getSoldProductsByCompany);
router.get(
  "/getProductByOrderNumber",
  checkUserAuth,
  getProductWithOrderNumber
);

export default router;
