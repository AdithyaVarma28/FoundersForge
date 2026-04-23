import express from "express";
import bcrypt from "bcryptjs";
import { queryGroq } from "./groq_handler.js";
import User from "./user.js";
import Project from "./project.js";

const router=express.Router();

router.post("/chat",async(req,res)=> {
  try {
    const { message }=req.body;

    const result=await queryGroq(message);

    res.json({success:true,reply:result});
  } 
  catch(error) {
    console.error("Route Error:", error);
    res.status(500).json({error: "Groq failed"});
  }
});

router.post("/signup",async(req,res)=> {
  try {
    const {role,fullName,email,password}=req.body;

    const existingUser=await User.findOne({email});
    if(existingUser) {
      return res.status(400).json({error:"User already exists"});
    }

    const hashedPassword=await bcrypt.hash(password,10);

    const user=new User({role,fullName,email,password:hashedPassword});
    await user.save();

    res.json({success:true,message:"User registered successfully"});
  } 
  catch(error) {
    console.error("Signup Error:",error);
    res.status(500).json({error:"Signup failed"});
  }
});

router.post("/login",async(req,res) => {
  try {
    const {email,password}=req.body;

    const user=await User.findOne({email});
    if(!user) {
      return res.status(400).json({error:"Invalid credentials"});
    }

    const isMatch=await bcrypt.compare(password,user.password);
    if(!isMatch) {
      return res.status(400).json({error:"Invalid credentials"});
    }

    res.json({success:true,user:{id:user._id,role:user.role,fullName:user.fullName,email:user.email}});
  } 
  catch(error) {
    console.error("Login Error:",error);
    res.status(500).json({error:"Login failed"});
  }
});

router.post("/create-project",async(req,res)=> {
  try {
    const {founderId,title,category,skills,funding,stage,description}=req.body;

    const project=new Project({founderId,title,category,skills,funding,stage,description});
    await project.save();

    res.json({success:true,project});
  } 
  catch(error) {
    console.error("Create Project Error:",error);
    res.status(500).json({error:"Create project failed"});
  }
});

router.get("/my-projects/:userId",async(req,res)=> {
  try {
    const {userId}=req.params;

    const projects=await Project.find({founderId:userId});

    res.json({success:true,projects});
  } 
  catch(error) {
    console.error("Get My Projects Error:",error);
    res.status(500).json({error:"Get projects failed"});
  }
});

router.get("/all-projects",async(req,res)=> {
  try {
    const projects=await Project.find();

    res.json({success:true,projects});
  } 
  catch(error) {
    console.error("Get All Projects Error:",error);
    res.status(500).json({error:"Get projects failed"});
  }
});

export default router;