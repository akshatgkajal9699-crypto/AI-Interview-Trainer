require("dotenv").config();

const express = require("express");
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "AI Interview Trainer Server Running"
  });
});

app.post("/generate-question", (req, res) => {
  const role = req.body.role;

  res.json({
    success: true,
    selectedRole: role,
    question: `Tell me about yourself as a ${role}`
  });
});

app.get("/test", (req, res) => {
  res.send("TEST ROUTE WORKING");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});