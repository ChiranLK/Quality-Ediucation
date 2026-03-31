import User from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import { createJWT } from "../utils/generateToken.js";
import { hashPassword } from "../utils/passwordUtils.js";
import { StatusCodes } from "http-status-codes";
import {
  UnauthenticatedError,
  NotFoundError,
  BadRequestError,
} from "../errors/customErrors.js";

// Register a new user or tutor
export const register = async (req, res) => {
  const { email, password, role, subjects } = req.body || {};
  if (!email || !password) {
    throw new BadRequestError("Email and password are required");
  }

  const isFirstAccount = (await User.countDocuments()) === 0;

  // Validate and set role appropriately
  if (role === "tutor") {
    req.body.role = "tutor";
    
    // Validate subjects for tutors
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      throw new BadRequestError("Subjects are required for tutor registration");
    }
    
    // Initialize tutorProfile with subjects
    req.body.tutorProfile = {
      subjects: subjects.map(s => s.toLowerCase()),
      availability: "available",
      sessionCount: 0,
      rating: {
        average: 0,
        count: 0,
      },
      isVerified: false,
    };
  } else if (role === "admin") {
    // Allow admin registration for first account or if explicitly requested
    req.body.role = "admin";
  } else {
    // Default: first account becomes admin, others become user
    req.body.role = isFirstAccount ? "admin" : "user";
  }

  const hashedPassword = await hashPassword(password);
  req.body.password = hashedPassword;

  const user = await User.create(req.body);

  const message =
    user.role === "tutor"
      ? "Tutor registered successfully"
      : "User Created Successfully";

  res.status(StatusCodes.CREATED).json({ msg: message });
};

// Login user/tutor and set JWT token in cookie
export const login = async (req, res) => {
  const { email, password, role } = req.body || {};
  if (!email || !password) {
    throw new BadRequestError("Email and password are required");
  }

  // Optionally filter by role if provided in request
  const query = { email };
  if (role) query.role = role;

  const user = await User.findOne(query);
  const isValidUser = user && (await bcrypt.compare(password, user.password));
  if (!isValidUser) throw new UnauthenticatedError("Invalid credentials");

  const oneday = 24 * 60 * 60 * 1000;

  // Keep both keys if you have middleware expecting either `id` or `userId`
  const token = createJWT({ userId: user._id, id: user._id, role: user.role });
  
  console.log('JWT Token created:', token);
  console.log('Token length:', token?.length);

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneday),
    secure: process.env.NODE_ENV === "production",
  });

  const roleMessage = user.role === "tutor" ? "Tutor logged in" : "User logged in";

  const responseData = {
    msg: roleMessage,
    token,
    user: {
      _id: user._id,
      fullName: user.fullName,
      name: user.fullName || user.email,
      email: user.email,
      phoneNumber: user.phoneNumber,
      location: user.location,
      role: user.role,
      tutorProfile: user.tutorProfile,
    },
  };
  
  console.log('Login response token:', responseData.token);
  console.log('Login response token length:', responseData.token?.length);
  
  res.status(StatusCodes.OK).json(responseData);
};

export const logout = (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "User logged out" });
};

// Check if email exists and return its role
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        msg: "Email is required",
      });
    }

    const user = await User.findOne({ email }).select("role");

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        msg: "Email not found",
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      role: user.role,
      email: email,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      msg: "Failed to check email",
      error: error.message,
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    console.log('Request received:', req.body);
    console.log('User from middleware:', req.user);
    
    const userId = req.user._id;
    if (!userId) {
      throw new BadRequestError("User ID not found in request");
    }

    const { fullName, email, phoneNumber, location, tutorProfile } = req.body;

    if (!fullName && !email && !phoneNumber && !location && !tutorProfile) {
      throw new BadRequestError("At least one field must be provided to update");
    }

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (location) updateData.location = location;
    if (tutorProfile) updateData.tutorProfile = tutorProfile;

    console.log('Update data:', updateData);

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    console.log('Updated user:', updatedUser);

    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }

    res.status(StatusCodes.OK).json({
      msg: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        location: updatedUser.location,
        role: updatedUser.role,
        tutorProfile: updatedUser.tutorProfile,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.code === 11000) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        msg: "Email already exists",
        error: error.message,
      });
    }
    
    // Return proper error response with details
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const errorMsg = error.message || "Failed to update profile";
    
    res.status(statusCode).json({
      success: false,
      msg: errorMsg,
      error: errorMsg,
    });
  }
};

