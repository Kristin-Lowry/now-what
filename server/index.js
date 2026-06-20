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

function getWeekendRange() {
  const now = new Date()
  const day = now.getDay()
  let start, end
  if (day === 6) {
    start = new Date(now); end = new Date(now); end.setDate(now.getDate() + 1)
  } else if (day === 0) {
    start = new Date(now); end = new Date(now)
  } else {
    start = new Date(now); start.setDate(now.getDate() + (6 - day))
    end = new Date(start); end.setDate(start.getDate() + 1)
  }
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 0)
  return {
    start: start.toISOString().replace(/\.\d{3}Z$/, 'Z'),
    end: end.toISOString().replace(/\.\d{3}Z$/, 'Z'),
  }
}

function formatEventDate(dateStr, timeStr) {
  try {
    const [yr, mo, dy] = dateStr.split('-').map(Number)
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(yr, mo - 1, dy).getDay()]
    if (!timeStr) return dayName
    const [h, m] = timeStr.split(':').map(Number)
    const ampm = h >= 12 ? 'pm' : 'am'
    const hour = h % 12 || 12
    const min = m === 0 ? '' : `:${String(m).padStart(2, '0')}`
    return `${dayName} ${hour}${min}${ampm}`
  } catch { return dateStr }
}

app.get('/api/places', async (req, res) => {
  const { lat, lng, preference } = req.query
  if (!lat || !lng) return res.json({ venues: [], events: [] })

  const pref = preference === 'indoor' ? 'indoor' : 'outdoor'

  const [venues, events] = await Promise.all([
    // Google Places (New) Nearby Search
    fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.websiteUri',
      },
      body: JSON.stringify({
        includedTypes: PLACES_TYPES[pref],
        maxResultCount: 5,
        locationRestriction: {
          circle: { center: { latitude: parseFloat(lat), longitude: parseFloat(lng) }, radius: 8000 },
        },
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) console.error('[server] places error:', data.error.message)
        return (data.places || []).slice(0, 5).map(p => ({
          name: p.displayName?.text ?? p.displayName,
          address: p.formattedAddress,
          website: p.websiteUri || null,
        }))
      })
      .catch(() => []),

    // Ticketmaster family events this weekend
    (() => {
      const { start, end } = getWeekendRange()
      const url = new URL('https://app.ticketmaster.com/discovery/v2/events.json')
      url.searchParams.set('apikey', process.env.TICKETMASTER_API_KEY)
      url.searchParams.set('latlong', `${lat},${lng}`)
      url.searchParams.set('radius', '25')
      url.searchParams.set('unit', 'miles')
      url.searchParams.set('classificationName', 'family')
      url.searchParams.set('startDateTime', start)
      url.searchParams.set('endDateTime', end)
      url.searchParams.set('sort', 'date,asc')
      url.searchParams.set('size', '3')
      const tmUrl = url.toString()
      console.log('[server] ticketmaster URL:', tmUrl)
      return fetch(tmUrl)
        .then(async r => {
          const text = await r.text()
          console.log('[server] ticketmaster status:', r.status)
          console.log('[server] ticketmaster raw:', text.slice(0, 1000))
          return JSON.parse(text)
        })
        .then(data => {
          const evts = data._embedded?.events || []
          console.log('[server] ticketmaster events:', evts.length)
          return evts.slice(0, 3).map(e => {
            const venue = e._embedded?.venues?.[0]
            return {
              name: e.name,
              venue: venue?.name || null,
              address: [venue?.address?.line1, venue?.city?.name, venue?.state?.stateCode].filter(Boolean).join(', ') || null,
              time: formatEventDate(e.dates?.start?.localDate, e.dates?.start?.localTime),
              url: e.url,
            }
          })
        })
        .catch(() => [])
    })(),
  ])

  console.log('[server] venues:', venues.length, '| events:', events.length)
  res.json({ venues, events })
})

app.post('/api/suggest', async (req, res) => {
  const { age, weather, location, preference, venues = [], events = [], previousSuggestions = [] } = req.body

  const __dir = dirname(fileURLToPath(import.meta.url))
  const systemPrompt = readFileSync(join(__dir, '..', 'src', 'prompts', 'systemPrompt.txt'), 'utf8')
    .replace(/\[age\]/g, age ?? 'unknown')
    .replace(/\[preference\]/g, preference === 'indoor' ? 'INDOOR' : 'OUTDOOR')

  let nearbyContext
  if (events.length > 0) {
    nearbyContext = 'Nearby events this weekend:\n' + events.map(e =>
      `- ${e.name}${e.venue ? ` at ${e.venue}` : ''}${e.address ? `, ${e.address}` : ''} (${e.time})`
    ).join('\n')
  } else if (venues.length > 0) {
    nearbyContext = 'Nearby venues:\n' + venues.map(v => `- ${v.name} (${v.address})`).join('\n')
  } else {
    nearbyContext = 'Nearby venues: none found'
  }

  const userMessage = [
    `Child's age: ${age ?? 'unknown'}`,
    `Current weather: ${weather ?? 'unknown'}`,
    `Location: ${location ?? 'unknown'}`,
    `Parent's intention: ${preference === 'indoor' ? 'Indoor — staying in' : 'Outdoor — going out'}`,
    nearbyContext,
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
