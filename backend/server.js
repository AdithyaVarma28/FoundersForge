import dotenv from "dotenv";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import routes from "./src/routes.js";
import { connectDatabase, disconnectDatabase } from "./src/config/database.js";
import { errorHandler, notFoundHandler } from "./src/middleware/errorHandler.js";
import { attachChatSocket } from "./src/sockets/chatSocket.js";

dotenv.config({ quiet: true });

const app = express();
const server = http.createServer(app);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 8080);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "FoundersForge backend",
    database: "mongodb-atlas-ready",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", routes);
app.use(notFoundHandler);
app.use(errorHandler);

attachChatSocket(server);

async function startServer() {
  await connectDatabase();

  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

async function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await disconnectDatabase();
    } finally {
      process.exit(0);
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer().catch((error) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});
