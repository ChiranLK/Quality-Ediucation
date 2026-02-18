import { UnauthenticatedError, UnauthorizedError } from "../errors/customErrors.js";
import { verifyJWT } from "../utils/generateToken.js";


export const authenticateUser = (req, res, next) => {
  console.log("authenticating user");
  const { token } = req.cookies;
  if (!token) throw new UnauthenticatedError("authentication Invalid");

  try {
    const { userId, role } = verifyJWT(token);
    req.user = { userId, role };

    next();
  } catch (error) {
    throw new UnauthenticatedError("authentication Invalid");
  }
};

export const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    console.log(roles);
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError("not authorized to access this route");
    }
    next();
  };
};