import express from "express";
import { checkUserAuth } from "../middlewares/auth.middleware.js";
import { blockChainToken } from "../middlewares/blockChainToken.middleware.js";
import {
  editCompanyInfo,
  getCompanyById,
} from "../controllers/company.controller.js";
const router = express.Router();

router.patch(
  "/editCompanyDetails/:companyId",
  checkUserAuth,
  blockChainToken,
  editCompanyInfo
);
router.get("/getSingleCompany/:id", getCompanyById);
export default router;
