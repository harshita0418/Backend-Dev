const express=require("express");
   const app=express();
   app.get("/",(req,res)=>{
    return res.send("home page");
   });
   app.get("/attendance",(req,res)=>{
    const name=req.query.name;
    const present=req.query.present;
    res.send(`${name} is ${present} present`); 
    });
     app.listen(8000,()=> console.log("server started"));