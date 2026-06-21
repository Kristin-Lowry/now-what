import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { geocodeText } from './utils/geocode'

const PRESS_TRANSITION = { type: 'tween', duration: 0.08 }
const PRESS_TAP = { x: 4, y: 4, boxShadow: '0px 0px 0px 0px #000000' }

function ToggleButton({ label, selected, onClick }) {
  return (
    <motion.div
      className="flex items-center justify-center"
      style={{
        width: 164,
        height: 68,
        backgroundColor: selected ? '#8C9DFF' : '#FFFFFF',
        border: '2px solid #000000',
        borderRadius: 99,
        cursor: 'pointer',
      }}
      animate={{
        x: selected ? 4 : 0,
        y: selected ? 4 : 0,
        boxShadow: selected ? '0px 0px 0px 0px #000000' : '4px 4px 0px 0px #000000',
      }}
      transition={PRESS_TRANSITION}
      onClick={onClick}
    >
      <span style={{ fontFamily: "'Public Sans', sans-serif", fontWeight: selected ? 700 : 400, fontSize: 20, color: selected ? '#FFFFFF' : '#000000' }}>
        {label}
      </span>
    </motion.div>
  )
}

const AGE_OPTIONS = [
  '0-3 months',
  '3-6 months',
  '6-9 months',
  '9-12 months',
  '1-3 years',
  '3-6 years',
  '6-9 years',
  '9-10 years',
]


