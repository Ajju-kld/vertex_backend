import path from "path";
import multer from "multer";
const __dirname=path.resolve();
import fs from "fs";
// create storage object for storing files
const MEDIA_BASE_PATH = process.env.MEDIA_BASE_PATH || "/home/vertex/media"; 

const storage = (destination) =>

  multer.diskStorage({
    destination: function (req, file, cb) {
        const folderPath = path.join(MEDIA_BASE_PATH, `${destination}`);
        
        // Create the destination folder if it doesn't exist
        fs.mkdir(folderPath, { recursive: true }, function(err) {
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
      if (file.mimetype.startsWith("image/")|| file.mimetype.startsWith("video/")) {
        cb(null, true);
      } else {
        cb(new Error("Only images are allowed"));
      }
    },
  }).single(fieldName);


const uploadPost = async (req,res) => {
  try {
    let file_name = "";

    const destination = `${req.user.username}/posts`;
    const fieldName = "post";
      await new Promise((resolve, reject) => {
    upload(destination, fieldName)(req,res,function (err) {
      if (err instanceof multer.MulterError) {
        // A multer error occurred (e.g., file size exceeded)
        reject(err);
        return res.status(400).json({ success: false, message: err.message });
      } else if (err) {
        // Other errors occurred
        reject(err);
        return res.status(500).json({ success: false, message: err.message });
      }
      // File uploaded successfully
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }
      file_name = req.file.path.split("/").pop();
      resolve();
    });

      // Extract the file name from the uploaded file path
      
      console.log(file_name);

      // Return the file path
      return file_name;
      
    });
  } catch (error) {
    console.log(error);
    
  }
};



const uploadprofile = async (req, res) => {
  try {
    console.log("Starting uploadprofile function");
    let file_name = "";

    const destination = `${req.user.username}/profile`;
    const fieldName = "profile";

    console.log("Destination:", destination);
    console.log("Field name:", fieldName);

    file_name = await new Promise((resolve, reject) => {
      upload(destination, fieldName)(req, res, function (err) {
        console.log("Inside upload callback");
        if (err instanceof multer.MulterError) {
          console.error("Multer error:", err);
          reject(err);
          return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
          console.error("Other error:", err);
          reject(err);
          return res.status(500).json({ success: false, message: err.message });
        }

        console.log("req.file:", req.file);

        if (!req.file) {
          console.error("No file uploaded");
          reject(new Error("No file uploaded"));
          return res
            .status(400)
            .json({ success: false, message: "No file uploaded" });
        }

        const uploadedFileName = req.file.path.split("/").pop();
        console.log("Uploaded file name:", uploadedFileName);
        resolve(uploadedFileName);
        file_name = uploadedFileName;
      });
    });

    console.log("File name after upload:", file_name);

    // Return the file path
    return file_name;
  } catch (error) {
    console.error("Error in uploadprofile:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
export {uploadPost,uploadprofile}