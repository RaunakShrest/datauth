import express from "express";
import {
  checkSuperAdmin,
  checkUserAuth,
} from "../middlewares/auth.middleware.js";
import { blockChainToken } from "../middlewares/blockChainToken.middleware.js";
import { upload } from "../middlewares/profilePicUpload.middleware.js";
import {
  userSignup,
  userSignin,
  userSignout,
  refreshAccessToken,
  getUsers,
  getCurrentUser,
  updateUser,
  getCompanies,
  updateCompanyStatus,
  deleteCompany,
  uploadProfilePicture,
  userEditProfile,
  forgotPassword,
  resetPassword,
  getCompanyIds,
  testHash,
  blockChainTokenController,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/get-users", checkUserAuth, checkSuperAdmin, getUsers);
router.get("/get-current-user", checkUserAuth, getCurrentUser);

router.post("/signup", userSignup);
router.post("/signin", userSignin);
router.post("/signout", userSignout);
router.post("/refresh-access-token", refreshAccessToken);

router.patch("/update-user", checkUserAuth, checkSuperAdmin, updateUser);
router.get("/get-companies", checkUserAuth, getCompanies);
router.patch("/get-companies/:id", updateCompanyStatus); //for updating companyStatus
router.delete(
  "/delete-company/:id",
  deleteCompany,
  checkSuperAdmin,
  checkUserAuth
);
router.post(
  "/upload-profile-picture",
  upload.single("file"),
  checkUserAuth,
  blockChainToken,
  uploadProfilePicture
);
router.patch("/edit-profile", checkUserAuth, blockChainToken, userEditProfile); // Route to edit user profile
router.post("/forgetPassword", forgotPassword);
router.post("/resetPassword", resetPassword);
router.get("/getCompanyIds", getCompanyIds);
router.get("/testHash", testHash);
router.post("/blockChainToken", checkUserAuth, blockChainTokenController);

export default router;
