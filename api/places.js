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

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const { lat, lng, preference } = req.query
  if (!lat || !lng) return res.json({ venues: [], events: [] })

  const pref = preference === 'indoor' ? 'indoor' : 'outdoor'

  const [venues, events] = await Promise.all([
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
      .then(data => (data.places || []).slice(0, 5).map(p => ({
        name: p.displayName?.text ?? p.displayName,
        address: p.formattedAddress,
        website: p.websiteUri || null,
      })))
      .catch(() => []),

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
      return fetch(url.toString())
        .then(r => r.json())
        .then(data => (data._embedded?.events || []).slice(0, 3).map(e => {
          const venue = e._embedded?.venues?.[0]
          return {
            name: e.name,
            venue: venue?.name || null,
            address: [venue?.address?.line1, venue?.city?.name, venue?.state?.stateCode].filter(Boolean).join(', ') || null,
            time: formatEventDate(e.dates?.start?.localDate, e.dates?.start?.localTime),
            url: e.url,
          }
        }))
        .catch(() => [])
    })(),
  ])

  res.json({ venues, events })
}
