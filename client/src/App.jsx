import { useState, useEffect } from 'react';
import socket from './services/socket.js';
import { ajouterJoueur, demarrerPartie, getActions } from './services/api.js';
import './App.css';

function App() {
    const [gameState, setGameState] = useState(null);
    const [actions, setActions]     = useState([]);
    const [playerName, setPlayerName] = useState('');
    const [playerId, setPlayerId]   = useState(null);
    const [message, setMessage]     = useState('');
    const [connected, setConnected] = useState(false);
    const [lastEvent, setLastEvent] = useState(null);

    // ── Socket.IO listeners ──────────────────────────────────────────────
    useEffect(() => {
        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));

        socket.on('game:state', (state) => {
            setGameState(state);
        });

        socket.on('market:update', (data) => {
            setActions(data.actions);
        });

        socket.on('market:event', (evt) => {
            setLastEvent(evt);
        });

        socket.on('game:end', (data) => {
            setMessage('🏁 Partie terminée !');
            setGameState(prev => ({ ...prev, finished: true, classement: data.classement }));
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('game:state');
            socket.off('market:update');
            socket.off('market:event');
            socket.off('game:end');
        };
    }, []);

    // ── Handlers ─────────────────────────────────────────────────────────
    const handleJoin = async () => {
        if (!playerName.trim()) return;
        try {
            const res = await ajouterJoueur(playerName.trim());
            setPlayerId(res.data.joueur.id);
            setMessage(`✅ Bienvenue ${res.data.joueur.name} (ID: ${res.data.joueur.id})`);
        } catch (err) {
            setMessage(`❌ ${err.response?.data?.message || err.message}`);
        }
    };

    const handleStart = async () => {
        try {
            await demarrerPartie();
            setMessage('🚀 Partie démarrée !');
            // Charge les actions initiales
            const res = await getActions();
            setActions(res.data.actions);
        } catch (err) {
            setMessage(`❌ ${err.response?.data?.message || err.message}`);
        }
    };

    // ── Rendu ────────────────────────────────────────────────────────────
    return (
        <div className="app">
            <header className="app-header">
                <h1>📈 Boursicotage</h1>
                <div className={`status ${connected ? 'online' : 'offline'}`}>
                    {connected ? '🟢 Connecté' : '🔴 Déconnecté'}
                </div>
            </header>

            {message && <div className="toast">{message}</div>}

            {/* ── Inscription ──────────────────────────────────────── */}
            {!playerId && (
                <section className="card">
                    <h2>Rejoindre la partie</h2>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Ton pseudo..."
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                        />
                        <button onClick={handleJoin}>Rejoindre</button>
                    </div>
                </section>
            )}

            {/* ── Actions (quand inscrit) ──────────────────────────── */}
            {playerId && (
                <>
                    <section className="card">
                        <h2>Contrôles</h2>
                        <button className="btn-start" onClick={handleStart}>
                            ▶ Démarrer la partie
                        </button>
                        <p className="info">ID joueur : <strong>{playerId}</strong></p>
                    </section>

                    {/* ── Dernier événement ───────────────────────── */}
                    {lastEvent && (
                        <section className="card event-card">
                            <h3>📰 Dernier événement</h3>
                            <p><strong>{lastEvent.actionNom}</strong> — {lastEvent.evenement}</p>
                            <span className={lastEvent.impact > 0 ? 'positive' : 'negative'}>
                                {lastEvent.impact > 0 ? '+' : ''}{(lastEvent.impact * 100).toFixed(1)}%
                            </span>
                        </section>
                    )}

                    {/* ── Tableau du marché ───────────────────────── */}
                    {actions.length > 0 && (
                        <section className="card">
                            <h2>📊 Marché</h2>
                            <table className="market-table">
                                <thead>
                                    <tr>
                                        <th>Action</th>
                                        <th>Prix</th>
                                        <th>Évolution</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {actions.map((a) => {
                                        const evolution = ((a.prix - a.historique[0]?.prix) / a.historique[0]?.prix * 100) || 0;
                                        return (
                                            <tr key={a.id}>
                                                <td className="stock-name">{a.nom}</td>
                                                <td className="stock-price">{a.prix.toFixed(2)} €</td>
                                                <td className={evolution >= 0 ? 'positive' : 'negative'}>
                                                    {evolution >= 0 ? '▲' : '▼'} {Math.abs(evolution).toFixed(2)}%
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </section>
                    )}

                    {/* ── Classement (fin de partie) ─────────────── */}
                    {gameState?.classement && (
                        <section className="card">
                            <h2>🏆 Classement</h2>
                            <ol className="ranking">
                                {gameState.classement.map((p, i) => (
                                    <li key={p.id} className={i === 0 ? 'first' : ''}>
                                        <span className="rank">{i + 1}</span>
                                        <span className="name">{p.name}</span>
                                        <span className="patrimoine">{p.patrimoine.toFixed(2)} €</span>
                                    </li>
                                ))}
                            </ol>
                        </section>
                    )}
                </>
            )}
        </div>
    );
}

export default App;
