import User from "../models/user.model.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { SECRET } from "../utils/config.mjs";
import { promisify } from "util";
import fs from "fs";
import {
  uploadToSpaces,
} from "../middlewares/upload.middleware.mjs";


const Register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Validation checks
    if (!email || !password || !username) {
      throw {
        status: 400,
        message: "Email, password, and username are required",
      };
    }

    if (password.length < 6) {
      throw { status: 400, message: "Password must be at least 6 characters" };
    }

    // Check if email or username already exists
    const existingUserWithEmail = await User.findOne({ email });
    if (existingUserWithEmail) {
      throw { status: 400, message: "Email already exists" };
    }

    const existingUserWithUsername = await User.findOne({ username });
    if (existingUserWithUsername) {
      throw { status: 400, message: "Username already exists" };
    }

    let profileUrl = req.file
      ? await uploadToSpaces({
          file: req.file,
          destination: `${username}/profile`,
        })
      : "https://vertex-bucket.blr1.cdn.digitaloceanspaces.com/person.png";

    const hash = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      email: email,
      password: hash,
      username: username,
      profile: profileUrl,
    });
    await user.save();
    const tokenPairs = { userId: user._id, email, username };
    const token = jwt.sign(tokenPairs, SECRET, {
      expiresIn: "12d",
    });
    res.status(201).json({
      message: "User created",
      token,
      success: true,
      user: {
        email: user.email,
        username: user.username,
        profile: user.profile,
      },
    });
  } catch (error) {
    if (req.file) await req.fileCleanup();
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required", success: false });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }
    const tokenPairs = { userId: user._id, email, username: user.username };
    const token = jwt.sign(tokenPairs, SECRET, {
      expiresIn: "7d",
    });
    res.status(200).json({ message: "Login successful", token, success: true });
  } catch (error) {
    next(error);
  }
};

const uploadProfile = async (req, res, next) => {
  try {
    return await handleProfileUpload(req, res);
  } catch (error) {
    next(error);
  }
};
const getSelfProfile = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.status(200).json({ message: "Profile fetched successfully", user });
  } catch (error) {
    next(error);
  }
};

export { Register, login, uploadProfile, getSelfProfile };
