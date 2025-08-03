import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Projects from './components/Projects'
import OrbitalCalendarPage from './components/OrbitalCalendar'
import Routine from './components/Routine'
import Exercise from './components/Exercise'
import Diet from './components/Diet'
import CurrentTask from './components/CurrentTask'
import BeatsPlayer from './components/BeatsPlayer'
import TraditionalArt from './components/TraditionalArt'
import Lists from './components/Lists'
import MusicLists from './components/MusicLists'
import SportsLists from './components/SportsLists'
import FavoriteAlbums from './components/FavoriteAlbums'
import NBAPlayerRankings from './components/NBAPlayerRankings'
import SecretPage from './components/SecretPage'
import Prayer from './components/Prayer'
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
              <Route path="/lifestyle/exercise" element={<Exercise />} />
              <Route path="/lifestyle/diet" element={<Diet />} />
              <Route path="/creative/music/beats" element={<BeatsPlayer />} />
              <Route path="/creative/visual-art/traditional" element={<TraditionalArt />} />
              <Route path="/list" element={<Lists />} />
              <Route path="/lists/music" element={<MusicLists />} />
              <Route path="/lists/music/favorite-albums" element={<FavoriteAlbums />} />
              <Route path="/lists/sports" element={<SportsLists />} />
              <Route path="/lists/sports/nba-player-rankings" element={<NBAPlayerRankings />} />
              <Route path="/projects/phonetic-alphabet" element={<PhoneticAlphabetPage />} />
              <Route path="/content/personal-docs/prayer" element={<Prayer />} />
              <Route path="/najnimre" element={<SecretPage />} />
              <Route path="/najnimre/accounts" element={<SecretPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </PhoneticProvider>
  )
}

export default App 