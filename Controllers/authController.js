import User from "../models/UserModel.js";
import { hashPassword } from "../utils/passwordUtils.js";
import { StatusCodes } from "http-status-codes";
import {
  UnauthenticatedError,
  NotFoundError,
  BadRequestError,
} from "../errors/customErrors.js";
import bcrypt from "bcryptjs";
import { createJWT } from "../utils/generateToken.js";

// Register a new user or tutor

export const register = async (req, res) => {
  const isFirstAccount = (await User.countDocuments()) === 0;
  
  // If role is provided and is "tutor", use it; otherwise apply default logic
  if (req.body.role === "tutor") {
    req.body.role = "tutor";
  } else {
    req.body.role = isFirstAccount ? "admin" : "user";
  }

  const hashedPassword = await hashPassword(req.body.password);
  req.body.password = hashedPassword;

  const user = await User.create(req.body);
  const message = user.role === "tutor" ? "Tutor registered successfully" : "User Created Successfully";
  res.status(StatusCodes.CREATED).json({ msg: message });
};

// Login user/tutor and set JWT token in cookie

export const login = async (req, res) => {
  // Optionally filter by role if provided in request
  const query = { email: req.body.email };
  if (req.body.role) {
    query.role = req.body.role;
  }
  
  const user = await User.findOne(query);
  const isValidUser =
    user && (await bcrypt.compare(req.body.password, user.password));

  if (!isValidUser) throw new UnauthenticatedError("Invalid credentials");

  const oneday = 24 * 60 * 60 * 1000;

  const token = createJWT({ userId: user._id, role: user.role });
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneday),
    secure: process.env.NODE_ENV === "production",
  });

  const roleMessage = user.role === "tutor" ? "Tutor logged in" : "User logged in";
  res.status(StatusCodes.OK).json({
    msg: roleMessage,
    user: {
      role: user.role,
      name: user.fullName,
      email: user.email,
    },
  });
};

export const logout = (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "User logged out" });
};