export default function OnboardingScreen({ onNext }) {
  const [preference, setPreference] = useState('outdoor')
  const [selectedAge, setSelectedAge] = useState(null)
  const [ageOpen, setAgeOpen] = useState(false)
  const [location, setLocation] = useState('')
  const [geoCoords, setGeoCoords] = useState(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [locationError, setLocationError] = useState(false)
  const [ageError, setAgeError] = useState(false)

  // Eagerly geocode typed locations so coords are ready before Let's Go is tapped
  useEffect(() => {
    if (!location.trim()) return
    const timer = setTimeout(async () => {
      try {
        const coords = await geocodeText(location.trim())
        if (coords) setGeoCoords(coords)
      } catch {}
    }, 600)
    return () => clearTimeout(timer)
  }, [location])

  const handleGeolocate = () => {
    if (!navigator.geolocation) return
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
          )
          const data = await res.json()
          const results = data.results ?? []
          const localityResult = results.find(r => r.types.includes('locality')) ?? results[0]
          const components = localityResult?.address_components ?? []
          const city = components.find(c => c.types.includes('locality'))?.long_name || ''
          const state = components.find(c => c.types.includes('administrative_area_level_1'))?.short_name || ''
          if (city && state) {
            setLocation(`${city}, ${state}`)
            setGeoCoords({ lat: latitude, lng: longitude })
          }
        } catch {
          // fail silently — user can type manually
        } finally {
          setGeoLoading(false)
        }
      },
      () => setGeoLoading(false)
    )
  }

  const handleNext = async () => {
    let hasError = false
    if (!selectedAge) { setAgeError(true); hasError = true }
    if (!location.trim()) { setLocationError(true); hasError = true }
    if (hasError) return
    setAgeError(false)
    setLocationError(false)
    let coords = geoCoords
    if (!coords && location.trim()) {
      try { coords = await geocodeText(location.trim()) } catch {}
    }
    let venues = [], events = [], weatherAlert = null
    if (coords) {
      try {
        const r = await fetch(`/api/places?lat=${coords.lat}&lng=${coords.lng}&preference=${preference}`)
        const data = await r.json()
        venues = data.venues || []
        events = data.events || []
        weatherAlert = data.weatherAlert || null
      } catch {}
    }

    localStorage.setItem('now-what:prefs', JSON.stringify({ selectedAge, location, preference, coords }))
    onNext({ coords, location, preference, selectedAge, venues, events, weatherAlert })
  }

  return (
    <div
      className="relative overflow-hidden onboarding-screen"
      style={{ width: 390, height: 844, backgroundColor: '#FFEE8C', flexShrink: 0 }}
    >
      {/* Headline */}
      <div className="absolute onboarding-headline" style={{ left: 24, top: 113, width: 346 }}>
        <p style={{ fontFamily: "'Public Sans', sans-serif", fontWeight: 900, fontSize: 32, lineHeight: '36px', color: '#000000', margin: 0, textAlign: 'center' }}>
          No plans? Perfect.{'\n'}We&rsquo;ve got one for you.
        </p>
      </div>

      {/* Form block — translated as one unit on mobile */}
      <div className="onboarding-form-block" style={{ position: 'absolute', inset: 0 }}>

        {/* Indoor / Outdoor toggle */}
        <div className="absolute flex onboarding-toggle" style={{ left: 23, top: 321, height: 68, gap: 26 }}>
          <ToggleButton label="Outdoor" selected={preference === 'outdoor'} onClick={() => setPreference('outdoor')} />
          <ToggleButton label="Indoor" selected={preference === 'indoor'} onClick={() => setPreference('indoor')} />
        </div>

        {/* Child's age dropdown */}
        <div
          className="absolute flex items-center justify-between"
          style={{ left: 24, top: 429, width: 346, height: 63, backgroundColor: '#FFFFFF', border: ageError ? '1.74px solid #FF4444' : '1.74px solid #000000', borderRadius: 87, boxShadow: '1.74px 3.48px 0px 0px rgba(0,0,0,1)', paddingLeft: 24, paddingRight: 20, cursor: 'pointer', boxSizing: 'border-box', zIndex: ageOpen ? 20 : 1 }}
          onClick={() => setAgeOpen(o => !o)}
        >
          <span style={{ fontFamily: "'Public Sans', sans-serif", fontWeight: 400, fontStyle: 'normal', fontSize: 20, color: selectedAge ? '#000000' : '#878787' }}>
            {selectedAge || "Child's age"}
          </span>
          <svg width="25" height="16" viewBox="0 0 25 16" fill="none" style={{ transform: ageOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
            <path d="M2 2L12.5 13L23 2" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Age validation message */}
        {ageError && (
          <p className="absolute" style={{ left: 32, top: 496, margin: 0, fontFamily: "'Public Sans', sans-serif", fontSize: 11, color: '#FF4444' }}>
            Please select your child's age
          </p>
        )}

        {/* Age options list */}
        {ageOpen && (
          <div className="absolute age-dropdown" style={{ left: 24, top: 500, width: 346, height: 200, backgroundColor: '#FFFFFF', border: '1.74px solid #000000', borderRadius: 24, boxShadow: '0px 8px 24px rgba(0,0,0,0.10), 1.74px 3.48px 0px 0px rgba(0,0,0,1)', overflowY: 'auto', zIndex: 20 }}>
            {AGE_OPTIONS.map((age) => (
              <div
                key={age}
                style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 14, paddingBottom: 14, cursor: 'pointer', borderBottom: age === AGE_OPTIONS[AGE_OPTIONS.length - 1] ? 'none' : '1px solid #E8E8E8', backgroundColor: selectedAge === age ? '#F0F2FF' : '#FFFFFF' }}
                onClick={() => { setSelectedAge(age); setAgeOpen(false); setAgeError(false) }}
              >
                <span style={{ fontFamily: "'Public Sans', sans-serif", fontWeight: selectedAge === age ? 700 : 400, fontSize: 18, color: '#000000' }}>
                  {age}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Location input */}
        <div
          className="absolute flex items-center"
          style={{ left: 23, top: 532, width: 347, height: 64, backgroundColor: '#FFFFFF', border: locationError ? '2px solid #FF4444' : '2px solid #000000', borderRadius: 99, boxShadow: '2px 4px 0px 0px rgba(0,0,0,1)', paddingLeft: 24, paddingRight: 20, boxSizing: 'border-box', gap: 8 }}
        >
          <input
            className="location-input"
            type="text"
            value={location}
            onChange={e => { setLocation(e.target.value); setGeoCoords(null); setLocationError(false) }}
            placeholder="City, State or Zip"
            style={{ fontFamily: "'Public Sans', sans-serif", fontWeight: 400, fontSize: 20, color: '#000000', border: 'none', outline: 'none', background: 'transparent', flex: 1, minWidth: 0, cursor: 'text' }}
          />
          <div onClick={handleGeolocate} style={{ cursor: 'pointer', flexShrink: 0, opacity: geoLoading ? 0.4 : 1, transition: 'opacity 0.15s' }}>
            <svg width="28" height="32" viewBox="0 0 24 28" fill="none">
              <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 16 8 16s8-10.75 8-16c0-4.42-3.58-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z" fill="#000000" />
            </svg>
          </div>
        </div>

        {/* Let's Go button */}
        <motion.div
          className="absolute flex items-center justify-center"
          style={{ left: 23, top: 636, width: 344, height: 70, backgroundColor: '#8C9DFF', border: '1.89px solid #000000', borderRadius: 95, boxShadow: '4px 4px 0px 0px #000000', cursor: 'pointer' }}
          whileTap={PRESS_TAP}
          transition={PRESS_TRANSITION}
          onClick={handleNext}
        >
          <span style={{ fontFamily: "'Public Sans', sans-serif", fontWeight: 900, fontSize: 23, color: '#FFFFFF' }}>
            Let&rsquo;s Go
          </span>
        </motion.div>

        {/* Disclaimer */}
        <div className="absolute text-center onboarding-disclaimer" style={{ left: 20, top: 794, width: 350 }}>
          <p style={{ fontFamily: "'Public Sans', sans-serif", fontWeight: 400, fontStyle: 'normal', fontSize: 10, lineHeight: '16px', color: '#848484', margin: 0 }}>
            AI suggestions may not always be accurate. Always supervise your child.
          </p>
        </div>

      </div>
    </div>
  )
}
