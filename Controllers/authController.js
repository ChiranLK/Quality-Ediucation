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

// Register a new user

export const register = async (req, res) => {
  const isFirstAccount = (await User.countDocuments()) === 0;
  req.body.role = isFirstAccount ? "admin" : "user";

  const hashedPassword = await hashPassword(req.body.password);
  req.body.password = hashedPassword;

  const user = await User.create(req.body);
  res.status(StatusCodes.CREATED).json({ msg: "User Created Successfully" });
};

// Login user and set JWT token in cookie

export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
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

  res.status(StatusCodes.OK).json({
    msg: "User logged in",
    user: {
      role: user.role,
      name: user.fullName,
      email: user.email,
    },
  });
};