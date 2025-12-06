Incaltaminte la Moda - Robot for Render
======================================

This project is a Node.js server (Express) that provides:
- /api/ask       -> chat endpoint for site users
- /api/descriere -> generate product descriptions
- /api/seo       -> SEO audit summary
- periodic cron job that runs every 12 hours

IMPORTANT:
- Do NOT put your OpenAI API key in the code or in Git.
- Set OPENAI_API_KEY in Render -> Environment -> Environment Variables.

Deploy on Render:
1. Go to Render -> New -> Web Service
2. Connect your GitHub repo or use Manual Deploy by uploading this ZIP
3. Build Command: npm install
4. Start Command: npm start
5. Set environment variable OPENAI_API_KEY in Render

Test endpoints:
- GET / -> health check
- POST /api/ask with JSON { "question": "..." }
- POST /api/descriere with JSON { "nume": "...", "pret": "...", "materiale": "...", "culoare": "..." }
- GET /api/seo

