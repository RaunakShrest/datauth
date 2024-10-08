import express from "express"
import { checkRetailer, checkUserAuth } from "../middlewares/auth.middleware.js"
import { getRetailers, updateRetailerStatus, getRetailerById, editRetailerInfo } from "../controllers/retailer.controller.js"

const router = express.Router()

router.get("/getRetailers",getRetailers)
router.patch("/updateRetailerStatus/:id",updateRetailerStatus)
router.get("/getSingleRetailer/:id", getRetailerById);
router.patch("/editRetailerDetails/:retailerId", editRetailerInfo);

export default router
