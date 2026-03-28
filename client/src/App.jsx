import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Lobby from './pages/Lobby.jsx';
import Game from './pages/Game.jsx';
import Classement from './pages/Classement.jsx';
import './App.css';

function App() {
    return (
        <Router>
            <div className="app-container">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/lobby" element={<Lobby />} />
                    <Route path="/game" element={<Game />} />
                    <Route path="/classement" element={<Classement />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
