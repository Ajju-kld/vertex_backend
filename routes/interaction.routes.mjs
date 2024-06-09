import { Router } from "express";


import { follow, unfollow } from "../controllers/interaction.controller.mjs";

const router = Router();


router.post('/follows/:id',follow);

export default router;
