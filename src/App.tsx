
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import { HealthAssistant } from './pages/HealthAssistant'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/health" element={<HealthAssistant />} />
      </Routes>
    </Router>
  )
}

export default App
