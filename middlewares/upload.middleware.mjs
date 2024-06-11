import path from "path";
import multer from "multer";
import fs from "fs";

const __dirname=path.resolve();
// create storage object for storing files
const storage = (destination) =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      const folderPath = path.join(
        __dirname,
        `../../../vertex/media/${destination}`
      );

      // Create the destination folder if it doesn't exist
      fs.mkdir(folderPath, { recursive: true }, function (err) {
        if (err) {
          // Handle error, e.g., folder already exists
          console.error("Error creating destination folder:", err);
          return cb(err);
        }
        cb(null, folderPath); // Destination folder
      });
    },
    filename: function (req, file, cb) {
      // Filename format: <user_name>-<timestamp>.<extension>
      cb(
        null,
        req.user.username + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });

// Multer upload configuration
const upload = (destination, fieldName) =>
  multer({
    storage: storage(destination),
    limits: {
      fileSize: 200 * 1024 * 1024, // Limit file size to 5MB
    },
    fileFilter: function (req, file, cb) {
      // Check file type
      if (
        file.mimetype.startsWith("image/") ||
        file.mimetype.startsWith("video/")
      ) {
        cb(null, true);
      } else {
        cb(new Error("Only images are allowed"));
      }
    },
  }).single(fieldName);

const uploadPost = async (req, res, next) => {

 const destination = `${req.user.username}/posts`;
const fieldname = "post";
  upload(destination, fieldname)(req, res, async function (err) {
    try {
      if (err instanceof multer.MulterError) {
        // A multer error occurred (e.g., file size exceeded)
        return res.status(400).json({ success: false, message: err.message });
      } else if (err) {
        // Other errors occurred
        return res.status(500).json({ success: false, message: err.message });
      }

      // File uploaded successfully
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }

      // Store file path or URL in the activity document

      const file_name = req.file.path.split("/").pop();

   

      // Save the updated activity document
 
      res.status(200).json({
        success: true,
        message: "file uploaded successfully",
        filename: file_name,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Error saving activity with proof" });
    }
  });
};

export { uploadPost };
