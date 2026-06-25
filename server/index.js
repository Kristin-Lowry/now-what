import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') })

const app = express()
app.use(cors())
app.use(express.json())

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PLACES_TYPES = {
  outdoor: ['park', 'playground', 'campground', 'beach', 'botanical_garden'],
  indoor:  ['library', 'community_center', 'museum', 'aquarium', 'shopping_mall', 'bowling_alley'],
}

async function fetchWeatherAlert(lat, lng) {
  try {
    const r = await fetch(`https://api.weather.gov/alerts/active?point=${lat},${lng}`, {
      headers: { 'User-Agent': 'NowWhat/1.0 (hello@kristinlowry.com)' },
    })
    if (!r.ok) return null
    const data = await r.json()
    const active = (data.features || []).find(f =>
      f.properties?.status === 'Actual' &&
      (f.properties?.messageType === 'Alert' || f.properties?.messageType === 'Update')
    )
    return active ? active.properties.event : null
  } catch { return null }
}

app.get('/api/places', async (req, res) => {
  const { lat, lng, preference } = req.query
  if (!lat || !lng) return res.json({ venues: [], weatherAlert: null })

  const pref = preference === 'indoor' ? 'indoor' : 'outdoor'

  const [venues, weatherAlert] = await Promise.all([
    fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.websiteUri',
      },
      body: JSON.stringify({
        includedTypes: PLACES_TYPES[pref],
        maxResultCount: 10,
        locationRestriction: {
          circle: { center: { latitude: parseFloat(lat), longitude: parseFloat(lng) }, radius: 8000 },
        },
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) console.error('[server] places error:', data.error.message)
        return (data.places || []).slice(0, 10).map(p => ({
          name: p.displayName?.text ?? p.displayName,
          address: p.formattedAddress,
          website: p.websiteUri || null,
        }))
      })
      .catch(() => []),

    fetchWeatherAlert(lat, lng),
  ])

  console.log('[server] venues:', venues.length, '| alert:', weatherAlert || 'none')
  res.json({ venues, weatherAlert })
})

app.post('/api/suggest', async (req, res) => {
  const { age, weather, location, preference, venues = [], weatherAlert = null, previousSuggestions = [] } = req.body

  const __dir = dirname(fileURLToPath(import.meta.url))
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
    res.json({ suggestion: message.content[0].text })
  } catch (err) {
    console.error('[server] Claude error:', err)
    res.status(500).json({ error: 'Claude API call failed' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, '0.0.0.0', () => console.log(`[server] proxy running on http://0.0.0.0:${PORT}`))
