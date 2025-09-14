import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { charity } = req.body;
  if (!charity) return res.status(400).json({ valid: false, error: "No charity provided" });

  try {
    console.log("Validating charity:", charity);

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Is "${charity}" a real registered nonprofit charity? Reply only "yes" or "no".`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log("Gemini raw response:", JSON.stringify(data, null, 2));

    // Safely extract text
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.toLowerCase() || "";

    const isValid = text.includes("yes");

    res.status(200).json({ valid: isValid });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ valid: false, error: "Failed to validate charity" });
  }
}
