import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import User from "../models/user.model.js";
import { sanitizeUser } from "../services/auth.service.js";

/** 
 * Configure multer storage to work with cloudinary's upload API.
 * We'll use memory storage so we can send the file buffer directly.
 */
const storage = multer.memoryStorage();
export const upload = multer({ storage });

/**
 * Configure Cloudinary with credentials from environment variables.
 * These are already set in server/.env.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload handler - receives file from client and uploads to Cloudinary.
 * Returns the image URL on success.
 */
export async function uploadImageHandler(req, res, next) {
  try {
    // Check if file was provided
    if (!req.file) {
      return res.status(400).json({ 
        errors: [{ field: "file", message: "No file uploaded" }] 
      });
    }

    // Upload to Cloudinary via stream
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "ecommerce",
          resource_type: "image",
          public_id: `user_${Date.now()}`,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // Get the secure URL of the uploaded image
    const imageUrl = result.secure_url;

    // Update user's image (optional: you could also update a product's image)
    // For now, we'll update the currently authenticated user's image
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        errors: [{ field: "auth", message: "Not authenticated" }] 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        errors: [{ field: "user", message: "User not found" }] 
      });
    }

    // Update the user's image field
    user.image = imageUrl;
    await user.save();

    // Return the image URL to the client
    res.status(200).json({ 
      message: "Image uploaded successfully", 
      imageUrl,
      user: sanitizeUser(user)
    });
  } catch (err) {
    // Handle Cloudinary upload errors
    if (err?.response?.body?.message) {
      return res.status(400).json({ 
        errors: [{ field: "upload", message: err.response.body.message }] 
      });
    }
    next(err);
  }
}