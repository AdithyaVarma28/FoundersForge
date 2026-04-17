import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
  role:String,
  fullName:String,
  email:String,
  password:String
});

export default mongoose.model("User",userSchema);