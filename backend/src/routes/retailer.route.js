import express from "express"
import { checkRetailer, checkUserAuth } from "../middlewares/auth.middleware.js"
import { getRetailers, updateRetailerStatus } from "../controllers/retailer.controller.js"

const router = express.Router()

router.get("/getRetailers",getRetailers)
router.patch("/updateRetailerStatus/:id",updateRetailerStatus)

export default router
