import User from "../models/UserModel.js";
import { UnauthenticatedError, UnauthorizedError } from "../errors/customErrors.js";
import { verifyJWT } from "../utils/generateToken.js";

/**
 * Reads JWT from:
 * Authorization: Bearer <token>
 * Attaches full user document to req.user
 */
export const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    console.log('Authorization header:', auth);
    
    const token = auth.startsWith("Bearer ")
      ? auth.split(" ")[1]
      : null;

    console.log('Extracted token:', token?.substring(0, 20) + '...');

    if (!token) {
      console.log('No token found!');
      throw new UnauthenticatedError("Not authorized, no token");
    }

    const decoded = verifyJWT(token);
    console.log('Decoded token:', decoded);

    // Support payload styles: { id }, { userId }, { _id }
    const userId = decoded?.id || decoded?.userId || decoded?._id;

    console.log('User ID from token:', userId);

    if (!userId) {
      throw new UnauthenticatedError("Invalid token payload");
    }

    const user = await User.findById(userId);
    console.log('User found:', user ? user.email : 'NOT FOUND');
    
    if (!user) {
      throw new UnauthenticatedError("User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Protect middleware error:', error.message);
    throw new UnauthenticatedError("Not authorized, token failed");
  }
};

/**
 * Reads JWT from:
 * cookie (token)
 * Attaches req.user { userId, role }
 */
export const authenticateUser = (req, res, next) => {
  let { token } = req.cookies;

  // Fallback to Bearer token for cross-domain requests
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new UnauthenticatedError("Authentication invalid");
  }

  try {
    const decoded = verifyJWT(token);
    const userId = decoded.userId || decoded.id;

    req.user = {
      userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication invalid");
  }
};

/**
 * Authorization guard for specific roles
 */
export const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError("Not authorized to access this route");
    }
    next();
  };
};