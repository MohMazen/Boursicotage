import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import AnimatedBackground from '../components/AnimatedBackground.jsx';
import { setServerIP } from '../services/api.js';
import { reconnectSocket } from '../services/socket.js';
import './Home.css';

export default function Home() {
    const navigate = useNavigate();
    const [pseudo, setPseudo] = useState('');
    const [erreur, setErreur] = useState('');
    const [mode, setMode] = useState(null); // null | 'hote' | 'rejoindre'
    const [ipSaisie, setIpSaisie] = useState(localStorage.getItem('boursicotage_last_ip') || '');
    const [serverIP, setLocalServerIP] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();

    // ── Détection auto de l'IP hôte via URL ──────────────────────────────────
    useEffect(() => {
        const hostParam = searchParams.get('host');
        if (hostParam) {
            setMode('rejoindre');
            setIpSaisie(hostParam);
        }
    }, [searchParams]);

    // Récupérer l'IP du serveur local si on est l'hôte
    useEffect(() => {
        if (mode === 'hote') {
            fetch('/api/server-info')
                .then(r => r.json())
                .then(data => setLocalServerIP(data.ip))
                .catch(() => setLocalServerIP('localhost'));
        }
    }, [mode]);

    const handleRejoindre = async () => {
        if (!pseudo.trim()) {
            setErreur('Entre un pseudo pour continuer.');
            return;
        }

        setLoading(true);
        setErreur('');

        try {
            if (mode === 'rejoindre' && ipSaisie.trim()) {
                setServerIP(ipSaisie.trim());
                localStorage.setItem('boursicotage_last_ip', ipSaisie.trim());
            } else {
                setServerIP('localhost');
            }

            // Reconnecter le socket avec la bonne IP
            reconnectSocket();

            navigate(`/lobby?pseudo=${pseudo.trim()}`);
        } catch (err) {
            setErreur('Impossible de se connecter au serveur.');
            setLoading(false);
        }
    };

    const currentPort = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
    const gameURL = mode === 'hote' && serverIP
        ? `${window.location.protocol}//${serverIP}:${currentPort}?host=${serverIP}`
        : '';

    return (
        <div className="home-page">
            <AnimatedBackground />
            <h1 className="home-titre">📈 Boursicotage</h1>
            <p className="home-sous-titre">Simulation boursière en temps réel</p>

            {/* ── Sélection du mode ── */}
            {!mode && (
                <div className="home-carte home-mode-selection">
                    <button className="home-mode-bouton home-mode-hote" onClick={() => setMode('hote')}>
                        <span className="mode-icon">🏠</span>
                        <span className="mode-label">Je suis l'hôte</span>
                        <span className="mode-desc">Héberger la partie sur ce PC</span>
                    </button>
                    <button className="home-mode-bouton home-mode-rejoindre" onClick={() => setMode('rejoindre')}>
                        <span className="mode-icon">🔗</span>
                        <span className="mode-label">Je rejoins une partie</span>
                        <span className="mode-desc">Se connecter à un autre joueur</span>
                    </button>
                    <button className="home-mode-bouton home-mode-local" onClick={() => navigate('/local')}>
                        <span className="mode-icon">🎮</span>
                        <span className="mode-label">Duel Local (1 Écran)</span>
                        <span className="mode-desc">Jouer à deux sur ce clavier</span>
                    </button>
                </div>
            )}

            {/* ── Formulaire de connexion ── */}
            {mode && (
                <div className="home-carte">
                    <button className="home-retour" onClick={() => setMode(null)}>← Retour</button>

                    {mode === 'hote' && serverIP && (
                        <div className="home-ip-info">
                            <p className="home-ip-label">Partage cette adresse aux autres joueurs :</p>
                            <p className="home-ip-value">{gameURL}</p>
                            <div className="home-qr">
                                <QRCodeSVG
                                    value={gameURL}
                                    size={140}
                                    bgColor="transparent"
                                    fgColor="#00ff88"
                                    level="M"
                                />
                            </div>
                        </div>
                    )}

                    {mode === 'rejoindre' && (
                        <div className="home-ip-input-wrapper">
                            <label className="home-ip-label">Adresse IP de l'hôte :</label>
                            <input
                                className="home-champ"
                                type="text"
                                placeholder="ex: 192.168.1.42"
                                value={ipSaisie}
                                onChange={(e) => setIpSaisie(e.target.value)}
                            />
                        </div>
                    )}

                    <input
                        className="home-champ"
                        type="text"
                        placeholder="Ton pseudo..."
                        value={pseudo}
                        onChange={(e) => setPseudo(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRejoindre()}
                    />

                    {erreur && <p className="home-erreur">{erreur}</p>}

                    <button
                        className="home-bouton"
                        onClick={handleRejoindre}
                        disabled={loading}
                    >
                        {loading ? 'Connexion...' : 'Rejoindre'}
                    </button>
                </div>
            )}
        </div>
    );
}
