import path from "path";
import multer from "multer";

// create storage object for storing files 

const storage = (destination) =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      cb(
        null,
        path.join(
          __dirname,
          `../../../../../vertex/media/${destination}`
        )
      ); // Destination folder
    },
    filename: function (req, file, cb) {
      // Filename format: <user_name>-<timestamp>.<extension>
      cb(
        null,
        req.user.firstName + "-" + Date.now() + path.extname(file.originalname)
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
    fileFilter: function (req, file, next) {
      // Check file type
      if (file.mimetype.startsWith("image/")|| file.mimetype.startsWith("video/")) {
        next(null, true);
      } else {
        next(new Error("Only images are allowed"));
      }
    },
  }).single(fieldName);

const uploadPost = async (req, res, next) =>
    {
      let file_name='';
        try {
            const destination=`${req.user.username}/posts`;
            const fieldName = 'post';
             upload(destination, fieldName)(req,res,function (err) {
               if (err instanceof multer.MulterError) {
                 // A multer error occurred (e.g., file size exceeded)
                 return res
                   .status(400)
                   .json({ success: false, message: err.message });
               } else if (err) {
                 // Other errors occurred
                 return res
                   .status(500)
                   .json({ success: false, message: err.message });
               }
               // File uploaded successfully
               if (!req.file) {
                 return res
                   .status(400)
                   .json({ success: false, message: "No file uploaded" });
               }
                 file_name = req.file.path.split("/").pop();

                
             });

res.status(200).json({message: "File uploaded successfully, please wait...", success: true,fileURLToPath: file_name});
        } catch (error) {
            next(error);
            
        }

    }
export {uploadPost}