import express from "express"
import { checkRetailer, checkUserAuth } from "../middlewares/auth.middleware.js"
import { postCustomerInfo } from "../controllers/customerInfo.controller.js"

const router = express.Router()

router.post("/createCustomer", postCustomerInfo)

export default router
