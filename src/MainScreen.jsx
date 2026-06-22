import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Sun, CloudSun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, MapPin } from 'lucide-react'

const WEATHER_MAP = [
  { max: 0,  Icon: Sun,            label: 'Sunny' },
  { max: 1,  Icon: Sun,            label: 'Clear' },
  { max: 2,  Icon: CloudSun,       label: 'Partly Cloudy' },
  { max: 3,  Icon: Cloud,          label: 'Cloudy' },
  { max: 48, Icon: Cloud,          label: 'Foggy' },
  { max: 55, Icon: CloudRain,      label: 'Drizzle' },
  { max: 67, Icon: CloudRain,      label: 'Rainy' },
  { max: 77, Icon: CloudSnow,      label: 'Snowy' },
  { max: 82, Icon: CloudRain,      label: 'Showers' },
  { max: 86, Icon: CloudSnow,      label: 'Snow Showers' },
  { max: 99, Icon: CloudLightning, label: 'Stormy' },
]

function getWeatherInfo(code, windspeed) {
  if (windspeed > 35) return { Icon: Wind, label: 'Windy' }
  const entry = WEATHER_MAP.find(e => code <= e.max)
  return entry ?? { Icon: Cloud, label: 'Cloudy' }
}

const PRESS_TRANSITION = { type: 'tween', duration: 0.08 }
const PRESS_TAP = { x: 4, y: 4, boxShadow: '0px 0px 0px 0px #000000' }

function ToggleButton({ label, selected, onClick }) {
  return (
    <motion.div
      style={{
        width: 164,
        height: 68,
        backgroundColor: selected ? '#8C9DFF' : '#FFFFFF',
        border: '2px solid #000000',
        borderRadius: 99,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
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

function ThumbsUpIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12a2 2 0 0 1 2-2h3v12H4a2 2 0 0 1-2-2z" fill="#8C9DFF" stroke="none" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" stroke="#000" strokeWidth="1.5" />
      <path d="M7 10v12" stroke="#000" strokeWidth="1.5" />
    </svg>
  )
}

function ThumbsDownIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 2h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3z" fill="#8C9DFF" stroke="none" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" stroke="#000" strokeWidth="1.5" />
      <path d="M17 14V2" stroke="#000" strokeWidth="1.5" />
    </svg>
  )
}

