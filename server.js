import express from "express";
import fetch from "node-fetch";
import cron from "node-cron";
import OpenAI from "openai";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// CONFIG - nu pune cheia aici, foloseste Render Environment Variables
// ===============================
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.warn("Warning: OPENAI_API_KEY not set in environment. Set it in Render.");
}
const SITE_URL = "https://www.incaltamintelamoda.ro";

// Initialize OpenAI client
const client = new OpenAI({ apiKey: OPENAI_API_KEY });

// Helper: call the model
async function ai(prompt) {
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });
  return completion.choices?.[0]?.message?.content || "";
}

// ===============================
// 1) API - user ask
// ===============================
app.post("/api/ask", async (req, res) => {
  try {
    const question = req.body.question || "";
    const answer = await ai(`Raspunde concis, in limba romana, ca robotul INCALTAMINTE LA MODA. Intrebare: ${question}`);
    res.json({ answer });
  } catch (e) {
    console.error("Error /api/ask:", e);
    res.status(500).json({ answer: "Eroare server." });
  }
});

// ===============================
// 2) API - generate product description
// ===============================
app.post("/api/descriere", async (req, res) => {
  try {
    const { nume = "", pret = "", materiale = "", culoare = "" } = req.body;
    const prompt = `
Creeaza o descriere SEO profesionala pentru produs:
Nume: ${nume}
Pret: ${pret}
Materiale: ${materiale}
Culoare: ${culoare}

Include:
- 5 beneficii
- 5 keyword-uri SEO
- structura HTML usoara (<p>, <ul>, <li>, <h2>)
Raspunde in limba romana.
`;
    const descriere = await ai(prompt);
    res.json({ descriere });
  } catch (e) {
    console.error("Error /api/descriere:", e);
    res.status(500).json({ descriere: "Nu am putut genera descrierea." });
  }
});

// ===============================
// 3) API - SEO audit
// ===============================
app.get("/api/seo", async (req, res) => {
  try {
    const prompt = `
Analizeaza site-ul ${SITE_URL} si ofera un raport SEO sumar:
- punctaj 1-100
- top 5 probleme
- top 5 recomandari practice
Raspunde in limba romana, formatat clar.
`;
    const raport = await ai(prompt);
    res.json({ raport });
  } catch (e) {
    console.error("Error /api/seo:", e);
    res.status(500).json({ raport: "Eroare analiza SEO." });
  }
});

// ===============================
// 4) CRON - periodic site scan
// ===============================
// exemplu: la fiecare 12 ore
cron.schedule("0 */12 * * *", async () => {
  console.log("Cron: scanare site pornita...");
  try {
    const prompt = `
Scaneaza site-ul ${SITE_URL} (sumar) si genereaza:
- lista de posibile pagini/produs
- probleme SEO majore
- recomandari prioritare
Raspunde in limba romana, formatat compact.
`;
    const raport = await ai(prompt);
    console.log("Raport cron:", raport.slice(0, 1000));
    // optional: aici poti salva raportul intr-un storage sau trimite email
  } catch (e) {
    console.error("Eroare cron:", e);
  }
});

// Health check
app.get("/", (req, res) => res.send("Incaltaminte Robot - online"));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Robotul ruleaza pe portul ${PORT}`));
