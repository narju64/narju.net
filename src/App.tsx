import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Projects from './components/Projects'
import OrbitalCalendarPage from './components/OrbitalCalendar'
import Routine from './components/Routine'
import CurrentTask from './components/CurrentTask'
import BeatsPlayer from './components/BeatsPlayer'
import TraditionalArt from './components/TraditionalArt'
import Lists from './components/Lists'
import MusicLists from './components/MusicLists'
import FavoriteAlbums from './components/FavoriteAlbums'
import { PhoneticAlphabetPage } from './npa-translator/PhoneticAlphabetPage'
import { PhoneticProvider } from './npa-translator/context/PhoneticContext'

const App: React.FC = () => {
  return (
    <PhoneticProvider>
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
              <Route path="/creative/music/beats" element={<BeatsPlayer />} />
              <Route path="/creative/visual-art/traditional" element={<TraditionalArt />} />
              <Route path="/list" element={<Lists />} />
              <Route path="/lists/music" element={<MusicLists />} />
              <Route path="/lists/music/favorite-albums" element={<FavoriteAlbums />} />
              <Route path="/projects/phonetic-alphabet" element={<PhoneticAlphabetPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </PhoneticProvider>
  )
}

export default App 