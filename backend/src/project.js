import mongoose from "mongoose";

const projectSchema=new mongoose.Schema({
  founderId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true,
  },
  title:String,
  category:String,
  skills:[String],
  funding:String,
  stage:String,
  description:String,
},{timestamps:true});

export default mongoose.model("Project",projectSchema);