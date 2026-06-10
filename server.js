require("dotenv").config();

const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get("/api/status", (req, res) => {
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
    const { role, difficulty } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `
Generate one ${difficulty} level professional interview question
for a ${role} role.

Return only the question.
`,
    });

    res.json({
      success: true,
      selectedRole: role,
      difficulty: difficulty,
      question: response.text,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Gemini quota exceeded. Please wait a few minutes and try again.",
    });
  }
});

app.post("/evaluate-answer", async (req, res) => {
  try {
    const { question, answer } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `
You are an interview evaluator.

Evaluate this answer.

Question: ${question}
Candidate Answer: ${answer}

Return ONLY valid JSON in this exact format:
{
  "score": 0,
  "strengths": ["point 1", "point 2"],
  "improvements": ["point 1", "point 2"],
  "sampleAnswer": "better answer here"
}
`,
    });

    const cleanedText = response.text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const evaluation = JSON.parse(cleanedText);

    res.json({
      success: true,
      ...evaluation,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Gemini quota exceeded. Please wait a few minutes and try again.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});