import express from "express";

import { editCompanyInfo, getCompanyById } from "../controllers/company.controller.js";
const router= express.Router()

router.patch("/editCompanyDetails/:companyId", editCompanyInfo);
router.get('/getSingleCompany/:id', getCompanyById);
export default router   