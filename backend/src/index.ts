import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import apiRoutes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api", apiRoutes);

// Basic Route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

// Add the real error handler (Assuming it's imported at the top, I will check if they imported it. Wait, I told them to import it earlier).

app.use(errorHandler);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
