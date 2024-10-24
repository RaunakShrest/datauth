import express from "express"
import { checkUserAuth } from "../middlewares/auth.middleware.js"
import { postCustomerInfo, getSoldProductsByRetailer } from "../controllers/customerInfo.controller.js"

const router = express.Router()

router.post("/createCustomer", postCustomerInfo)
router.get("/soldProducts", checkUserAuth, getSoldProductsByRetailer);

export default router
