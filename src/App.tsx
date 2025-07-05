import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Projects from './components/Projects'
import OrbitalCalendarPage from './components/OrbitalCalendar'
import Routine from './components/Routine'
import CurrentTask from './components/CurrentTask'

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main">
          <Routes>
            <Route path="/" element={
              <>
                <CurrentTask />
                <Projects />
              </>
            } />
            <Route path="/projects/orbital-calendar" element={<OrbitalCalendarPage />} />
            <Route path="/lifestyle/routine" element={<Routine />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App 