const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/verify", async (req, res) => {
  const { charityName } = req.body;

  if (!charityName)
    return res.status(400).json({ error: "No charity name provided" });

  try {
    const response = await axios.post(
      "https://api.gemini.com/v1/verify_charity",
      { name: charityName },
      { headers: { Authorization: `Bearer ${process.env.GEMINI_API_KEY}` } }
    );

    res.json({ isValid: response.data.isValid });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ isValid: false, error: "API error" });
  }
});

module.exports = router;
