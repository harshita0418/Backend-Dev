const express=require("express");
const app=express();
app.use(express.json());
let credentials=[
    {email:"john@email.com",password:"123"},
    {email:"alex@email.com",password:"456"},
];

app.get("/auth/users",(req,res)=>{
    res.json({message:"user fetched successfully",credentials});
})

//reset password route
app.put("/auth/reset",(req,res)=>{
    const{email,password,newPassword}=req.body;

    //find user
    const user=credentials.find(
        (cred)=>cred.email==email&&cred.password==password
    );
    if(!user){
        return res.status(400).json({message:"invalid email or password"})
    }
    user.password=newPassword;
    res.json({message:"password reset successfully"});
})

// update password 

user.password=newPassword;
res.json({message:"password updated successfully",user});

// forget password route (dummy implementation)

app.put("/auth/forget",(req,res)=>{
    const{email,newPassword}=req.body;  
    const user=credentials.find((cred)=>cred.email==email);
    if(!user){
        return res.status(400).json({message:"email not found"});
    }
    user.password=newPassword;
    res.json({message:"password updated successfully",user});
});
app.listen(3000,()=>{
    console.log("server is running on port 3000");
});