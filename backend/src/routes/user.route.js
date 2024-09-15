import express from "express"
import {
  userSignup,
  userSignin,
  userSignout,
  refreshAccessToken,
  getUsers,
  getCurrentUser,
  updateUser,
} from "../controllers/user.controller.js"
import { checkSuperAdmin, checkUserAuth } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.get("/get-users", checkUserAuth, checkSuperAdmin, getUsers)
router.get("/get-current-user", checkUserAuth, getCurrentUser)

router.post("/signup", userSignup)
router.post("/signin", userSignin)
router.post("/signout", userSignout)
router.post("/refresh-access-token", refreshAccessToken)

router.patch("/update-user", checkUserAuth, checkSuperAdmin, updateUser)

export default router
