import { useState, useEffect } from 'react'
import './App.css'
import Home from './pages/Home'
import Lobby from './pages/Lobby'
import Game from './pages/Game'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  useEffect(() => {
    // Simple router basé sur l'URL
    const path = window.location.pathname
    
    if (path === '/' || path === '/home') {
      setCurrentPage('home')
    } else if (path === '/lobby') {
      setCurrentPage('lobby')
    } else if (path === '/game') {
      setCurrentPage('game')
    }
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />
      case 'lobby':
        return <Lobby />
      case 'game':
        return <Game />
      default:
        return <Home />
    }
  }

  return (
    <div className="app">
      {renderPage()}
    </div>
  )
}

export default App
