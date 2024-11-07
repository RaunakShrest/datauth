import express from "express";
import {
  checkUserAuth,
  checkSuperAdmin,
} from "../middlewares/auth.middleware.js";
import {
  getAllProductTypes,
  getEnabledProductTypes,
  createProductType,
  updateProductType,
  deleteProductType,
  updateProductTypeStatus,
  getProductTypeById,
  editProductTypeInfo,
  getEnabledProductTypesRegistration,
} from "../controllers/productType.controller.js";

const router = express.Router();

router.get("/get-all", checkUserAuth, getAllProductTypes);
router.get("/get-enabled", checkUserAuth, getEnabledProductTypes);
router.get("/getProductTypeRegistration", getEnabledProductTypesRegistration);
router.post("/create", checkUserAuth, createProductType);
router.patch("/update", checkUserAuth, checkSuperAdmin, updateProductType);
router.delete("/delete", checkUserAuth, checkSuperAdmin, deleteProductType);
router.patch("/changeStatus/:id", updateProductTypeStatus);
router.get("/getProductTypeById/:id", getProductTypeById);
router.patch("/updateProductType/:productTypeId", editProductTypeInfo);

export default router;
