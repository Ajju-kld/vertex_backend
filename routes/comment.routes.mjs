import { Router } from "express";
import { commentPost,likedComment } from "../controllers/post.controller.mjs";

const router = Router();

router.post("/:id", commentPost);
router.put("/likes/:id", likedComment);

export default router;
// Path: routes/post.routes.mjs
