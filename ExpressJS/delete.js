// delete request -> to delete a record

const express = require("express"); 
const app = express();  
app.use(express.json());

let students = [
    { id: 1, name: "Harshita", marks: 85, city: "Hyderabad"},
    { id: 2, name: "Garv", marks: 90, city: "Mumbai"},
    { id: 3, name: "Mona", marks: 78, city: "Delhi"},
];

//view students
app.get("/students", (req, res) => {
    res.json({ message: "students fetched successfully", students });
});


//Delete - Remove a student by id
app.delete("/students/:id", (req, res) => {
    const id = req.params.id;
    const index = students.findIndex((s) => s.id === id);
    if (index === -1) {
        return res.status(404).json({ message: "student not found" });
    }
    const deletedStudent = students.splice(index, 1);
    res.json({ message: "student deleted successfully", student: deletedStudent[0] });
});
app.listen(3000, () => {
    console.log("server is running on port 3000");
});

