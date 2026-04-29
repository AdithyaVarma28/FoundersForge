import mongoose from "mongoose";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import Project from "../models/Project.js";
import Resume from "../models/Resume.js";
import Application from "../models/Application.js";
import Investment from "../models/Investment.js";
import ChatRoom from "../models/ChatRoom.js";
import Message from "../models/Message.js";

const registeredModels = [User, Profile, Project, Resume, Application, Investment, ChatRoom, Message];

function getMongoUri() {
  return process.env.MONGO_URI || "mongodb://0.0.0.0:27017/foundersforge";
}

function getDatabaseName() {
  return process.env.MONGO_DB_NAME || undefined;
}

async function ensureCollectionAndIndexes(model) {
  const collectionName = model.collection.collectionName;
  const existingCollections = await mongoose.connection.db.listCollections({ name: collectionName }).toArray();

  if (existingCollections.length === 0) {
    await model.createCollection();
    console.log(`Created collection: ${collectionName}`);
  }

  try {
    await model.createIndexes();
    console.log(`Ensured indexes for: ${collectionName}`);
  } catch (error) {
    console.warn(`Index initialization warning for ${collectionName}: ${error.message}`);
  }
}

export async function initializeDatabaseSchema() {
  for (const model of registeredModels) {
    await ensureCollectionAndIndexes(model);
  }
}

export async function connectDatabase() {
  const mongoUri = getMongoUri();
  const dbName = getDatabaseName();

  mongoose.set("strictQuery", true);

  const connectionOptions = {
    dbName,
    autoIndex: String(process.env.MONGO_AUTO_INDEX ?? "true") === "true",
    serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 10000),
    socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS || 45000),
    maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 10),
    minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE || 1),
    retryWrites: true,
  };

  try {
    await mongoose.connect(mongoUri, connectionOptions);
    await mongoose.connection.db.admin().ping();
    console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);

    await initializeDatabaseSchema();

    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}
