import express from "express"
import { checkRetailer, checkUserAuth } from "../middlewares/auth.middleware.js"
import { getRetailers } from "../controllers/retailer.controller.js"

const router = express.Router()

router.get("/getRetailers",getRetailers)

export default router
