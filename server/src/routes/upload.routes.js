import { Router } from "express";
import { uploadImageHandler } from "../controllers/upload.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { upload } from "../controllers/upload.controller.js";

const router = Router();

// Only authenticated users can upload images
router.post("/upload", requireAuth, upload.single("file"), uploadImageHandler);

export default router;