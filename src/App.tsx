import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Sections from './components/Sections'
import Projects from './components/Projects'
import OrbitalCalendarPage from './components/OrbitalCalendar'

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main">
          <Routes>
            <Route path="/" element={
              <>
                <Sections />
                <Projects />
              </>
            } />
            <Route path="/projects/orbital-calendar" element={<OrbitalCalendarPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App 