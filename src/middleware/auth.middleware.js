import { apierror } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../model/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    let token = null;

    // 1. Try cookie first (fix typo)
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
      console.log("Found token in cookies:", token);
    }

    // 2. Fallback to Authorization header
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization.trim();
      if (authHeader.toLowerCase().startsWith("bearer ")) {
        token = authHeader.slice(7).trim();
      } else {
        token = authHeader;
      }
      console.log("Found token in header:", token);
    }

    // 3. No token found at all
    if (!token) {
      throw new apierror(401, "Unauthorized request: No token provided");
    }

    // 4. Verify token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      console.error("JWT verification failed:", err);
      throw new apierror(401, "Invalid or expired token");
    }

    // 5. Check payload
    if (!decodedToken || !decodedToken._id) {
      throw new apierror(401, "Invalid token payload");
    }

    // 6. Find user
    const user = await User.findById(decodedToken._id).select("-password -refreshToken");

    if (!user) {
      throw new apierror(401, "Invalid access token: User not found");
    }

    // 7. Attach to request
    req.user = user;
    next();

  } catch (error) {
    console.error("JWT Middleware Error:", error);
    throw new apierror(401, error.message || "Invalid token");
  }
});
