import React from 'react'
import Header from './components/Header'
import Sections from './components/Sections'
import Projects from './components/Projects'

const App: React.FC = () => {
  return (
    <div className="App">
      <Header />
      <main className="main">
        <Sections />
        <Projects />
      </main>
    </div>
  )
}

export default App 