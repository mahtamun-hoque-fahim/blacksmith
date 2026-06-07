import { GoogleGenerativeAI } from '@google/generative-ai'

let _client: GoogleGenerativeAI | null = null

export function getGemini() {
  if (_client) return _client
  _client = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
  return _client
}

export function getGenerationModel() {
  return getGemini().getGenerativeModel({ model: 'gemini-2.0-flash' })
}
