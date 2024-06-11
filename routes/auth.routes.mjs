import { Router } from "express";
import { getSelfProfile, login, Register } from "../controllers/auth.controller.mjs";
import { verifyToken } from "../middlewares/auth.middleware.mjs";
const router = Router();

router.post("/register",Register );
router.post("/login", login);
router.get("/self",verifyToken,getSelfProfile)


export default router;
// Path: routes/post.routes.mjs
