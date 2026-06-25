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

const PLACES_TYPES = {
  outdoor: ['park', 'playground', 'campground', 'beach', 'botanical_garden'],
  indoor:  ['library', 'community_center', 'museum', 'aquarium', 'shopping_mall', 'bowling_alley'],
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
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
      .then(data => (data.places || []).slice(0, 10).map(p => ({
        name: p.displayName?.text ?? p.displayName,
        address: p.formattedAddress,
        website: p.websiteUri || null,
      })))
      .catch(() => []),

    fetchWeatherAlert(lat, lng),
  ])

  res.json({ venues, weatherAlert })
}
