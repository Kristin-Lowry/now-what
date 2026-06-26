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

const PLACE_TYPES = {
  outdoor: ['park', 'playground', 'campground', 'botanical_garden', 'stadium'],
  indoor:  ['library', 'community_center', 'museum', 'aquarium', 'bowling_alley', 'movie_theater', 'shopping_mall', 'art_gallery'],
}

const KEYWORD_SEARCHES = {
  outdoor: ["farmer's market", 'nature trail', 'splash pad', 'dog park'],
  indoor:  ['indoor playground', 'indoor pool', "children's museum", 'science center'],
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const { lat, lng, preference } = req.query
  if (!lat || !lng) return res.json({ venues: [], weatherAlert: null })

  const pref = preference === 'indoor' ? 'indoor' : 'outdoor'
  const center = { latitude: parseFloat(lat), longitude: parseFloat(lng) }
  const radius = 24140 // 15 miles

  const headers = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
    'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.websiteUri',
  }
  const mapPlace = p => ({
    name: p.displayName?.text ?? p.displayName,
    address: p.formattedAddress,
    website: p.websiteUri || null,
  })

  const [typeResults, keywordResults, weatherAlert] = await Promise.all([
    Promise.all(
      PLACE_TYPES[pref].map(type =>
        fetch('https://places.googleapis.com/v1/places:searchNearby', {
          method: 'POST', headers,
          body: JSON.stringify({
            includedTypes: [type],
            maxResultCount: 2,
            locationRestriction: { circle: { center, radius } },
          }),
        })
          .then(r => r.json())
          .then(data => (data.places || []).map(mapPlace))
          .catch(() => [])
      )
    ),
    Promise.all(
      KEYWORD_SEARCHES[pref].map(keyword =>
        fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST', headers,
          body: JSON.stringify({
            textQuery: keyword,
            maxResultCount: 2,
            locationRestriction: { circle: { center, radius } },
          }),
        })
          .then(r => r.json())
          .then(data => (data.places || []).map(mapPlace))
          .catch(() => [])
      )
    ),
    fetchWeatherAlert(lat, lng),
  ])

  const seen = new Set()
  const venues = [...typeResults.flat(), ...keywordResults.flat()]
    .filter(v => {
      if (seen.has(v.name)) return false
      seen.add(v.name)
      return true
    })
    .slice(0, 10)

  res.json({ venues, weatherAlert })
}
