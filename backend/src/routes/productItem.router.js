import express from "express"
import { checkUserAuth, checkCompany } from "../middlewares/auth.middleware.js"
import {
  getProductItems,
  getSingleProduct,
  createProductItem,
  updateProductItem,
  deleteProductItem,
  getProductById,
  editProductInfo
} from "../controllers/productItem.controller.js"

const router = express.Router()

router.get("/get-product-items", checkUserAuth, getProductItems)
router.post("/create-product-item", checkUserAuth, checkCompany, createProductItem)
router.patch("/update-product-item", checkUserAuth, checkCompany, updateProductItem)
router.delete("/delete-product-item", checkUserAuth, checkCompany, deleteProductItem)
router.get("/:slug", checkUserAuth, getSingleProduct)
router.get("/getSingleProduct/:id", getProductById);
router.patch("/editProductDetails/:productId", editProductInfo);

export default router
