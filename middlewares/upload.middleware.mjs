import path from "path";
import multer from "multer";
import AWS from "aws-sdk";
import fs from "fs";

// Configure AWS SDK for DigitalOcean Spaces
const spacesEndpoint = new AWS.Endpoint(
  "https://vertex-bucket.blr1.digitaloceanspaces.com"
);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET,
});

const BUCKET_NAME = process.env.DO_SPACES_BUCKET || "your-bucket-name";

// Multer configuration for temporary file storage
const upload = multer({ dest: "temp/" });

const uploadToSpaces = (file, destination) => {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(file.path);
    const fileName = `${destination}/${path.basename(file.path)}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: fileStream,
      ACL: "public-read",
      ContentType: file.mimetype,
    };

    s3.upload(params, (err, data) => {
      // Delete the temporary file
      fs.unlink(file.path, (unlinkErr) => {
        if (unlinkErr)
          console.error("Error deleting temporary file", unlinkErr);
      });

      if (err) {
        console.error("Error uploading to DigitalOcean Spaces", err);
        reject(err);
      } else {
        resolve(data.Location);
      }
    });
  });
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
