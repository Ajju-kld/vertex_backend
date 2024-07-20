import path from "path";
import multer from "multer";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
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
const uploadToSpaces = async ({ file, destination }) => {
  try {
    const fileStream = fs.createReadStream(file.path);
    const fileName = `${destination}/${file.filename}${path.extname(
      file.originalname
    )}`;

    const uploadParams = {
      Bucket: DO_SPACES_BUCKET,
      Key: fileName,
      Body: fileStream,
      ACL: "public-read",
      ContentType: file.mimetype,
    };

    const data = await s3Client.send(new PutObjectCommand(uploadParams));
    const signedUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand(uploadParams),
      { expiresIn: -1 },
      (err, url) => {
        if (err) {
          console.error("Error getting signed URL", err);
          throw err;
        }
        console.log("Signed URL:", url);
      }
    );
    const urlParser = new URL(signedUrl);
    const url = `${urlParser.protocol}//${urlParser.hostname}${urlParser.pathname}`;
    console.log("Uploaded to DigitalOcean Spaces:", data);
    return url;
  } catch (error) {
    console.error("Error uploading to DigitalOcean Spaces", error);
    throw error;
  } finally {
    // Delete the temporary file
    fs.unlink(file.path, (unlinkErr) => {
      if (unlinkErr) {
        console.error("Error deleting temporary file", unlinkErr);
      }
    });
  }
}


const handleFileUpload = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (req.file) {
        req.fileCleanup = async () => {
          try {
            await fs.unlink(req.file.path);
            console.log(`Cleaned up file: ${req.file.path}`);
          } catch (unlinkError) {
            console.error("Error deleting file:", unlinkError);
          }
        };
      }

      next();
    });
  };
};

export { upload ,uploadToSpaces,handleFileUpload};
