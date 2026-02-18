import Message from "../models/MessageModel.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors/customErrors.js";
import path from "path";
import fs from "fs";

// Create a new message with optional image upload
export const createMessage = async (req, res) => {
  try {
    // Attach the logged-in user's ID
    req.body.createdBy = req.user.userId;
    
    if (req.file) {
      req.body.image = path.join("uploads", req.file.filename);
    }

    const message = await Message.create(req.body);
    res.status(StatusCodes.CREATED).json({
      msg: "Message created successfully",
      message,
    });
  } catch (error) {

    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to create message",
      error: error.message,
    });
  }
};

// Get all messages created by the logged-in user
export const getAllMessages = async (req, res) => {
  try {
    let query = {};
    
    // If user role is 'user', show only their messages
    // If role is 'admin' or 'tutor', show all messages
    if (req.user.role === "user") {
      query.createdBy = req.user.userId;
    }
    
    const messages = await Message.find(query).sort("-createdAt").populate("createdBy", "fullName email role");
    res.status(StatusCodes.OK).json({ messages });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to fetch messages",
      error: error.message,
    });
  }
};


