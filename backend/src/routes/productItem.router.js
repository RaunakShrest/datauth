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
  getSingleProductOnSlug,
} from "../controllers/productItem.controller.js";
import { uploadMultiple } from "../middlewares/productImageUpload.middlware.js";
import { blockChainToken } from "../middlewares/blockChainToken.middleware.js";
const router = express.Router();

router.get(
  "/get-product-items",
  checkUserAuth,
  blockChainToken,
  getProductItems
);
router.post(
  "/create-product-item",
  uploadMultiple.array("productItems", 10),
  checkUserAuth,
  blockChainToken,
  createProductItem
);
// router.patch("/update-product-item", checkUserAuth, checkCompany, updateProductItem)
router.delete(
  "/delete-product-item",
  checkUserAuth,
  checkCompany,
  deleteProductItem
);
router.get("/:productId", getSingleProduct); // for QR

router.get(
  "/getSingleProdWithSlug/:slug",
  checkUserAuth,
  getSingleProductOnSlug
); //for view
router.get("/getSingleProduct/:id", getProductById); // for edit
router.patch(
  "/editProductDetails/:productId",
  uploadMultiple.array("productItems", 10),
  checkUserAuth,
  blockChainToken,
  editProductInfo
);
router.get(
  "/getCompanyProducts/:companyId",
  checkUserAuth,
  blockChainToken,
  getCompanyProductItems
);
export default router;
