import { Router } from "express";

import { verifyToken } from "../middlewares/auth.middleware.mjs";
import { deletePost, getPostbyId, likePost,  uploadPostContent, uploadPostDetails } from "../controllers/post.controller.mjs";
import { upload } from "../middlewares/upload.middleware.mjs";


const router = Router();

router.post('/upload',verifyToken,upload.single('post'),uploadPost);
router.get("/:id",verifyToken,getPostbyId)
router.put('/like/:id',verifyToken,likePost);
router.delete('/like/:id',verifyToken,deletePost);

export default router;
