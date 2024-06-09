import User from "../models/user.model.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { SECRET } from "../utils/config.mjs";
import{promisify} from "util";
import fs from "fs";
import { uploadPost } from "../middlewares/upload.middleware.mjs";
const unlinkAsync = promisify(fs.unlink);

const Register= async(req,res,next)=>{
try {

    const{username,email,password} = req.body;
    if (!email || !password || !username) {
        return res.status(400).json({ message: "Email and password  and username are required" });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hash= await bcrypt.hash(req.body.password,10);

    const user = new User({
        email: email,
        password:hash,
        username: username
    });
    await user.save();
    const tokenPairs = {userId:user._id, email,username}
    const token = jwt.sign(tokenPairs, SECRET, {
        expiresIn: "12d"
    });
    res.status(201).json({ message: "User created", token });


} catch (error) {
    next(error);
}
}



const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const tokenPairs = { userId: user._id, email, username: user.username };
        const token = jwt.sign(tokenPairs, SECRET, {
            expiresIn: "7d"
        });
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        next(error);
    }
};

const uploadProfile = async(req, res,next) => {
try {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
  if (user.profile){
    console.log(`Deleting previous profile image`, req.user.profile);
    const path = req.user.profile.split("/").pop(); // Get the filename from the URL
    const filePath = `/home/vertex/media/${user.username}/${path}`;
 
      if (fs.existsSync(filePath)) {
        await unlinkAsync(filePath); // Asynchronously delete the file
        console.log(`Previous profile image deleted successfully`);
      } else {
        console.log(`Previous profile image does not exist`);
      }
  }
const profile=uploadPost(req,res);
user.profile=profile;
await user.save();
res.status(200).json({ message: "Profile uploaded successfully", profile });


} catch (error) {
    next(error);
}

}
const getSelfProfile = async(req, res,next) => {

try {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    res.status(200).json({ message: "Profile fetched successfully", user });


} catch (error) {
    next(error);
}

}


export {
    Register,
    login,
    uploadProfile,
    getSelfProfile
};