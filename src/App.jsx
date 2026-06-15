import OnboardingScreen from './OnboardingScreen'
import MainScreen from './MainScreen'

function App() {
  return (
    <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
      <OnboardingScreen />
      <MainScreen />
    </div>
  )
}

export default App
