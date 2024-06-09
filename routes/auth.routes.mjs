import { Router } from "express";
import { login, Register } from "../controllers/auth.controller.mjs";
const router = Router();

router.post("/register",Register );
router.post("/login", login);


export default router;
// Path: routes/post.routes.mjs
