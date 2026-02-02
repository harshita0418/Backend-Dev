const express=require("express");
//    const app=express();
   app.get("/",(req,res)=>{
    return res.send("home page");
   });
   app.get("/attendance",(req,res)=>{
    const name=req.query.name;
    const present=req.query.present;
    res.send(`${name} is ${present} present`); 
    });

   const express=require("express");
   const app=express();
   app.use(express.json());
   app.get("/",(req,res)=>{
    return res.send("home page");
   });
   app.get("/attendance",(req,res)=>{
    const name=req.query.name;
    const present=req.query.present;
    res.send(`${name} is ${present} present`); 
    });
     

    const students=[
    {name:"yash",id:1,branch:"CSE"},
    {name:"akash", id:2, branch:"CSE"},
    {name:"aryan" ,id:3,branch:"CSE"},
   ];


//student API
app.post("/student/add",async (req,res)=>{
   const data=req.body;
   students.push({name:data.name, id:data.id, branch:data.branch});
   // or
   students.push(data);
   res.send(students);
});
   app.listen(8000,()=> console.log("server started"));