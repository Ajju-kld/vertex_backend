import { Router } from "express";
import { getSelfProfile, login, Register,uploadProfile } from "../controllers/auth.controller.mjs";
import { verifyToken } from "../middlewares/auth.middleware.mjs";
import { upload } from "../middlewares/upload.middleware.mjs";
const router = Router();

router.post("/register",upload.single('profile'),Register );
router.post("/login", login);
router.get("/self",verifyToken,getSelfProfile)
router.put('/setProfile',verifyToken,uploadProfile)

export default router;
// Path: routes/post.routes.mjs