function ReactionButton({ type, selected, onClick }) {
  return (
    <motion.div
      style={{
        width: 52,
        height: 52,
        backgroundColor: '#FFFFFF',
        border: '1.45px solid #000000',
        borderRadius: 99,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      animate={{
        x: selected ? 4 : 0,
        y: selected ? 4 : 0,
        boxShadow: selected ? '0px 0px 0px 0px #000000' : '4px 4px 0px 0px #000000',
      }}
      transition={PRESS_TRANSITION}
      onClick={onClick}
    >
      {type === 'like' ? <ThumbsUpIcon /> : <ThumbsDownIcon />}
    </motion.div>
  )
}

export default function MainScreen({ onBack, coords, location, selectedAge, venues = [], events = [], weatherAlert = null, preference: initialPreference = 'outdoor' }) {
  const [preference, setPreference] = useState(initialPreference)
  const [reaction, setReaction] = useState(null)
  const [weather, setWeather] = useState(null)
  const [suggestion, setSuggestion] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [suggestionHistory, setSuggestionHistory] = useState([])

  useEffect(() => {
    console.log('[MainScreen] coords prop:', coords)
    if (!coords) return
    console.log('[MainScreen] fetching weather for', coords)
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current_weather=true&temperature_unit=fahrenheit`
    )
      .then(r => r.json())
      .then(data => {
        console.log('[MainScreen] weather data:', data)
        const { temperature, weathercode, windspeed } = data.current_weather
        setWeather({ temp: Math.round(temperature), ...getWeatherInfo(weathercode, windspeed) })
      })
      .catch((err) => { console.log('[MainScreen] weather fetch error:', err) })
  }, [coords])

  const fetchSuggestion = async () => {
    if (isLoading) return
    setIsLoading(true)
    setIsError(false)
    try {
      const weatherStr = weather ? `${weather.temp}° F, ${weather.label}` : null
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ age: selectedAge, weather: weatherStr, location, preference, venues, events, weatherAlert, previousSuggestions: suggestionHistory }),
      })
      if (!res.ok) throw new Error('API error')
      const { suggestion: text } = await res.json()
      setSuggestion(text)
      setSuggestionHistory(prev => [...prev, text])
      setReaction(null)
    } catch {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="main-screen" style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#FFEE8C',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxSizing: 'border-box',
      position: 'relative',
    }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '20px 18px 0', flexShrink: 0, position: 'relative', zIndex: 10 }}>
        <div
          style={{ width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          onClick={onBack}
        >
          <ArrowLeft size={28} strokeWidth={2} />
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', marginLeft: 'auto',
          backgroundColor: '#FFFFFF', border: '1.53px solid #000000', borderRadius: 77,
          boxShadow: '1px 2px 0px 0px rgba(0,0,0,1)', padding: '7.73px', gap: 6, flexShrink: 0,
        }}>
          {weather ? (
            <>
              <weather.Icon size={24} strokeWidth={1.5} />
              <span style={{ fontFamily: "'Public Sans', sans-serif", fontWeight: 400, fontSize: 13.9, lineHeight: '18.55px', color: '#000000' }}>
                {weather.temp}° F
              </span>
            </>
          ) : (
            <>
              <Cloud size={24} strokeWidth={1.5} color="#969696" />
              <span style={{ fontFamily: "'Public Sans', sans-serif", fontWeight: 400, fontSize: 13.9, lineHeight: '18.55px', color: '#969696' }}>
                - -° F
              </span>
            </>
          )}
        </div>
      </div>

      {/* Indoor / Outdoor toggle */}
      <div style={{ display: 'flex', gap: 26, justifyContent: 'center', padding: '16px 18px 0', flexShrink: 0 }}>
        <ToggleButton label="Outdoor" selected={preference === 'outdoor'} onClick={() => setPreference('outdoor')} />
        <ToggleButton label="Indoor" selected={preference === 'indoor'} onClick={() => setPreference('indoor')} />
      </div>

      {/* Spacer — pushes text+reactions to vertical center (desktop) */}
      <div className="main-content-spacer" style={{ flex: 1 }} />

      {/* Suggestion text + reaction buttons — centered as a group */}
      <div className="main-content-group">
        {weatherAlert && (
          <div style={{ width: '100%', paddingLeft: 24, paddingRight: 24, boxSizing: 'border-box', flexShrink: 0 }}>
            <div style={{ width: '100%', boxSizing: 'border-box', padding: '8px 16px', backgroundColor: '#FFFFFF', border: '1.5px solid #000000', borderRadius: 12, boxShadow: '2px 2px 0px 0px #000000', textAlign: 'center' }}>
              <p style={{ fontFamily: "'Public Sans', sans-serif", fontSize: 20, fontWeight: 400, color: '#000000', margin: 0 }}>
                ⚠️ {weatherAlert} in your area — check conditions before heading out
              </p>
            </div>
          </div>
        )}
        <div className="suggestion-text" style={{ flexShrink: 0, overflow: 'hidden' }}>
          {isLoading ? (
            <motion.p
              className="suggestion-p"
              style={{ fontFamily: "'Public Sans', sans-serif", fontWeight: 300, color: '#000000', margin: 0 }}
              animate={{ opacity: [0.25, 0.6, 0.25] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              Finding something good...
            </motion.p>
          ) : isError ? (
            <p className="suggestion-p" style={{ fontFamily: "'Public Sans', sans-serif", fontWeight: 300, color: '#000000', margin: 0 }}>
              Something went wrong — tap Now What? to try again
            </p>
          ) : suggestion ? (
            <p className="suggestion-p" style={{ fontFamily: "'Public Sans', sans-serif", fontWeight: 300, color: '#000000', margin: 0 }}>
              {suggestion}
            </p>
          ) : (
            <p className="suggestion-p" style={{ fontFamily: "'Public Sans', sans-serif", fontWeight: 300, color: '#969696', margin: 0 }}>
              Tap Now What? to get your first suggestion
            </p>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 38, flexShrink: 0 }}>
          <ReactionButton type="like" selected={reaction === 'like'} onClick={() => setReaction(r => r === 'like' ? null : 'like')} />
          <ReactionButton type="dislike" selected={reaction === 'dislike'} onClick={() => setReaction(r => r === 'dislike' ? null : 'dislike')} />
        </div>
      </div>

      {/* Spacer — empty space between reactions and button (desktop) */}
      <div className="main-content-spacer" style={{ flex: 1 }} />

      {/* Now What button — matches Let's Go button on onboarding: width 344, same margins */}
      <div className="main-nowwhat-btn" style={{ display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
        <motion.div
          style={{
            width: 344,
            height: 70,
            backgroundColor: '#8C9DFF',
            border: '1.89px solid #000000',
            borderRadius: 95,
            boxShadow: '4px 4px 0px 0px #000000',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            touchAction: 'manipulation',
          }}
          whileTap={PRESS_TAP}
          transition={PRESS_TRANSITION}
          onClick={fetchSuggestion}
        >
          <span style={{ fontFamily: "'Public Sans', sans-serif", fontWeight: 900, fontSize: 23, color: '#FFFFFF' }}>
            Now What?
          </span>
        </motion.div>
      </div>

      {/* Disclaimer */}
      <div className="main-disclaimer" style={{ padding: '88px 17px 34px', textAlign: 'center', flexShrink: 0, pointerEvents: 'none' }}>
        <p style={{ fontFamily: "'Public Sans', sans-serif", fontWeight: 400, fontStyle: 'normal', fontSize: 10, lineHeight: '16px', color: '#848484', margin: 0 }}>
          AI suggestions may not always be accurate. Always supervise your child.
        </p>
      </div>
    </div>
  )
}
