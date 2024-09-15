import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { UserModel } from "../models/user.model.js"

const acceptableUserTypes = () => [process.env.USER_TYPE_COMPANY, process.env.USER_TYPE_RETAILER]
const acceptableUserStatus = () => [
  process.env.USER_STATUS_PENDING,
  process.env.USER_STATUS_VERIFIED,
  process.env.USER_STATUS_DECLINED,
]

const generateRefreshAndAccessToken = async (userId) => {
  try {
    const user = await UserModel.findOne({ _id: userId })
    const refreshToken = user.generateRefreshToken()
    const accessToken = user.generateAccessToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { refreshToken, accessToken }
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while generating refresh and access tokens"
    }
    next(error)
  }
}

const userSignup = async (req, res, next) => {
  try {
    const userTypeAcceptableStatus = acceptableUserTypes()

    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      userType,
      companyName,
      productType,
      status,
      remarks,
      address,
    } = req.body

    console.log(firstName, lastName, email, password, phoneNumber, userType, companyName, productType)

    if (!firstName || !lastName || !email || !password || !phoneNumber || !userType || !companyName || !productType) {
      throw new ApiError(400, "Required Fields Empty")
    }

    // user type checker
    if (!userTypeAcceptableStatus.some((eachAcceptableType) => userType.toLowerCase() === eachAcceptableType)) {
      throw new ApiError(406, "user type unacceptable")
    }

    // status checker
    if (status) {
      if (!acceptableUserStatus().some((eachAccepatbleStatus) => status.toLowerCase() === eachAccepatbleStatus)) {
        throw new ApiError(406, "user status unacceptable")
      }
    }

    const existingUser = await UserModel.findOne({ email: email })
    if (existingUser) {
      throw new ApiError(409, "user already exists with the provided email")
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userFields = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      userType,
      companyName,
      productType,
      address,
      status,
      remarks,
    }

    const savedUser = await UserModel.create(userFields)
    const recentlySavedUser = await UserModel.findOne({ _id: savedUser._id }).select("-__v -password -refreshToken")

    return res.status(200).json(new ApiResponse(201, recentlySavedUser, "user signed up successfully"))
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while creating user"
    }
    next(error)
  }
}

const userSignin = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const existingUser = await UserModel.findOne({ email: email })

    if (!existingUser) {
      throw new ApiError(404, "user doesn't exist")
    }

    const passwordMatch = await bcrypt.compare(password, existingUser.password)

    if (!passwordMatch) {
      throw new ApiError(401, "Email or Password does not match")
    }

    const { refreshToken, accessToken } = await generateRefreshAndAccessToken(existingUser._id)

    const signedInUser = await UserModel.findOne({ _id: existingUser._id }).select("-__v -password -refreshToken")

    return res
      .status(200)
      .json(new ApiResponse(200, { user: signedInUser, refreshToken, accessToken }, "user logged in successfully"))
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while signing user in"
    }
    next(error)
  }
}

const userSignout = async (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1]

    if (!token) {
      throw new ApiError(401, "unauthorized request")
    }

    let decodedToken

    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    } catch (error) {
      error.statusCode = 401
      error.data = null
      error.success = false
      error.name = "jwt error"
      next(error)
    }

    await UserModel.findOneAndUpdate(
      { _id: decodedToken._id },
      {
        $unset: {
          refreshToken: 1,
        },
      },
      { new: true }
    )

    return res.status(200).json(new ApiResponse(200, {}, "user signed out successfully"))
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while signing user out"
    }
    next(error)
  }
}

const getUsers = async (req, res, next) => {
  try {
    const userId = req.user?._id

    if (!userId) {
      throw new ApiError(401, "unauthorized request")
    }

    const users = await UserModel.aggregate([
      {
        $group: {
          _id: "$userType",
          count: {
            $sum: 1,
          },
        },
      },
      {},
    ])

    return res.status(200).json(new ApiResponse(200, users, "users fetched successfully"))
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while fetching users"
    }
    next(error)
  }
}

const getCurrentUser = async (req, res, next) => {
  try {
    return res.status(200).json(new ApiResponse(200, req.user, "user fetched successfully"))
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while fetching current user"
    }
    next(error)
  }
}

const updateUser = async (req, res, next) => {
  try {
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while fetching users"
    }
    next(error)
  }
}

const refreshAccessToken = async (req, res, next) => {
  try {
    const incomingRefreshToken = req.body.refreshToken

    if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request")
    }

    let decodedRefreshToken

    try {
      decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    } catch (error) {
      error.statusCode = 401
      error.data = null
      error.success = false
      error.name = "jwt error"
      next(error)
    }

    const user = await UserModel.findOne({ _id: decodedRefreshToken?._id })

    if (!user) {
      throw new ApiError(404, "unknown user")
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "unauthorized request")
    }

    const { refreshToken: newRefreshToken, accessToken } = await generateRefreshAndAccessToken(user?._id)

    return res
      .status(200)
      .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "token refreshed successfully"))
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while generating access token"
    }
    next(error)
  }
}

export { userSignup, userSignin, userSignout, getUsers, getCurrentUser, updateUser, refreshAccessToken }
