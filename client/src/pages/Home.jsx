import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground.jsx';
import './Home.css';

export default function Home() {
    const navigate = useNavigate();
    const [pseudo, setPseudo] = useState('');
    const [erreur, setErreur] = useState('');

    const handleRejoindre = () => {
        if (!pseudo.trim()) {
            setErreur('Entre un pseudo pour continuer.');
            return;
        }
        setErreur('');
        navigate(`/lobby?pseudo=${pseudo.trim()}`);
    };

    return (
        <div className="home-page">
            <AnimatedBackground />
            <h1 className="home-title">📈 Boursicotage</h1>
            <p className="home-subtitle">Entre ton pseudo pour rejoindre la partie</p>

            <div className="home-card">
                <input
                    className="home-input"
                    type="text"
                    placeholder="Ton pseudo..."
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRejoindre()}
                />

                {erreur && <p className="home-erreur">{erreur}</p>}

                <button className="home-button" onClick={handleRejoindre}>
                    Rejoindre
                </button>
            </div>
        </div>
    );
}
