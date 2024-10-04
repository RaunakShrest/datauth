import express from "express"
import { checkUserAuth, checkSuperAdmin } from "../middlewares/auth.middleware.js"
import {
  getAllProductTypes,
  getEnabledProductTypes,
  createProductType,
  updateProductType,
  deleteProductType,
  updateProductTypeStatus
} from "../controllers/productType.controller.js"

const router = express.Router()

router.get("/get-all", getAllProductTypes)
router.get("/get-enabled", checkUserAuth, getEnabledProductTypes)
router.post("/create", checkUserAuth, checkSuperAdmin, createProductType)
router.patch("/update", checkUserAuth, checkSuperAdmin, updateProductType)
router.delete("/delete", checkUserAuth, checkSuperAdmin, deleteProductType)
router.patch("/changeStatus/:id", updateProductTypeStatus)


export default router
