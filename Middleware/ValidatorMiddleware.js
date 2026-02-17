
import User from "../models/UserModel.js";
import { body, param, validationResult } from "express-validator";
import { BadRequestError } from "../errors/customErrors.js";

// Helper function to wrap validation chains with error handling
const withValidationError = (validateValues) => {
  return [
    ...validateValues,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        throw new BadRequestError(errorMessages.join(", "));
      }
      next();
    },
  ];
};

// Middleware to handle validation Register input
export const validateRegisterInput = withValidationError([
  body("fullName")
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Full name must be between 3 and 50 characters")
    .trim(),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) {
        throw new BadRequestError("Email already exists");
      }
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("phoneNumber")
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[0-9]{10}$/)
    .withMessage("Please provide a valid 10-digit phone number"),
  body("location").notEmpty().withMessage("Location is required").trim(),
]);

// Middleware to handle validation Login input
export const validateLoginInput = withValidationError([
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("password").notEmpty().withMessage("Password is required"),
]);
