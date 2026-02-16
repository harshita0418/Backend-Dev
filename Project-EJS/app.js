const express = require("express");
const app = express();

// Set EJS as the view engine
app.set("view engine", "ejs");

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Sample data for demonstration
const students = [
  { id: 1, name: "Akash", age: 20, grade: "A", active: true },
  { id: 2, name: "Yash", age: 22, grade: "B", active: true },
  { id: 3, name: "Shubham", age: 19, grade: "C", active: false },
  { id: 4, name: "Sameer", age: 21, grade: "A+", active: true },
];

// Home Route
app.get("/", (req, res) => {
  res.render("index", {
    title: "Welcome to EJS Demo",
    message:
      "This project demonstrates the power of Embedded JavaScript templates.",
    features: ["Variable Interpolation", "Conditionals", "Loops", "Partials"],
    showWelcome: true,
  });
});

// Students Route
app.get("/students", (req, res) => {
  res.render("students", {
    title: "Student Directory",
    students: students,
  });
});

app.listen(3000, () => {
  console.log("Server Started");
});
