import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const __dir = dirname(fileURLToPath(import.meta.url))

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { age, weather, location, preference, venues = [], weatherAlert = null, previousSuggestions = [] } = req.body

  const systemPrompt = readFileSync(join(__dir, '..', 'src', 'prompts', 'systemPrompt.txt'), 'utf8')
    .replace(/\[age\]/g, age ?? 'unknown')
    .replace(/\[preference\]/g, preference === 'indoor' ? 'INDOOR' : 'OUTDOOR')

  const nearbyContext = venues.length > 0
    ? 'Nearby venues:\n' + venues.map(v => `- ${v.name} (${v.address})`).join('\n')
    : 'Nearby venues: none found'

  const userMessage = [
    `Child's age: ${age ?? 'unknown'}`,
    `Current weather: ${weather ?? 'unknown'}`,
    `Location: ${location ?? 'unknown'}`,
    `Parent's intention: ${preference === 'indoor' ? 'Indoor — staying in' : 'Outdoor — going out'}`,
    nearbyContext,
    weatherAlert ? `Active weather alert: ${weatherAlert}` : null,
    previousSuggestions.length
      ? `Already suggested this session (do not repeat):\n${previousSuggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
      : null,
  ].filter(Boolean).join('\n')

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })
    const raw = message.content[0].text
    const words = raw.trim().split(/\s+/)
    let suggestion = raw.trim()
    if (words.length > 30) {
      const sentences = raw.trim().match(/[^.!?]+[.!?]*/g) || [raw.trim()]
      suggestion = sentences[0].trim()
      if (sentences[1] && (suggestion + ' ' + sentences[1].trim()).split(/\s+/).length <= 30) {
        suggestion += ' ' + sentences[1].trim()
      }
      if (suggestion.split(/\s+/).length > 30) {
        suggestion = words.slice(0, 30).join(' ') + '…'
      }
    }
    res.json({ suggestion })
  } catch (err) {
    console.error('[api] Claude error:', err)
    res.status(500).json({ error: 'Claude API call failed' })
  }
}
