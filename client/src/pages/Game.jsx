import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import socket from '../services/socket.js';
import { getActions, getPortefeuille, getEtatPartie, acheterAction, vendreAction, repandreRumeur, gelerJoueur } from '../services/api.js';
import './Game.css';

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

export default function Game() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const pseudo = searchParams.get('pseudo') || localStorage.getItem('pseudo') || 'Joueur';
    const playerId = parseInt(localStorage.getItem('playerId'));

    const [actions, setActions] = useState([]);
    const [actionSelectionnee, setActionSelectionnee] = useState(null);
    const [portefeuille, setPortefeuille] = useState([]);
    const [solde, setSolde] = useState(0);
    const [tempsRestant, setTempsRestant] = useState(300);
    const [quantites, setQuantites] = useState({});
    const [actionRumeurPositive, setActionRumeurPositive] = useState('');
    const [actionRumeurNegative, setActionRumeurNegative] = useState('');
    const [cibleGel, setCibleGel] = useState('');
    const [message, setMessage] = useState('');

    const afficherMessage = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 3000);
    };

    const chargerPortefeuille = async () => {
        if (!playerId) return;
        try {
            const res = await getPortefeuille(playerId);
            setSolde(res.data.solde);
            setPortefeuille(Object.values(res.data.portefeuille));
        } catch (e) {}
    };

    useEffect(() => {
        const init = async () => {
            try {
                const res = await getActions();
                const actionsData = res.data.actions;
                setActions(actionsData);
                if (actionsData.length > 0) {
                    setActionSelectionnee(actionsData[0].id);
                    setActionRumeurPositive(actionsData[0].id);
                    setActionRumeurNegative(actionsData[0].id);
                    const q = {};
                    actionsData.forEach(a => { q[a.id] = 1; });
                    setQuantites(q);
                }
            } catch (e) {}
        };
        init();
        chargerPortefeuille();
    }, []);

    // Socket
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
            chargerPortefeuille();
        }, 3000);
        return () => clearInterval(interval);
    }, [navigate]);

    const handleAcheter = async (actionId) => {
        try {
            const res = await acheterAction(playerId, actionId, quantites[actionId] || 1);
            setSolde(res.data.solde);
            setPortefeuille(Object.values(res.data.portefeuille));
            afficherMessage('✅ Achat effectué');
        } catch (err) {
            afficherMessage(`❌ ${err.response?.data?.message || 'Erreur'}`);
        }
    };

    const handleVendre = async (actionId) => {
        try {
            const res = await vendreAction(playerId, actionId, quantites[actionId] || 1);
            setSolde(res.data.solde);
            setPortefeuille(Object.values(res.data.portefeuille));
            afficherMessage('✅ Vente effectuée');
        } catch (err) {
            afficherMessage(`❌ ${err.response?.data?.message || 'Erreur'}`);
        }
    };

    const handleRumeurPositive = async () => {
        try {
            const res = await repandreRumeur(playerId, parseInt(actionRumeurPositive), true);
            setSolde(res.data.solde);
            afficherMessage('📢 Rumeur positive répandue !');
        } catch (err) {
            afficherMessage(`❌ ${err.response?.data?.message || 'Erreur'}`);
        }
    };

    const handleRumeurNegative = async () => {
        try {
            const res = await repandreRumeur(playerId, parseInt(actionRumeurNegative), false);
            setSolde(res.data.solde);
            afficherMessage('📉 Rumeur négative répandue !');
        } catch (err) {
            afficherMessage(`❌ ${err.response?.data?.message || 'Erreur'}`);
        }
    };

    const handleGeler = async () => {
        try {
            const res = await gelerJoueur(playerId, parseInt(cibleGel));
            setSolde(res.data.solde);
            afficherMessage(`🧊 ${res.data.message}`);
        } catch (err) {
            afficherMessage(`❌ ${err.response?.data?.message || 'Erreur'}`);
        }
    };

    const historique = actions.find(a => a.id === actionSelectionnee)?.historique || [];

    return (
        <div className="jeu-page">
            {message && <div className="jeu-toast">{message}</div>}

            <header className="jeu-entete">
                <div className="jeu-entete-gauche">
                    <span className="jeu-logo">📈 Boursicotage</span>
                </div>
                <div className="jeu-entete-centre">
                    <div className="jeu-chrono">⏱ {formatTemps(tempsRestant)}</div>
                </div>
                <div className="jeu-entete-droite">
                    <span className="jeu-pseudo">{pseudo}</span>
                    <span className="jeu-solde">💰 {solde.toFixed(2)} €</span>
                </div>
            </header>

            <div className="jeu-contenu">

                {/* Graphe */}
                <section className="jeu-carte">
                    <h2 className="jeu-carte-titre">📉 Historique des prix</h2>
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
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={historique}>
                            <CartesianGrid stroke="#21262d" />
                            <XAxis dataKey="timestamp" stroke="#8b949e" tick={{ fontSize: 10 }} />
                            <YAxis stroke="#8b949e" tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '8px' }}
                                labelStyle={{ color: '#8b949e' }}
                                itemStyle={{ color: '#00ff88' }}
                            />
                            <Line type="monotone" dataKey="prix" stroke="#00ff88" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </section>

                {/* Marché + Portefeuille */}
                <div className="jeu-milieu">

                    <section className="jeu-carte">
                        <h2 className="jeu-carte-titre">📊 Marché</h2>
                        <table className="marche-tableau">
                            <thead>
                                <tr>
                                    <th>Action</th>
                                    <th>Prix</th>
                                    <th>Évolution</th>
                                    <th>Qté</th>
                                    <th>Acheter</th>
                                    <th>Vendre</th>
                                </tr>
                            </thead>
                            <tbody>
                                {actions.map((a) => {
                                    const evolution = a.historique?.length > 1
                                        ? ((a.prix - a.historique[0].prix) / a.historique[0].prix * 100)
                                        : 0;
                                    return (
                                        <tr key={a.id}>
                                            <td className="marche-nom">{a.nom}</td>
                                            <td className="marche-prix">{a.prix.toFixed(2)} €</td>
                                            <td className={evolution >= 0 ? 'positif' : 'negatif'}>
                                                {evolution >= 0 ? '▲' : '▼'} {Math.abs(evolution).toFixed(1)}%
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={quantites[a.id] || 1}
                                                    onChange={(e) => setQuantites({ ...quantites, [a.id]: parseInt(e.target.value) || 1 })}
                                                    className="marche-qte"
                                                />
                                            </td>
                                            <td><button className="bouton-acheter" onClick={() => handleAcheter(a.id)}>Acheter</button></td>
                                            <td><button className="bouton-vendre" onClick={() => handleVendre(a.id)}>Vendre</button></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </section>

                    <section className="jeu-carte">
                        <h2 className="jeu-carte-titre">💼 Mon Portefeuille</h2>
                        {portefeuille.length === 0 ? (
                            <p className="portefeuille-vide">Tu ne possèdes aucune action pour l'instant.</p>
                        ) : (
                            <table className="marche-tableau">
                                <thead>
                                    <tr>
                                        <th>Action</th>
                                        <th>Quantité</th>
                                        <th>Prix moyen</th>
                                        <th>Prix actuel</th>
                                        <th>Plus-value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {portefeuille.map((p, i) => (
                                        <tr key={i}>
                                            <td className="marche-nom">{p.nom}</td>
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
                    </section>

                </div>

                {/* Actions spéciales */}
                <section className="jeu-carte">
                    <h2 className="jeu-carte-titre">⚡ Actions Spéciales</h2>
                    <div className="special-grille">

                        <div className="special-carte">
                            <h3 className="special-titre">📢 Rumeur Positive</h3>
                            <p className="special-description">Fait monter le prix d'une action. Coûte 500 €.</p>
                            <select className="special-selection" value={actionRumeurPositive} onChange={(e) => setActionRumeurPositive(e.target.value)}>
                                {actions.map((a) => <option key={a.id} value={a.id}>{a.nom}</option>)}
                            </select>
                            <button className="special-bouton special-bouton-vert" onClick={handleRumeurPositive}>Lancer</button>
                        </div>

                        <div className="special-carte">
                            <h3 className="special-titre">📉 Rumeur Négative</h3>
                            <p className="special-description">Fait baisser le prix d'une action. Coûte 500 €.</p>
                            <select className="special-selection" value={actionRumeurNegative} onChange={(e) => setActionRumeurNegative(e.target.value)}>
                                {actions.map((a) => <option key={a.id} value={a.id}>{a.nom}</option>)}
                            </select>
                            <button className="special-bouton special-bouton-rouge" onClick={handleRumeurNegative}>Lancer</button>
                        </div>

                        <div className="special-carte">
                            <h3 className="special-titre">🧊 Geler un Joueur</h3>
                            <p className="special-description">Bloque un adversaire pendant 45s. Coûte 1000 €.</p>
                            <input
                                type="number"
                                placeholder="ID du joueur..."
                                className="special-selection"
                                value={cibleGel}
                                onChange={(e) => setCibleGel(e.target.value)}
                            />
                            <button className="special-bouton special-bouton-bleu" onClick={handleGeler}>Geler</button>
                        </div>

                    </div>
                </section>

            </div>
        </div>
    );
}
