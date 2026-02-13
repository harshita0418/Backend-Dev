// Application level middleware

const express=require("express");           
const app=express();
app.use((req,res,next)=>{
    console.log("Request url:",req.url);
    console.log("Request method:",req.method);
    next(); // Call the next middleware function in the stack
});
app.get("/home",(req,res)=>{
    res.send("Welcome to the home page!");
});
app.listen(8000,()=>console.log("Server started on port 8000"));    

// Built-in middleware

app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

const checkLogin=(req,res,next)=>{
    const isLoggedIn=false; 
    if(isLoggedIn){
        next(); // User is logged in, proceed to the next middleware or route handler
    } else{
        res.status(401).send("Unauthorized access");
    }
    next();
};

app.get("/dashboard",checkLogin,(req,res)=>{
    res.send("Welcome to the dashboard!");
});

app.listen(8000,()=>console.log("Server started on port 8000"));


// route level middleware

const checkAdmin=(req,res,next)=>{
    const isAdmin=true;
    if(isAdmin){
        next(); // User is an admin, proceed to the next middleware or route handler
    } else{
        res.status(403).send("Forbidden access");
    }
};

app.get("/admin",checkAdmin,(req,res)=>{
    res.send("Welcome to the admin panel!");
});
app.listen(8000,()=>console.log("Server started on port 8000"));


// Authentication middleware

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(403).json({ message: "Token required" });
  }

  if (token !== "harshita") {
    return res.status(401).json({ message: "Invalid token" });
  }

  next();
};

app.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: "Profile data" });
});   

//Error Handling Middleware

app.get("/error", (req, res) => {
  throw new Error("Something went wrong!");
});

app.use((err, req, res, next) => {
  console.error("Error Middleware:", err.message);
  res.status(500).json({
    message: "Internal Server Error",
  });
});

app.listen(8000, () => console.log("Server Started"));

