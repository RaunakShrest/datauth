import express from "express";
import { checkUserAuth } from "../middlewares/auth.middleware.js";
import {
  postCustomerInfo,
  getSoldProductsByRetailer,
  getCustomerInfo,
  getSoldProductsByCompany,
} from "../controllers/customerInfo.controller.js";

const router = express.Router();

router.post("/createCustomer", postCustomerInfo);
router.get("/soldProducts", checkUserAuth, getSoldProductsByRetailer);
router.get("/getCustomerInfo", getCustomerInfo);
router.get("/soldProductsByCompany", checkUserAuth, getSoldProductsByCompany);

export default router;
