
import { Router } from "express";

import { verifyToken } from "../middlewares/auth.middleware.mjs";
import { deletePost, getallposts, getPostbyId, likePost, uploadPost,unlikePost,unlikedComment,commentPost,likedComment,userspecificposts,userPosts,getCommentbyPostbyId} from "../controllers/post.controller.mjs";
import { handleFileUpload} from "../middlewares/upload.middleware.mjs";


const router = Router();

router.post('/upload',verifyToken,handleFileUpload,uploadPost);
router.get('/',verifyToken,getallposts);
router.get('/user/',verifyToken,userPosts);
router.get('/comment/:id',verifyToken,getCommentbyPostbyId);
router.post('/comment/:id',verifyToken,commentPost);
router.get('/comment/like/:id',verifyToken,likedComment);
router.get('/comment/unlike/:id',verifyToken,unlikedComment);
router.get("/:id",verifyToken,getPostbyId)
router.put('/like/:id',verifyToken,likePost);
router.delete('/like/:id',verifyToken,deletePost);






export default router;
