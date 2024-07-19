import path from "path";
import multer from "multer";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import fs from "fs";
import {
  DO_SPACES_BUCKET,
  DO_SPACES_KEY,
  DO_SPACES_SECRET,
  DO_REGION,
  DO_ENDPOINT,
} from "../utils/config.mjs";



// Configure AWS SDK for DigitalOcean Spaces
const clientConfig = {
  endpoint: DO_ENDPOINT,
  region: DO_REGION, // DigitalOcean Spaces does not require a specific region setting
  forcePathStyle: false,
  credentials: {
    accessKeyId: DO_SPACES_KEY,
    secretAccessKey: DO_SPACES_SECRET,
  },
};

const s3Client = new S3Client(clientConfig);



// Multer configuration for temporary file storage
const upload = multer({ dest: "temp/" });
const uploadToSpaces = async (file, destination) => {
  try {
    const fileStream = fs.createReadStream(file.path);
    const fileName = `${destination}/${file.filename}${path.extname(file.originalname)}`;

    const uploadParams = {
      Bucket: DO_SPACES_BUCKET,
      Key: fileName,
      Body: fileStream,
      ACL: "public-read",
      ContentType: file.mimetype,
    };

    const data = await s3Client.send(new PutObjectCommand(uploadParams));
      const signedUrl= await getSignedUrl(s3Client, new PutObjectCommand(uploadParams), { expiresIn: -1 },(err, url) => {
        if (err) {
          console.error("Error getting signed URL", err);
          throw err;
        }
        console.log("Signed URL:", url);

      });
      const urlParser = new URL(signedUrl);
      const url = `${urlParser.protocol}//${urlParser.hostname}${urlParser.pathname}`;



    // Delete the temporary file
    fs.unlink(file.path, (unlinkErr) => {
      if (unlinkErr) {
        console.error("Error deleting temporary file", unlinkErr);
      }
    });

    return url;
  } catch (error) {
    console.error("Error uploading to DigitalOcean Spaces", error);
    throw error;
  }
};

const uploadPost = async (req, res) => {
  try {
    console.log("Starting uploadPost function");
    const destination = `${req.user.username}/posts`;
    const fieldName = "post";

    console.log("Destination:", destination);
    console.log("Field name:", fieldName);

   

    upload.single(fieldName)(req, res, async function (err) {
      console.log("Inside upload callback");
      if (err instanceof multer.MulterError) {
        console.error("Multer error:", err);
        return res.status(400).json({ success: false, message: err.message });
      } else if (err) {
        console.error("Other error:", err);
        return res.status(500).json({ success: false, message: err.message });
      }

      console.log("req.file:", req.file);

      if (!req.file) {
        console.error("No file uploaded");
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }

      try {
const mimetype = req.file.mimetype;

// Determine the type of file
let fileType;
if (mimetype.startsWith("image/")) {
  fileType = "image";
} else if (mimetype.startsWith("video/")) {
  fileType = "video";
} else {
  throw new Error("Invalid file type");
}



        const fileUrl = await uploadToSpaces(req.file, destination);
        console.log("File URL after upload:", fileUrl);
        console.log("returned back to uploadPost function");
        console.log("req.post:", req.post);
        req.post.post_url = fileUrl;
        req.post.type = fileType;
        await req.post.save();
        return res.status(200).json({ success: true, profile: fileUrl });
      } catch (error) {
        console.error("Error in uploadProfile:", error);
        return res.status(500).json({ success: false, message: error.message });
      }
    });
  } catch (error) {
    console.error("Error in uploadProfile:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const uploadProfile = async (req, res) => {
  try {
    console.log("Starting uploadProfile function");
    const destination = `${req.user.username}/profile`;
    const fieldName = "profile";

    console.log("Destination:", destination);
    console.log("Field name:", fieldName);

    if (req.user.profile) {
      console.log("Profile image exists:", req.user.profile);
     const url = new URL(req.user.profile);
     const key= url.pathname.substring(1);
     console.log("Key:", key);
      // Delete the existing profile image
      const deleteParams = {
        Bucket: DO_SPACES_BUCKET,
        Key: key,

      };
     await  s3Client.send(
       new DeleteObjectCommand(deleteParams),
       (err, data) => {
          if (err) {
            console.error("Error deleting profile image", err);
            throw err;
          }
          console.log("Deleted profile image:", data);

       }
      )
    }

    upload.single(fieldName)(req, res, async function (err) {
      console.log("Inside upload callback");
      if (err instanceof multer.MulterError) {
        console.error("Multer error:", err);
        return res.status(400).json({ success: false, message: err.message });
      } else if (err) {
        console.error("Other error:", err);
        return res.status(500).json({ success: false, message: err.message });
      }

      console.log("req.file:", req.file);

      if (!req.file) {
        console.error("No file uploaded");
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }

      try {
        const fileUrl = await uploadToSpaces(req.file, destination);
        console.log("File URL after upload:", fileUrl);
        console.log("returned back to uploadProfile function");
        req.user.profile = fileUrl;
        await req.user.save();
        return res.status(200).json({ success: true, profile: fileUrl });
      } catch (error) {
        console.error("Error in uploadProfile:", error);
        return res.status(500).json({ success: false, message: error.message });
      }
    });
  } catch (error) {
    console.error("Error in uploadProfile:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { uploadPost, uploadProfile };
