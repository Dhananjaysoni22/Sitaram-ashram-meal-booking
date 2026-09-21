"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middlewares/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api", routes_1.default);
// Basic Route
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Backend is running" });
});
// Add the real error handler (Assuming it's imported at the top, I will check if they imported it. Wait, I told them to import it earlier).
app.use(errorHandler_1.errorHandler);
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
