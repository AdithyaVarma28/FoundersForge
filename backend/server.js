import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import routes from "./src/routes.js";

dotenv.config();

const app=express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/foundersforge",{
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(()=> {
  console.log("Connected to MongoDB");
}).catch((error)=> {
  console.error("MongoDB connection error:",error);
});

app.use("/api",routes);

const PORT=process.env.PORT;

app.listen(PORT,()=> {
  console.log(`Server running at http://localhost:${PORT}`);
});