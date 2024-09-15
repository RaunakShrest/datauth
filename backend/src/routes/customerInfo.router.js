import express from "express"
import { checkRetailer, checkUserAuth } from "../middlewares/auth.middleware.js"
import { getCustomerInfo, postCustomerInfo } from "../controllers/customerInfo.controller.js"

const router = express.Router()

router.get("/get-customer-info", checkUserAuth, checkRetailer, getCustomerInfo)
router.post("/create-customer-info", checkUserAuth, checkRetailer, postCustomerInfo)

export default router
