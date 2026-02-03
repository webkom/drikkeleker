const Groq = require("groq-sdk");
const Room = require("../models/Room");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.generateSuggestions = async (req, res) => {
  try {
    const { roomCode } = req.body;

    const room = await Room.findOne({ roomCode });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const existingChallenges = room.challenges
      .slice(-10)
      .map((c) => c.text)
      .join(", ");

    const prompt = `
      CONTEXT:
      A party game in Norway. Current challenges: "${existingChallenges}".
      
      TASK:
      Create 3 NEW, SHORT, FUN challenges (Norwegian Bokmål).
      Style: Edgy, funny, or physical. Max 1 sentence.
      
      FORMAT:
      Return ONLY a JSON array of strings. Do not use Markdown.
      Example: ["Alle som har ... må ta 5 slurker", "Pekeleken: Hvem..."]
      Make them unique and fun. 
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "openai/gpt-oss-120b",
      temperature: 1,
      max_tokens: 1024,
    });

    let text = chatCompletion.choices[0]?.message?.content || "";

    const jsonMatch = text.match(/\[.*\]/s);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    const suggestions = JSON.parse(text);

    res.json({ suggestions });
  } catch (error) {
    console.error("Groq Error:", error);
    res.status(500).json({ error: "AI brain freeze" });
  }
};
