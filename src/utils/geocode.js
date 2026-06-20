export async function geocodeText(text) {
  if (!text?.trim()) return null
  const zipMatch = text.trim().match(/^\d{5}$/)
  if (zipMatch) {
    const res = await fetch(`https://api.zippopotam.us/us/${text.trim()}`)
    if (res.ok) {
      const data = await res.json()
      return { lat: parseFloat(data.places[0].latitude), lng: parseFloat(data.places[0].longitude) }
    }
    return null
  }
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(text)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
  )
  const data = await res.json()
  const loc = data.results?.[0]?.geometry?.location
  return loc ? { lat: loc.lat, lng: loc.lng } : null
}
