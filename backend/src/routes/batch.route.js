import express from "express";
import { postBatchId, getAllBatchIds } from "../controllers/batch.controller.js";

const router= express.Router()
router.post("/createBatchId",postBatchId)
router.get("/getAllBatchIds", getAllBatchIds)

export default router