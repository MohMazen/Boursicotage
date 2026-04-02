import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import socket from '../services/socket.js';
import { getActions, getPortefeuille, getEtatPartie, acheterAction, vendreAction, repandreRumeur, gelerJoueur } from '../services/api.js';
import './Game.css';
import './GameLocal.css';

function parseTemps(str) {
    const match = str?.match(/(\d+)m\s*(\d+)s/);
    if (!match) return 0;
    return parseInt(match[1]) * 60 + parseInt(match[2]);
}

function formatTemps(secondes) {
    const m = Math.floor(secondes / 60);
    const s = secondes % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function PlayerPanel({ playerId, pseudo, actions, adversaireId, couleur }) {
    const [portefeuille, setPortefeuille] = useState([]);
    const [solde, setSolde] = useState(0);
    const [quantites, setQuantites] = useState({});
    const [rumeurPos, setRumeurPos] = useState('');
    const [rumeurNeg, setRumeurNeg] = useState('');
    const [message, setMessage] = useState('');

    const showMsg = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 3000);
    };

    const loadPortefeuille = async () => {
        if (!playerId) return;
        try {
            const res = await getPortefeuille(playerId);
            setSolde(res.data.solde);
            setPortefeuille(Object.values(res.data.portefeuille));
        } catch (e) {}
    };

    useEffect(() => {
        loadPortefeuille();
    }, [playerId]);

    useEffect(() => {
        if (actions.length > 0 && !rumeurPos) {
            setRumeurPos(String(actions[0].id));
            setRumeurNeg(String(actions[0].id));
            const q = {};
            actions.forEach(a => { q[a.id] = 1; });
            setQuantites(q);
        }
    }, [actions]);

    useEffect(() => {
        const interval = setInterval(loadPortefeuille, 3000);
        return () => clearInterval(interval);
    }, [playerId]);

    const acheter = async (actionId) => {
        try {
            const res = await acheterAction(playerId, actionId, quantites[actionId] || 1);
            setSolde(res.data.solde);
            setPortefeuille(Object.values(res.data.portefeuille));
            showMsg('✅ Achat effectué');
        } catch (err) {
            showMsg(`❌ ${err.response?.data?.message || 'Erreur'}`);
        }
    };

    const vendre = async (actionId) => {
        try {
            const res = await vendreAction(playerId, actionId, quantites[actionId] || 1);
            setSolde(res.data.solde);
            setPortefeuille(Object.values(res.data.portefeuille));
            showMsg('✅ Vente effectuée');
        } catch (err) {
            showMsg(`❌ ${err.response?.data?.message || 'Erreur'}`);
        }
    };

    const lancerRumeurPos = async () => {
        try {
            const res = await repandreRumeur(playerId, parseInt(rumeurPos), true);
            setSolde(res.data.solde);
            showMsg('📢 Rumeur positive répandue !');
        } catch (err) {
            showMsg(`❌ ${err.response?.data?.message || 'Erreur'}`);
        }
    };

    const lancerRumeurNeg = async () => {
        try {
            const res = await repandreRumeur(playerId, parseInt(rumeurNeg), false);
            setSolde(res.data.solde);
            showMsg('📉 Rumeur négative répandue !');
        } catch (err) {
            showMsg(`❌ ${err.response?.data?.message || 'Erreur'}`);
        }
    };

    const geler = async () => {
        try {
            const res = await gelerJoueur(playerId, adversaireId);
            setSolde(res.data.solde);
            showMsg('🧊 Adversaire gelé !');
        } catch (err) {
            showMsg(`❌ ${err.response?.data?.message || 'Erreur'}`);
        }
    };

    return (
        <div className={`local-panel local-panel-${couleur}`}>
            {message && <div className="local-toast">{message}</div>}

            <div className="local-panel-header">
                <span className={`local-panel-pseudo local-pseudo-${couleur}`}>{pseudo}</span>
                <span className="local-panel-solde">💰 {solde.toFixed(2)} €</span>
            </div>

            <div className="local-carte">
                <h2 className="local-carte-titre">📊 Marché</h2>
                <table className="local-tableau">
                    <thead>
                        <tr>
                            <th>Action</th>
                            <th>Prix</th>
                            <th>Évol.</th>
                            <th>Qté</th>
                            <th>Acheter</th>
                            <th>Vendre</th>
                        </tr>
                    </thead>
                    <tbody>
                        {actions.map((a) => {
                            const evol = a.historique?.length > 1
                                ? ((a.prix - a.historique[0].prix) / a.historique[0].prix * 100)
                                : 0;
                            return (
                                <tr key={a.id}>
                                    <td className="local-nom">{a.nom}</td>
                                    <td className="local-prix">{a.prix.toFixed(2)} €</td>
                                    <td className={evol >= 0 ? 'positif' : 'negatif'}>
                                        {evol >= 0 ? '▲' : '▼'} {Math.abs(evol).toFixed(1)}%
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            min="1"
                                            value={quantites[a.id] || 1}
                                            onChange={(e) => setQuantites({ ...quantites, [a.id]: parseInt(e.target.value) || 1 })}
                                            className="local-qte"
                                        />
                                    </td>
                                    <td><button className="bouton-acheter" onClick={() => acheter(a.id)}>Acheter</button></td>
                                    <td><button className="bouton-vendre" onClick={() => vendre(a.id)}>Vendre</button></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="local-carte">
                <h2 className="local-carte-titre">💼 Mon Portefeuille</h2>
                {portefeuille.length === 0 ? (
                    <p className="portefeuille-vide">Aucune action pour l'instant.</p>
                ) : (
                    <table className="local-tableau">
                        <thead>
                            <tr>
                                <th>Action</th>
                                <th>Qté</th>
                                <th>P. moy.</th>
                                <th>Actuel</th>
                                <th>+/−</th>
                            </tr>
                        </thead>
                        <tbody>
                            {portefeuille.map((p, i) => (
                                <tr key={i}>
                                    <td className="local-nom">{p.nom}</td>
                                    <td>{p.quantite}</td>
                                    <td>{p.prixMoyenAchat.toFixed(2)} €</td>
                                    <td>{p.prixActuel.toFixed(2)} €</td>
                                    <td className={p.plusValueLatente >= 0 ? 'positif' : 'negatif'}>
                                        {p.plusValueLatente >= 0 ? '+' : ''}{p.plusValueLatente.toFixed(2)} €
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="local-carte">
                <h2 className="local-carte-titre">⚡ Actions Spéciales</h2>
                <div className="local-special-grille">
                    <div className="local-special-carte">
                        <h3 className="special-titre">📢 Rumeur +</h3>
                        <p className="special-description">Fait monter une action. Coûte 500 €.</p>
                        <select className="special-selection" value={rumeurPos} onChange={(e) => setRumeurPos(e.target.value)}>
                            {actions.map((a) => <option key={a.id} value={a.id}>{a.nom}</option>)}
                        </select>
                        <button className="special-bouton special-bouton-vert" onClick={lancerRumeurPos}>Lancer</button>
                    </div>
                    <div className="local-special-carte">
                        <h3 className="special-titre">📉 Rumeur −</h3>
                        <p className="special-description">Fait baisser une action. Coûte 500 €.</p>
                        <select className="special-selection" value={rumeurNeg} onChange={(e) => setRumeurNeg(e.target.value)}>
                            {actions.map((a) => <option key={a.id} value={a.id}>{a.nom}</option>)}
                        </select>
                        <button className="special-bouton special-bouton-rouge" onClick={lancerRumeurNeg}>Lancer</button>
                    </div>
                    <div className="local-special-carte">
                        <h3 className="special-titre">🧊 Geler</h3>
                        <p className="special-description">Bloque l'adversaire 45s. Coûte 1000 €.</p>
                        <button className="special-bouton special-bouton-bleu" onClick={geler}>Geler l'adversaire</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function GameLocal() {
    const navigate = useNavigate();
    const player1Id = parseInt(localStorage.getItem('player1Id'));
    const player2Id = parseInt(localStorage.getItem('player2Id'));
    const pseudo1 = localStorage.getItem('player1Pseudo') || 'Joueur 1';
    const pseudo2 = localStorage.getItem('player2Pseudo') || 'Joueur 2';

    const [actions, setActions] = useState([]);
    const [actionSelectionnee, setActionSelectionnee] = useState(null);
    const [tempsRestant, setTempsRestant] = useState(300);

    useEffect(() => {
        getActions().then(res => {
            setActions(res.data.actions);
            if (res.data.actions.length > 0) setActionSelectionnee(res.data.actions[0].id);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        socket.on('market:update', (data) => {
            setActions(data.actions);
        });
        socket.on('game:end', (data) => {
            localStorage.setItem('classement', JSON.stringify(data.classement));
            navigate('/classement');
        });
        return () => {
            socket.off('market:update');
            socket.off('game:end');
        };
    }, [navigate]);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await getEtatPartie();
                const ecoule = parseTemps(res.data.tempsEcoule);
                setTempsRestant(Math.max(0, 300 - ecoule));
                if (res.data.finished) {
                    localStorage.setItem('classement', JSON.stringify(res.data.classement));
                    navigate('/classement');
                }
            } catch (e) {}
        }, 3000);
        return () => clearInterval(interval);
    }, [navigate]);

    const historique = actions.find(a => a.id === actionSelectionnee)?.historique || [];

    return (
        <div className="local-page">
            <header className="local-entete">
                <span className="jeu-logo">📈 Boursicotage</span>
                <div className="jeu-chrono">⏱ {formatTemps(tempsRestant)}</div>
                <span className="local-mode-badge">MODE LOCAL</span>
            </header>

            <section className="local-graphe-section">
                <h2 className="local-graphe-titre">📉 Historique des prix</h2>
                <div className="graphe-selecteurs">
                    {actions.map((a) => (
                        <button
                            key={a.id}
                            className={`graphe-bouton ${actionSelectionnee === a.id ? 'graphe-bouton-actif' : ''}`}
                            onClick={() => setActionSelectionnee(a.id)}
                        >
                            {a.nom}
                        </button>
                    ))}
                </div>
                <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={historique}>
                        <CartesianGrid stroke="#21262d" />
                        <XAxis dataKey="timestamp" stroke="#8b949e" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#8b949e" tick={{ fontSize: 11 }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '8px' }}
                            labelStyle={{ color: '#8b949e' }}
                            itemStyle={{ color: '#00ff88' }}
                        />
                        <Line type="monotone" dataKey="prix" stroke="#00ff88" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </section>

            <div className="local-split">
                <PlayerPanel
                    playerId={player1Id}
                    pseudo={pseudo1}
                    actions={actions}
                    adversaireId={player2Id}
                    couleur="vert"
                />
                <div className="local-divider" />
                <PlayerPanel
                    playerId={player2Id}
                    pseudo={pseudo2}
                    actions={actions}
                    adversaireId={player1Id}
                    couleur="bleu"
                />
            </div>
        </div>
    );
}
