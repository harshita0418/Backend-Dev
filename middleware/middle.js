const express=require("express");
const app=express();
app.use((req,res,next)=>{
    console.log("middleware executed");
    next();
});
app.use((req,res,next)=>{
    console.log("middle ware 2");
    next();
});

app.get("/test",(req,res)=>{
    res.send("route executed ")
});

app.listen(8000,()=>console.log("server started"));
