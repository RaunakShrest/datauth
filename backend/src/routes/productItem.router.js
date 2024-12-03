import express from "express";
import { checkUserAuth, checkCompany } from "../middlewares/auth.middleware.js";
import {
  getProductItems,
  getSingleProduct,
  createProductItem,
  updateProductItem,
  deleteProductItem,
  getProductById,
  editProductInfo,
  getCompanyProductItems,
} from "../controllers/productItem.controller.js";
import { uploadMultiple } from "../middlewares/productImageUpload.middlware.js";
const router = express.Router();

router.get("/get-product-items", checkUserAuth, getProductItems);
router.post(
  "/create-product-item",
  uploadMultiple.array("productItems", 10),
  checkUserAuth,
  createProductItem
);
// router.patch("/update-product-item", checkUserAuth, checkCompany, updateProductItem)
router.delete(
  "/delete-product-item",
  checkUserAuth,
  checkCompany,
  deleteProductItem
);
router.get("/:productId", getSingleProduct); // for view
router.get("/getSingleProduct/:id", getProductById); // for edit
router.patch(
  "/editProductDetails/:productId",
  uploadMultiple.array("productItems", 10),
  editProductInfo
);
router.get(
  "/getCompanyProducts/:companyId",
  checkUserAuth,
  getCompanyProductItems
);
export default router;
