// Error-Handling Middleware
const express = require("express");
const app = express();
app.use(express.json());


app.get("/error", (req, res, next) => {
  try {
    throw new Error("Something went wrong!");
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.error("Error Middleware:", err.message);
  res.status(500).json({
    message: "Internal Server Error",
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});