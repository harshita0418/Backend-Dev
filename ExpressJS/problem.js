// PROBLEM STATEMENT
/* Modify the existing DELETE/students/:id API with the following rule:
A student can be deleted only if their marks are less than 80. If the marks are 70. if marks are 70 or above, return a proper error message */

const express=require("express");
const app=express();
app.use(express.json());
let students=[
{ id: 11, name:"aman", marks:60, city:"agra"},/*0*/
{ id: 12, name:"naman", marks:45, city:"hyderabad"},
{ id: 13, name:"yash", marks:80, city:"delhi"}
];
app.get("/students",(req,res)=>{
    res.json(students);
});
app.delete("/students/:id",(req,res)=>{
    const id=req.params.id;
     const {marks}=students;
    // console.log(req.body);
    
    const index=students.findIndex((s) => s.id==id);
    

    console.log(("index",index));
     if(index === -1){
        return res.status(404).json({message:"student not found"});
    } 
    if(students[index].marks < 70){
        const deletedStudent=students.splice(index,1); //splice method to add or remove elements from an array  and 1 is for -> number of arrays to be deleted 
    res.json({message:"student deleted successfully",deletedStudent:deletedStudent[0],});
    }
    else{
        res.json({message:"student cannot be deleted as marks are avove 70%",});

    }
});

app.listen(8080,()=>console.log("server started"));