import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import OnboardingScreen from './OnboardingScreen'
import MainScreen from './MainScreen'
import { geocodeText } from './utils/geocode'

const SLIDE_UP = {
  initial: { y: '100vh' },
  animate: { y: 0 },
  exit:    { y: '100vh' },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
}

const FADE_IN = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
  transition: { duration: 0.3 },
}

export default function App() {
  const [showMain, setShowMain] = useState(false)
  const [prefs, setPrefs] = useState(null)
  const [isReturn, setIsReturn] = useState(false)

  useEffect(() => { (async () => {
    const raw = localStorage.getItem('now-what:prefs')
    console.log('[App] localStorage raw:', raw)
    if (!raw) return
    try {
      const saved = JSON.parse(raw)
      console.log('[App] saved prefs:', saved)
      if (!saved.location || !saved.selectedAge) {
        console.log('[App] incomplete prefs — showing onboarding')
        return
      }
      if (saved.coords) {
        console.log('[App] using saved coords:', saved.coords)
        let venues = [], events = [], weatherAlert = null
        try {
          const r = await fetch(`/api/places?lat=${saved.coords.lat}&lng=${saved.coords.lng}&preference=${saved.preference}`)
          const data = await r.json()
          venues = data.venues || []
          events = data.events || []
          weatherAlert = data.weatherAlert || null
        } catch {}
        setPrefs({ ...saved, venues, events, weatherAlert })
        setIsReturn(true)
        setShowMain(true)
      } else {
        // fallback for old localStorage entries that predate coords being saved
        geocodeText(saved.location)
          .then(coords => {
            console.log('[App] geocodeText result for', saved.location, '→', coords)
            setPrefs({ ...saved, coords })
            setIsReturn(true)
            setShowMain(true)
          })
          .catch((err) => {
            console.log('[App] geocodeText error:', err)
            setPrefs({ ...saved, coords: null })
            setIsReturn(true)
            setShowMain(true)
          })
      }
    } catch {}
  })() }, [])

  const handleNext = (incoming) => {
    setIsReturn(false)
    setPrefs(incoming)
    setShowMain(true)
  }

  const anim = isReturn ? FADE_IN : SLIDE_UP

  return (
    <div className="app-shell">
      <OnboardingScreen onNext={handleNext} />

      <AnimatePresence>
        {showMain && (
          <motion.div
            key="main"
            initial={anim.initial}
            animate={anim.animate}
            exit={anim.exit}
            transition={anim.transition}
            style={{ position: 'fixed', inset: 0, zIndex: 10 }}
          >
            <MainScreen
              onBack={() => setShowMain(false)}
              coords={prefs?.coords}
              location={prefs?.location}
              preference={prefs?.preference}
              selectedAge={prefs?.selectedAge}
              venues={prefs?.venues}
              events={prefs?.events}
              weatherAlert={prefs?.weatherAlert}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
