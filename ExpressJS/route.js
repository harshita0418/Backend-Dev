const express = require("express");
const app = express();
app.use(express.json());
let student = [
    { id: 1, name: "Harshita", marks: 85, city: "Hyderabad"},
    { id: 2, name: "Garv", marks: 90, city: "Mumbai"},
    { id: 3, name: "Mona", marks: 78, city: "Delhi"},
];
//view students
app.get("/students", (req, res) => {
    res.json({ message: "students fetched successfully", student });
});

// Patch- update any one field (marks/city/name)
app.patch("/students/:id", (req, res) => {
    const id = req.params.id;
    const updates = req.body;
    const student = students.find((s) => s.id === id);
    if (!student) {
        return res.status(404).json({ message: "student not found" });
    }   

    // apply partial updates
        Object.assign(student, updates);
        res.json({ message: "student updated successfully", student });
    });
app.listen(3000, () => {
    console.log("server is running on port 3000");
});