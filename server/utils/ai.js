const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const ALLOWED_ROLES = ['barista', 'waiter', 'chef', 'cleaner']

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
  return result.response.text()
}

// the eval guard: takes the raw model string, returns { valid, tasks, error }
function validateTasks(raw) {
  // 1. strip markdown fences if the model added them
  let cleaned = raw.trim()
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```$/, '').trim()

  // 2. must be parseable JSON
  let parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    return { valid: false, error: 'model did not return valid JSON' }
  }

  // 3. must be an array
  if (!Array.isArray(parsed))
    return { valid: false, error: 'output is not an array' }

  // 4. must have 1-6 tasks
  if (parsed.length < 1 || parsed.length > 6)
    return { valid: false, error: `expected 1-6 tasks, got ${parsed.length}` }

  // 5. every task must have a valid title + allowed role
  const tasks = []
  for (const t of parsed) {
    if (!t || typeof t.title !== 'string' || !t.title.trim())
      return { valid: false, error: 'a task is missing a valid title' }
    if (!ALLOWED_ROLES.includes(t.suggestedRole))
      return { valid: false, error: `invalid role: ${t.suggestedRole}` }

    tasks.push({ title: t.title.trim(), suggestedRole: t.suggestedRole })
  }

  return { valid: true, tasks }
}

module.exports = { generateTasks, validateTasks }