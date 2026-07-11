const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

async function generateTasks(goal) {
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL })

  const prompt = `
You are a café shift planner. Given a goal, output a JSON array of 1-6 tasks.
Each task must be an object with exactly two fields:
  "title": a short actionable task (string)
  "suggestedRole": one of "barista", "waiter", "chef", "cleaner"

Rules:
- Output ONLY the raw JSON array. No markdown, no code fences, no explanation.
- Between 1 and 6 tasks.

Goal: "${goal}"
`.trim()

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  return text
}

module.exports = { generateTasks }