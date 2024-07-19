import path from "path";
import multer from "multer";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import {
  DO_SPACES_BUCKET,
  DO_SPACES_KEY,
  DO_SPACES_SECRET,
} from "../utils/config.mjs";



// Configure AWS SDK for DigitalOcean Spaces
const clientConfig = {
  endpoint: "https://vertex-bucket.blr1.digitaloceanspaces.com",
  region: "blr1", // DigitalOcean Spaces does not require a specific region setting

  credentials: {
    accessKeyId: DO_SPACES_KEY,
    secretAccessKey: DO_SPACES_SECRET,
    
  },
};

const s3Client = new S3Client(clientConfig);

console.log("S3 Client:", s3Client);
console.log("DO_SPACES_BUCKET:", DO_SPACES_BUCKET);
// Multer configuration for temporary file storage
const upload = multer({ dest: "temp/" });
const uploadToSpaces = async (file, destination) => {
  try {
    const fileStream = fs.createReadStream(file.path);
    const fileName = `${destination}/${path.basename(file.path)}`;

    const uploadParams = {
      Bucket: DO_SPACES_BUCKET,
      Key: fileName,
      Body: fileStream,
      ACL: "public-read",
      ContentType: file.mimetype,
    };

    const data = await s3Client.send(new PutObjectCommand(uploadParams));

    // Delete the temporary file
    fs.unlink(file.path, (unlinkErr) => {
      if (unlinkErr) {
        console.error("Error deleting temporary file", unlinkErr);
      }
    });

    return data;
  } catch (error) {
    console.error("Error uploading to DigitalOcean Spaces", error);
    throw error;
  }
};

const uploadPost = async (req, res) => {
  try {
    const destination = `${req.user.username}/posts`;
    const fieldName = "post";

    upload.single(fieldName)(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: err.message });
      } else if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }

      try {
        const fileUrl = await uploadToSpaces(req.file, destination);
        return fileUrl;
      } catch (error) {
        console.error("Error in uploadPost:", error);
        return res.status(500).json({ success: false, message: error.message });
      }
    });
  } catch (error) {
    console.error("Error in uploadPost:", error);
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
      // Delete the existing profile image
      const deleteParams = {
        Bucket: DO_SPACES_BUCKET,
        Key: req.user.profile,
      };
      s3Client.send(
       new DeleteObjectCommand(deleteParams)
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
        return fileUrl;
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
