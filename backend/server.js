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
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      // Allow any localhost or 127.0.0.1 origin in development
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      // Allow explicitly configured client URL
      const allowed = process.env.CLIENT_URL;
      if (allowed && origin === allowed) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
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

  // Handle port-in-use error BEFORE calling listen
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\n❌  Port ${PORT} is already in use!`);
      console.error(`   Run this to free it:  taskkill /IM node.exe /F`);
      console.error(`   Then run:             npm start\n`);
      process.exit(1);
    } else {
      throw err;
    }
  });

  server.listen(PORT, () => {
    console.log(`\n✅  Server running at http://localhost:${PORT}\n`);
  });
}

async function shutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down...`);
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
