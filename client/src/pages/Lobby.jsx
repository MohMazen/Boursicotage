import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import AnimatedBackground from '../components/AnimatedBackground.jsx';
import { ajouterJoueur, demarrerPartie, getServerInfo } from '../services/api.js';
import { getSocket } from '../services/socket.js';
import './Lobby.css';

export default function Lobby() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const pseudo = searchParams.get('pseudo') || 'Inconnu';

    const [joueurs, setJoueurs] = useState([]);
    const [playerId, setPlayerId] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [erreur, setErreur] = useState('');
    const [serverIP, setServerIP] = useState('');
    const [isHote, setIsHote] = useState(false);

    // ── Inscription du joueur au montage ──────────────────────────────────
    useEffect(() => {
        const inscrire = async () => {
            try {
                const res = await ajouterJoueur(pseudo);
                setPlayerId(res.data.joueur.id);
                // Premier joueur inscrit = hôte probable
                if (res.data.joueur.id === 1001) setIsHote(true);
            } catch (err) {
                setErreur(err.response?.data?.message || 'Erreur lors de l\'inscription');
            }
        };
        inscrire();
    }, [pseudo]);

    // ── Récupérer l'IP du serveur ────────────────────────────────────────
    useEffect(() => {
        getServerInfo()
            .then(res => {
                setServerIP(res.data.ip);
                setJoueurs(res.data.players || []);
            })
            .catch(() => {});
    }, []);

    // ── Écouter les mises à jour du lobby en temps réel ──────────────────
    useEffect(() => {
        const socket = getSocket();

        socket.on('lobby:update', (data) => {
            setJoueurs(data.players);
        });

        socket.on('game:state', (data) => {
            if (data.started) {
                navigate(`/game?pseudo=${pseudo}&playerId=${playerId}`);
            }
        });

        return () => {
            socket.off('lobby:update');
            socket.off('game:state');
        };
    }, [navigate, pseudo, playerId]);

    // ── Bouton "Prêt" ────────────────────────────────────────────────────
    const handleReady = () => {
        if (!playerId) return;
        const socket = getSocket();
        const newReady = !isReady;
        setIsReady(newReady);
        socket.emit('player:ready', { playerId, ready: newReady });
    };

    // ── Démarrer la partie (hôte uniquement) ─────────────────────────────
    const handleDemarrer = async () => {
        try {
            await demarrerPartie();
            // La redirection sera faite via le socket game:state
        } catch (err) {
            setErreur(err.response?.data?.message || 'Impossible de démarrer');
        }
    };

    const readyCount = joueurs.filter(j => j.ready).length;
    const canStart = joueurs.length >= 2 && readyCount >= 2;
    const currentPort = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
    const gameURL = serverIP ? `${window.location.protocol}//${serverIP}:${currentPort}?host=${serverIP}` : '';

    return (
        <div className="lobby-page">
            <AnimatedBackground />
            <h1 className="lobby-titre">📈 Boursicotage</h1>
            <p className="lobby-pseudo">Connecté en tant que : <span>{pseudo}</span></p>

            <div className="lobby-contenu">
                {/* ── Liste des joueurs ── */}
                <div className="lobby-carte">
                    <p className="lobby-sous-titre">
                        Joueurs connectés ({joueurs.length})
                        {readyCount > 0 && <span className="lobby-ready-count"> — {readyCount} prêt{readyCount > 1 ? 's' : ''}</span>}
                    </p>

                    <ul className="lobby-liste">
                        {joueurs.map((joueur) => (
                            <li key={joueur.id} className={`lobby-joueur ${joueur.ready ? 'lobby-joueur-pret' : ''}`}>
                                <div className={`lobby-joueur-point ${joueur.ready ? 'point-pret' : ''}`}></div>
                                <span className="lobby-joueur-nom">{joueur.name}</span>
                                <span className={`lobby-joueur-statut ${joueur.ready ? 'statut-pret' : ''}`}>
                                    {joueur.ready ? '✅ Prêt' : '⏳ En attente'}
                                </span>
                                {joueur.id === playerId && <span className="lobby-joueur-toi">(toi)</span>}
                            </li>
                        ))}
                    </ul>

                    {erreur && <p className="lobby-erreur">{erreur}</p>}

                    <div className="lobby-actions">
                        <button
                            className={`lobby-bouton-pret ${isReady ? 'pret-actif' : ''}`}
                            onClick={handleReady}
                        >
                            {isReady ? '❌ Annuler' : '✅ Je suis prêt'}
                        </button>

                        {isHote && (
                            <button
                                className="lobby-bouton"
                                onClick={handleDemarrer}
                                disabled={!canStart}
                                title={!canStart ? 'Il faut au minimum 2 joueurs prêts' : ''}
                            >
                                🚀 Démarrer la partie
                            </button>
                        )}
                    </div>
                </div>

                {/* ── QR Code + IP pour partager ── */}
                {gameURL && (
                    <div className="lobby-carte lobby-partage">
                        <p className="lobby-sous-titre">Inviter un joueur</p>
                        <p className="lobby-ip-value">{gameURL}</p>
                        <div className="lobby-qr">
                            <QRCodeSVG
                                value={gameURL}
                                size={120}
                                bgColor="transparent"
                                fgColor="#00ff88"
                                level="M"
                            />
                        </div>
                        <p className="lobby-qr-hint">Scanne ce QR code ou entre l'adresse ci-dessus</p>
                    </div>
                )}
            </div>
        </div>
    );
}
