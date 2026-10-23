
import express from "express";

const router = express.Router();

const AI_FIESTURA_URL =
  process.env.AI_FIESTURA_URL || "http://localhost:8000";

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "A non-empty message is required",
      });
    }

    const response = await fetch(`${AI_FIESTURA_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({
        error: "AI service returned an unsuccessful response",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return res.status(504).json({
        error: "AI service timed out",
      });
    }

    console.error("Error communicating with AI-Fiestura:", error.message);

    return res.status(502).json({
      error: "AI service is currently unavailable",
    });
  }
});

export default router;
