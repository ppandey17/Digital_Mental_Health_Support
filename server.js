import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from "path";
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static assets from the assets directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve pages from the pages directory
app.use('/pages', express.static(path.join(__dirname, 'pages')));

// 🔑 Your Gemini API Key (replace with your real one)
const GEMINI_API_KEY = "AIzaSyCermuUJp_odYIPlgXdvE1NQ31zyGMb9AI";

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
        }),
      }
    );

    const data = await response.json();
    console.log("🔎 Gemini raw response:", data); // Debugging

    if (data.error) {
      return res
        .status(500)
        .json({ reply: "Gemini API Error: " + data.error.message });
    }

    const aiResponse =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I could not process that.";

    res.json({ reply: aiResponse });
  } catch (err) {
    console.error("❌ Gemini API error:", err);
    res.status(500).json({ reply: "Error connecting to Gemini API." });
  }
});

app.listen(5000, () =>
  console.log("✅ Server running on http://localhost:5000")
);