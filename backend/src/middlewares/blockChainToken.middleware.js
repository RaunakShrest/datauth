import { ApiError } from "../utils/ApiError.js";
import axios from "axios";

export const blockChainToken = async (req, res, next) => {
  console.log(
    "The authenticated user is from blockchain middleware:",
    req.user
  );

  try {
    if (!req.user) {
      throw new ApiError(401, "User not authenticated");
    }

    const { firstName, _id, userType } = req.user;
    if (!firstName || !_id) {
      throw new ApiError(400, "Missing required user information");
    }
    const formattedUserType =
      userType === "super-admin"
        ? "Superadmin"
        : userType.charAt(0).toUpperCase() + userType.slice(1);

    const payload = { username: firstName, orgName: formattedUserType };

    const response = await axios.post(
      "http://192.168.1.96:4000/users/token",
      payload
    );

    const blockChainToken = response.data?.message?.token;
    if (!blockChainToken) {
      throw new ApiError(500, "Token not received from blockchain API");
    }

    req.blockChainToken = blockChainToken;

    next();
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while calling the user token API";
    }
    next(error);
  }
};
