import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground.jsx';
import { ajouterJoueur, demarrerPartie } from '../services/api.js';
import './Home.css';

export default function Home() {
    const navigate = useNavigate();
    const [mode, setMode] = useState(null);

    //reseau
    const [pseudo, setPseudo] = useState('');

    //local
    const [pseudo1, setPseudo1] = useState('');
    const [pseudo2, setPseudo2] = useState('');

    const [erreur, setErreur] = useState('');
    const [chargement, setChargement] = useState(false);

    const handleRejoindre = async () => {
        if (!pseudo.trim()) { setErreur('Entre un pseudo pour continuer'); return; }
        setErreur('');
        setChargement(true);
        try {
            const res = await ajouterJoueur(pseudo.trim());
            localStorage.setItem('playerId', res.data.joueur.id);
            localStorage.setItem('pseudo', pseudo.trim());
            navigate(`/lobby?pseudo=${pseudo.trim()}`);
        } catch (err) {
            setErreur(err.response?.data?.message || 'Erreur de connexion au serveur.');
        } finally {
            setChargement(false);
        }
    };

    const handleLocalJouer = async () => {
        if (!pseudo1.trim() || !pseudo2.trim()) { setErreur('Entre les deux pseudos'); return; }
        if (pseudo1.trim() === pseudo2.trim()) { setErreur('Les pseudos doivent être différents'); return; }
        setErreur('');
        setChargement(true);
        try {
            const res1 = await ajouterJoueur(pseudo1.trim());
            const res2 = await ajouterJoueur(pseudo2.trim());
            localStorage.setItem('player1Id', res1.data.joueur.id);
            localStorage.setItem('player1Pseudo', pseudo1.trim());
            localStorage.setItem('player2Id', res2.data.joueur.id);
            localStorage.setItem('player2Pseudo', pseudo2.trim());
            await demarrerPartie();
            navigate('/game-local');
        } catch (err) {
            setErreur(err.response?.data?.message || 'Erreur de connexion au serveur');
        } finally {
            setChargement(false);
        }
    };

    const retour = () => { setMode(null); setErreur(''); };

    if (mode === 'local') {
        return (
            <div className="home-page">
                <AnimatedBackground />
                <h1 className="home-titre">Boursicotage</h1>
                <p className="home-sous-titre">Mode local — 2 joueurs sur le même écran</p>
                <div className="home-carte">
                    <input
                        className="home-champ"
                        type="text"
                        placeholder="Pseudo Joueur 1..."
                        value={pseudo1}
                        onChange={(e) => setPseudo1(e.target.value)}
                        disabled={chargement}
                    />
                    <input
                        className="home-champ"
                        type="text"
                        placeholder="Pseudo Joueur 2..."
                        value={pseudo2}
                        onChange={(e) => setPseudo2(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLocalJouer()}
                        disabled={chargement}
                    />
                    {erreur && <p className="home-erreur">{erreur}</p>}
                    <button className="home-bouton" onClick={handleLocalJouer} disabled={chargement}>
                        {chargement ? 'Démarrage...' : 'Jouer'}
                    </button>
                    <button className="home-retour" onClick={retour}>← Retour</button>
                </div>
            </div>
        );
    }

    if (mode === 'reseau') {
        return (
            <div className="home-page">
                <AnimatedBackground />
                <h1 className="home-titre">Boursicotage</h1>
                <p className="home-sous-titre">Entre ton pseudo pour rejoindre la partie</p>
                <div className="home-carte">
                    <input
                        className="home-champ"
                        type="text"
                        placeholder="Ton pseudo..."
                        value={pseudo}
                        onChange={(e) => setPseudo(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRejoindre()}
                        disabled={chargement}
                    />
                    {erreur && <p className="home-erreur">{erreur}</p>}
                    <button className="home-bouton" onClick={handleRejoindre} disabled={chargement}>
                        {chargement ? 'Connexion...' : 'Rejoindre'}
                    </button>
                    <button className="home-retour" onClick={retour}>← Retour</button>
                </div>
            </div>
        );
    }

    return (
        <div className="home-page">
            <AnimatedBackground />
            <h1 className="home-titre">Boursicotage</h1>
            <p className="home-sous-titre">Choisis ton mode de jeu</p>
            <div className="home-mode-selection">
                <button className="home-mode-bouton home-mode-local" onClick={() => setMode('local')}>
                    <span className="mode-icon">🖥️</span>
                    <span className="mode-label">Mode Local</span>
                    <span className="mode-desc">2 joueurs, meme ecran</span>
                </button>
                <button className="home-mode-bouton home-mode-reseau" onClick={() => setMode('reseau')}>
                    <span className="mode-icon">🌐</span>
                    <span className="mode-label">Mode Reseau</span>
                    <span className="mode-desc">Rejoindre via internet</span>
                </button>
            </div>
        </div>
    );
}
