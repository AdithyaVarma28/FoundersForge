import dotenv from "dotenv";
import { connectDatabase, disconnectDatabase } from "../src/config/database.js";

dotenv.config({ quiet: true });

async function initialize() {
  try {
    await connectDatabase();
    console.log("Database initialization completed successfully.");
  } catch (error) {
    console.error("Database initialization failed:", error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
}

initialize();
