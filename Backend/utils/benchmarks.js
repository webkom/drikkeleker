const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const existingChallenges = [
  "Alle som kom for sent må ta ett shot",
  "Den yngste og den eldste kan dele ut 5 slurker",
  "Du kan velge 3 personer som må snakke med bergensdialekt resten av runden",
  "Du må se opp i taket til det er din tur igjen",
];

const MODELS_TO_TEST = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3-32b",
  "moonshotai/kimi-k2-instruct",
  "allam-2-7b",
  "groq/compound",
  "groq/compound-mini",
  "meta-llama/llama-4-maverick-17b-128e-instruct",
  "meta-llama/llama-4-scout-17b-16e-instruct",
];

const prompt = `
  ROLE:
  You are the ultimate party host for a Norwegian "vorspiel" (pre-party). You create chaotic, funny, and edgy drinking game challenges in Norwegian Bokmål.

  INPUT DATA:
  Avoid repeating similar concepts to these existing challenges: "${existingChallenges}".

  TASK:
  Generate 3 NEW, distinct challenges.
  
  GUIDELINES:
  - **Brevity:** Maximum 1 sentence per challenge.
  - **Tone:** Edgy, flirtatious, physical, or brutally honest. No "generic" boring questions.

  EXAMPLES (Do exactly this style):
  - "Pekeleken: Hvem i rommet ville dødd først i en zombie-apokalypse?"
  - "Alle som har ligget med en kollega må ta 3 slurker."
  - "Ingen kan si ordet Ja eller Nei til du får mobilen igjen"
  - "Truth or Dare!"

  OUTPUT FORMAT:
  Return **ONLY** a raw JSON array of strings. 
  Do NOT use Markdown code blocks (no \`\`\`json).
  Do NOT add conversational filler like "Here are your suggestions."
  
  Correct Output Example:
  ["Challenge 1 text here", "Challenge 2 text here", "Challenge 3 text here"]
`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
console.log("| Model Name | Attempt | Time (ms) | Status | Output Snippet |");
console.log("|---|---|---|---|---|");
const runBenchmark = async () => {
  for (const model of MODELS_TO_TEST) {
    for (let i = 0; i < 3; i++) {
      const start = Date.now();
      let status = "Good";
      let snippet = "";
      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          model: model,
          temperature: 1,
          max_tokens: 1024,
        });

        const duration = Date.now() - start;
        const content = chatCompletion.choices[0]?.message?.content || "";
        const jsonMatch = content.match(/\[.*\]/s);
        if (jsonMatch) {
          snippet = jsonMatch[0];
        } else {
          status = "No json";
          snippet = content;
        }
        console.log(
          `| ${model} | ${i + 1}/3 | ${duration}ms | ${status} | ${snippet} |`,
        );
      } catch (error) {
        status = "Error";
        const duration = Date.now() - start;
        console.log(
          `| ${model} | ${i + 1}/3 | ${duration}ms | Error | ${error.message} |`,
        );
      }
      await sleep(1000);
    }
    console.log("|---|---|---|---|---|");
    await sleep(1000);
  }
};
runBenchmark();
