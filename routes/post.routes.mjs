import { Router } from "express";

import { verifyToken } from "../middlewares/auth.middleware.mjs";
import { deletePost, getPostbyId, likePost,  uploadPostContent, uploadPostDetails } from "../controllers/post.controller.mjs";


const router = Router();

router.post('/upload',verifyToken,uploadPostContent);
router.get("/:id",verifyToken,getPostbyId)
router.post('/uploadDetails',verifyToken,uploadPostDetails);
router.put('/like/:id',verifyToken,likePost);
router.delete('/like/:id',verifyToken,deletePost);

export default router;