// Create a new admin user (only existing admins can create new admins)
export const createAdmin = async (req, res) => {
  try {
    const { email, password, fullName, phoneNumber, location } = req.body;

    // Validate required fields
    if (!email || !password || !fullName || !phoneNumber || !location) {
      throw new BadRequestError(
        "Email, password, full name, phone number, and location are all required"
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("Email already exists");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new admin user
    const adminUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      location,
      role: "admin",
    });

    console.log("Admin user created:", {
      _id: adminUser._id,
      email: adminUser.email,
      fullName: adminUser.fullName,
      role: adminUser.role,
    });

    res.status(StatusCodes.CREATED).json({
      msg: "Admin account created successfully",
      admin: {
        _id: adminUser._id,
        fullName: adminUser.fullName,
        email: adminUser.email,
        phoneNumber: adminUser.phoneNumber,
        location: adminUser.location,
        role: adminUser.role,
      },
    });
  } catch (error) {
    console.error("Create admin error:", error);

    if (error.code === 11000) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        msg: "Email already exists",
        error: error.message,
      });
    }

    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const errorMsg = error.message || "Failed to create admin account";

    res.status(statusCode).json({
      success: false,
      msg: errorMsg,
      error: errorMsg,
    });
  }
};

// Setup initial admin if no admin exists (only works if there are zero admins)
export const setupInitialAdmin = async (req, res) => {
  try {
    const { email, password, fullName, phoneNumber, location } = req.body;

    // Validate required fields
    if (!email || !password || !fullName || !phoneNumber || !location) {
      throw new BadRequestError(
        "Email, password, full name, phone number, and location are all required"
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("Email already exists");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new admin user
    const adminUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      location,
      role: "admin",
    });

    console.log("Initial admin user created:", {
      _id: adminUser._id,
      email: adminUser.email,
      fullName: adminUser.fullName,
      role: adminUser.role,
    });

    res.status(StatusCodes.CREATED).json({
      msg: "Admin account created successfully",
      admin: {
        _id: adminUser._id,
        fullName: adminUser.fullName,
        email: adminUser.email,
        phoneNumber: adminUser.phoneNumber,
        location: adminUser.location,
        role: adminUser.role,
      },
    });
  } catch (error) {
    console.error("Setup initial admin error:", error);

    if (error.code === 11000) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        msg: "Email already exists",
        error: error.message,
      });
    }

    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const errorMsg = error.message || "Failed to create admin account";

    res.status(statusCode).json({
      success: false,
      msg: errorMsg,
      error: errorMsg,
    });
  }
};

// Get current authenticated user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -resetPasswordToken -resetPasswordExpiry');
    
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        msg: 'User not found',
      });
    }

    res.status(StatusCodes.OK).json({
      _id: user._id,
      fullName: user.fullName,
      name: user.fullName || user.email,
      email: user.email,
      phoneNumber: user.phoneNumber,
      location: user.location,
      role: user.role,
      tutorProfile: user.tutorProfile,
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      msg: 'Failed to fetch user',
      error: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    // Only admins can fetch all users
    if (req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        msg: 'Only admins can access this resource',
      });
    }

    const { role, search } = req.query;
    let query = {};

    // Filter by role if provided
    if (role && ['user', 'tutor', 'admin'].includes(role)) {
      query.role = role;
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password -resetPasswordToken -resetPasswordExpiry').sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        location: user.location,
        role: user.role,
        avatar: user.avatar,
        tutorProfile: user.tutorProfile,
        createdAt: user.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      msg: 'Failed to fetch users',
      error: error.message,
    });
  }
};

// Delete a user (admin only)
export const deleteUser = async (req, res) => {
  try {
    // Only admins can delete users
    if (req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        msg: 'Only admins can delete users',
      });
    }

    const { userId } = req.params;

    // Validate userId
    if (!userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        msg: 'User ID is required',
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        msg: 'User not found',
      });
    }

    // Prevent deleting the only admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount === 1) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          msg: 'Cannot delete the only admin user',
        });
      }
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(StatusCodes.OK).json({
      success: true,
      msg: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      msg: 'Failed to delete user',
      error: error.message,
    });
  }
};