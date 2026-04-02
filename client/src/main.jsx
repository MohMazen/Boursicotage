import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Lobby from './pages/Lobby.jsx';
import Game from './pages/Game.jsx';
import GameLocal from './pages/GameLocal.jsx';
import LocalMultiplayer from './pages/LocalMultiplayer.jsx';
import Classement from './pages/Classement.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/game" element={<Game />} />
        <Route path="/game-local" element={<GameLocal />} />
        <Route path="/local" element={<LocalMultiplayer />} />
        <Route path="/classement" element={<Classement />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
