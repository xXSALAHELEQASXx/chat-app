import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ success: false, message: "No prompt provided" });

    const n8nResponse = await fetch("https://salaheleqas2.app.n8n.cloud/webhook/ai-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await n8nResponse.json();

    // Safely find the first object that contains text
    let reply;
    for (const key of Object.keys(data)) {
      if (Array.isArray(data[key]) && data[key][0]?.text) {
        reply = data[key][0].text;
        break;
      }
    }

    if (!reply) return res.json({ success: false, message: "AI returned no reply" });

    res.json({ success: true, reply });
  } catch (err) {
    console.error("AI route error:", err);
    res.json({ success: false, message: "AI response failed" });
  }
});

export default router;