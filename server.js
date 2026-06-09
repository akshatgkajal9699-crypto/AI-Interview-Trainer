require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");
const express = require("express");

const app = express();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "AI Interview Trainer Server Running",
  });
});

app.get("/test", (req, res) => {
  res.send("TEST ROUTE WORKING");
});

app.post("/generate-question", async (req, res) => {
  try {
    const role = req.body.role;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate one interview question for a ${role} role.`,
    });

    res.json({
      success: true,
      selectedRole: role,
      question: response.text,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error generating question",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});