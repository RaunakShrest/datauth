import express from 'express';
import { checkSuperAdmin, checkUserAuth } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/profilePicUpload.middleware.js';
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
  userEditProfile
} from '../controllers/user.controller.js';

const router = express.Router();

router.get('/get-users', checkUserAuth, checkSuperAdmin, getUsers);
router.get('/get-current-user', checkUserAuth, getCurrentUser);

router.post('/signup', userSignup);
router.post('/signin', userSignin);
router.post('/signout', userSignout);
router.post('/refresh-access-token', refreshAccessToken);

router.patch('/update-user', checkUserAuth, checkSuperAdmin, updateUser);
router.get('/get-companies', getCompanies);
router.patch('/get-companies/:id', updateCompanyStatus);
router.delete('/delete-company/:id', deleteCompany, checkSuperAdmin, checkUserAuth);
router.post('/upload-profile-picture', upload.single('file'), checkUserAuth,uploadProfilePicture);
router.patch('/edit-profile', checkUserAuth, userEditProfile); // Route to edit user profile
export default router;
