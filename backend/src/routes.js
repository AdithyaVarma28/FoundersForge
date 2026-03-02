import express from "express";
import { queryGroq } from "./groq_handler.js";

const router=express.Router();

router.post("/chat",async (req,res)=> {
  try {
    const { message }=req.body;

    const result=await queryGroq(message);

    res.json({success:true,reply:result,});
  } 
  catch(error) {
    console.error("Route Error:",error);
    res.status(500).json({ error: "Groq failed" });
  }
});

export default router;