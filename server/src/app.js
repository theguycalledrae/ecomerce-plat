import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import productRoutes from "./routes/product.routes.js";
import {
  notFoundHandler,
  errorHandler,
} from "./middleware/errorHandler.js";

const app = express();

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174'];

// Allow the Vite dev servers and production frontend to call this API.
// credentials:true lets the auth cookie cross origins.
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api", uploadRoutes);

// 404 + error handling must run after all routes
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
