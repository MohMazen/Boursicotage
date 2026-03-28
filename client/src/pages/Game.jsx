import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getSocket } from '../services/socket.js';
import {
    acheterAction, vendreAction, repandreRumeur, gelerJoueur,
    insiderTrading, ouvrirShort, fermerShort,
    getPortefeuille, getShortPositions as fetchShortPositions
} from '../services/api.js';
import './Game.css';

const COULEURS_ACTIONS = ['#00ff88', '#00c9ff', '#ff6b6b', '#ffd93d', '#c084fc'];

export default function Game() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const pseudo = searchParams.get('pseudo') || 'Joueur';
    const playerId = parseInt(searchParams.get('playerId'));

    // ── État principal ───────────────────────────────────────────────────
    const [actions, setActions] = useState([]);
    const [actionSelectionnee, setActionSelectionnee] = useState(1);
    const [solde, setSolde] = useState(10000);
    const [patrimoine, setPatrimoine] = useState(10000);
    const [portefeuille, setPortefeuille] = useState({});
    const [shortPositions, setShortPositions] = useState({});
    const [dernierEvenement, setDernierEvenement] = useState(null);
    const [regime, setRegime] = useState({ regime: 'normal', label: 'Marché normal' });

    // ── Trading ──────────────────────────────────────────────────────────
    const [quantite, setQuantite] = useState(1);
    const [shortQuantite, setShortQuantite] = useState(1);
    const [message, setMessage] = useState('');

    // ── Actions spéciales ────────────────────────────────────────────────
    const [rumeurAction, setRumeurAction] = useState(1);
    const [gelerCible, setGelerCible] = useState('');
    const [insiderAction, setInsiderAction] = useState(1);
    const [insiderInfo, setInsiderInfo] = useState(null);
    const [joueurs, setJoueurs] = useState([]);

    // ── Tension ──────────────────────────────────────────────────────────
    const [tensionLevel, setTensionLevel] = useState(0);
    const [tensionMessage, setTensionMessage] = useState('');
    const [phaseMarche, setPhaseMarche] = useState('Marché ouvert');

    // ── Socket.IO — écouter les mises à jour temps réel ──────────────────
    useEffect(() => {
        const socket = getSocket();

        socket.on('market:update', (data) => {
            setActions(data.actions);
        });

        socket.on('market:event', (evt) => {
            setDernierEvenement(evt);
        });

        socket.on('market:regime', (data) => {
            setRegime(data);
            setPhaseMarche(data.label);
        });

        socket.on('game:tension', (data) => {
            setTensionLevel(data.level);
            setTensionMessage(data.message);
            // Réinitialiser après 8 secondes pour l'alerte suivante
            setTimeout(() => {
                if (data.level < 3) setTensionLevel(0);
            }, 8000);
        });

        socket.on('game:end', (data) => {
            navigate(`/classement?pseudo=${pseudo}&playerId=${playerId}`, {
                state: data
            });
        });

        socket.on('game:state', (data) => {
            if (data.actions) setActions(data.actions);
            if (data.regime) setRegime(data.regime);
        });

        return () => {
            socket.off('market:update');
            socket.off('market:event');
            socket.off('market:regime');
            socket.off('game:tension');
            socket.off('game:end');
            socket.off('game:state');
        };
    }, [navigate, pseudo, playerId]);

    // ── Rafraîchir le portefeuille ───────────────────────────────────────
    const refreshPortefeuille = useCallback(async () => {
        if (!playerId) return;
        try {
            const res = await getPortefeuille(playerId);
            setSolde(res.data.solde);
            setPortefeuille(res.data.portefeuille);
            setPatrimoine(res.data.patrimoine);
        } catch {}
        try {
            const res = await fetchShortPositions(playerId);
            setShortPositions(res.data.shorts || {});
        } catch {}
    }, [playerId]);

    useEffect(() => {
        const interval = setInterval(refreshPortefeuille, 3000);
        refreshPortefeuille();
        return () => clearInterval(interval);
    }, [refreshPortefeuille]);

    // ── Fonctions de trading ─────────────────────────────────────────────
    const handleAcheter = async (actionId) => {
        try {
            const res = await acheterAction(playerId, actionId, quantite);
            setSolde(res.data.solde);
            setPortefeuille(res.data.portefeuille);
            setPatrimoine(res.data.patrimoine);
            setMessage(`✅ Achat réussi`);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(`❌ ${err.response?.data?.message || 'Erreur'}`);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleVendre = async (actionId) => {
        try {
            const res = await vendreAction(playerId, actionId, quantite);
            setSolde(res.data.solde);
            setPortefeuille(res.data.portefeuille);
            setPatrimoine(res.data.patrimoine);
            setMessage(`✅ Vente réussie`);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(`❌ ${err.response?.data?.message || 'Erreur'}`);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleRumeur = async (positif) => {
        try {
            const res = await repandreRumeur(playerId, rumeurAction, positif);
            setSolde(res.data.solde);
            setMessage(`✅ ${res.data.message}`);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(`❌ ${err.response?.data?.message || 'Erreur'}`);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleGeler = async () => {
        const cibleIdInt = parseInt(gelerCible);
        if (isNaN(cibleIdInt)) return;
        try {
            const res = await gelerJoueur(playerId, cibleIdInt);
            setSolde(res.data.solde);
            setMessage(`✅ ${res.data.message}`);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(`❌ ${err.response?.data?.message || 'Erreur'}`);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleInsider = async () => {
        try {
            const res = await insiderTrading(playerId, insiderAction);
            setSolde(res.data.solde);
            setInsiderInfo({
                actionNom: res.data.actionNom,
                tendance: res.data.tendance,
                expireAt: Date.now() + res.data.duree * 1000
            });
            setTimeout(() => setInsiderInfo(null), res.data.duree * 1000);
            setMessage(`✅ Info insider reçue`);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(`❌ ${err.response?.data?.message || 'Erreur'}`);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleOuvrirShort = async (actionId) => {
        try {
            const res = await ouvrirShort(playerId, actionId, shortQuantite);
            setSolde(res.data.solde);
            setShortPositions(res.data.shortPositions);
            setMessage(`✅ ${res.data.message}`);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(`❌ ${err.response?.data?.message || 'Erreur'}`);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleFermerShort = async (actionId, qty) => {
        try {
            const res = await fermerShort(playerId, actionId, qty);
            setSolde(res.data.solde);
            setShortPositions(res.data.shortPositions);
            setMessage(`✅ ${res.data.message}`);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(`❌ ${err.response?.data?.message || 'Erreur'}`);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    // ── Calculs utilitaires ──────────────────────────────────────────────
    const actionCourante = actions.find(a => a.id === actionSelectionnee);
    const maxAchetable = actionCourante ? Math.floor(solde / actionCourante.prix) : 0;
    const quantitePossedee = (actionCourante && portefeuille[actionSelectionnee]) ? portefeuille[actionSelectionnee].quantite : 0;
    const coutTotal = actionCourante ? (quantite * actionCourante.prix).toFixed(2) : '0.00';

    const getHistoriqueFormate = (action) => {
        if (!action?.historique) return [];
        // On ne garde que les 120 derniers points (déjà géré par le serveur mais sécurité)
        return action.historique.map((point, i, arr) => {
            const ageTicks = arr.length - 1 - i;
            return { 
                time: ageTicks, // On utilise l'age en ticks pour l'axe
                label: ageTicks === 0 ? 'Maintenant' : `-${ageTicks}s`,
                prix: point.prix 
            };
        });
    };

    // Tendance (flèche)
    const getTendance = (action) => {
        if (!action?.historique || action.historique.length < 2) return { arrow: '→', color: '#8b949e' };
        const last = action.historique[action.historique.length - 1].prix;
        const prev = action.historique[action.historique.length - 2].prix;
        if (last > prev) return { arrow: '▲', color: '#00ff88' };
        if (last < prev) return { arrow: '▼', color: '#ff4d4d' };
        return { arrow: '→', color: '#8b949e' };
    };

    // Calcul évolution (%)
    const getEvolution = (action) => {
        if (!action?.historique || action.historique.length < 2) return 0;
        const initial = action.historique[0].prix;
        const current = action.prix;
        return ((current - initial) / initial * 100).toFixed(1);
    };

    // Classe CSS de tension
    const tensionClass = tensionLevel > 0 ? `tension-${tensionLevel}` : '';

    return (
        <div className={`jeu-page ${tensionClass}`}>

            {/* ── En-tête ── */}
            <header className="jeu-entete">
                <div className="jeu-entete-gauche">
                    <span className="jeu-logo">📈 Boursicotage</span>
                </div>
                <div className="jeu-entete-centre">
                    <div className={`jeu-phase ${tensionLevel > 0 ? 'phase-tension' : ''}`}>
                        {tensionLevel > 0 ? `⚠ ${tensionMessage}` : `🏦 ${phaseMarche}`}
                    </div>
                </div>
                <div className="jeu-entete-droite">
                    <span className="jeu-pseudo">{pseudo}</span>
                    <span className="jeu-solde">💰 {solde.toFixed(2)} €</span>
                    <span className="jeu-patrimoine">📊 {patrimoine.toFixed(2)} €</span>
                </div>
            </header>

            {/* ── Message flash ── */}
            {message && <div className="jeu-message">{message}</div>}

            {/* ── Insider Info (discret) ── */}
            {insiderInfo && (
                <div className="insider-info">
                    🔍 <strong>{insiderInfo.actionNom}</strong> : tendance <span className={`insider-tendance insider-${insiderInfo.tendance}`}>{insiderInfo.tendance}</span>
                </div>
            )}

            {/* ── Contenu principal ── */}
            <div className="jeu-contenu">

                {/* ── Graphe (haut) ── */}
                <section className="jeu-carte">
                    <h2 className="jeu-carte-titre">📉 Historique des prix</h2>
                    <div className="graphe-selecteurs">
                        {actions.map((a, i) => {
                            const tendance = getTendance(a);
                            const evolution = getEvolution(a);
                            return (
                                <button
                                    key={a.id}
                                    className={`graphe-bouton ${actionSelectionnee === a.id ? 'graphe-bouton-actif' : ''}`}
                                    onClick={() => setActionSelectionnee(a.id)}
                                    style={{ '--action-color': COULEURS_ACTIONS[i] }}
                                >
                                    <span>{a.nom}</span>
                                    <span className="graphe-prix">{a.prix.toFixed(2)} €</span>
                                    <span style={{ color: tendance.color }}>{tendance.arrow} {evolution}%</span>
                                </button>
                            );
                        })}
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={getHistoriqueFormate(actionCourante)}>
                            <defs>
                                <linearGradient id="colorPrix" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COULEURS_ACTIONS[actions.findIndex(a => a.id === actionSelectionnee)] || '#00ff88'} stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor={COULEURS_ACTIONS[actions.findIndex(a => a.id === actionSelectionnee)] || '#00ff88'} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#21262d" strokeDasharray="3 3" vertical={false} />
                            <XAxis 
                                dataKey="time" 
                                stroke="#8b949e" 
                                tick={{ fontSize: 10 }} 
                                reversed={true} // Inverser pour aller de -120 à 0
                                tickFormatter={(tick) => {
                                    if (tick === 0) return 'Dernier';
                                    if (tick === 60) return '-1min';
                                    if (tick === 120) return '-2min';
                                    return ''; // On ne garde que 3 labels pour la clarté
                                }}
                                interval={0} // On force l'affichage de nos labels choisis
                                hide={false}
                            />
                            <YAxis
                                stroke="#8b949e"
                                tick={{ fontSize: 11 }}
                                domain={['auto', 'auto']}
                                tickFormatter={(v) => v.toFixed(0)}
                                orientation="right"
                                width={40}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '8px' }}
                                labelStyle={{ color: '#8b949e' }}
                                itemStyle={{ color: '#00ff88' }}
                                formatter={(value) => [`${value.toFixed(2)} €`, 'Prix']}
                            />
                            <Area
                                type="linear"
                                dataKey="prix"
                                stroke={COULEURS_ACTIONS[actions.findIndex(a => a.id === actionSelectionnee)] || '#00ff88'}
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorPrix)"
                                animationDuration={300}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </section>

                {/* ── Marché + Portefeuille (milieu, côte à côte) ── */}
                <div className="jeu-milieu">

                    {/* Marché */}
                    <section className="jeu-carte">
                        <h2 className="jeu-carte-titre">📊 Marché — {regime.label}</h2>

                        {/* Sélecteur de quantité */}
                        <div className="quantite-selecteur">
                            <label>Quantité :</label>
                            <div className="quantite-groupe">
                                <input
                                    type="number"
                                    min={1}
                                    value={quantite}
                                    onChange={(e) => setQuantite(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="quantite-input"
                                />
                                <button className="quantite-btn" onClick={() => setQuantite(q => q + 1)}>+1</button>
                                <button className="quantite-btn" onClick={() => setQuantite(q => q + 5)}>+5</button>
                                <button className="quantite-btn" onClick={() => setQuantite(q => q + 10)}>+10</button>
                                <button className="quantite-btn quantite-max" onClick={() => setQuantite(maxAchetable)} title="Max achetable">Max Achat</button>
                                <button className="quantite-btn quantite-max" onClick={() => setQuantite(quantitePossedee)} title="Tout vendre">Tout Vendre</button>
                            </div>
                            <span className="quantite-cout">Engagement : {coutTotal} €</span>
                        </div>

                        <table className="marche-tableau">
                            <thead>
                                <tr>
                                    <th>Action</th>
                                    <th>Prix</th>
                                    <th>Évol.</th>
                                    <th>Acheter</th>
                                    <th>Vendre</th>
                                    <th>Short</th>
                                </tr>
                            </thead>
                            <tbody>
                                {actions.map((a) => {
                                    const tendance = getTendance(a);
                                    const evolution = getEvolution(a);
                                    const insuffisant = solde < a.prix * quantiteAchat;
                                    return (
                                        <tr key={a.id}>
                                            <td className="marche-nom">{a.nom} <span className="marche-secteur">{a.secteur}</span></td>
                                            <td className="marche-prix">{a.prix.toFixed(2)} € <span style={{ color: tendance.color }}>{tendance.arrow}</span></td>
                                            <td className={parseFloat(evolution) >= 0 ? 'positif' : 'negatif'}>
                                                {parseFloat(evolution) >= 0 ? '▲' : '▼'} {Math.abs(evolution)}%
                                            </td>
                                            <td>
                                                <button
                                                    className="bouton-acheter"
                                                    onClick={() => handleAcheter(a.id)}
                                                    disabled={solde < a.prix * quantite}
                                                    title={solde < a.prix * quantite ? 'Solde insuffisant' : ''}
                                                >
                                                    Acheter ({quantite})
                                                </button>
                                            </td>
                                            <td>
                                                <button className="bouton-vendre" onClick={() => handleVendre(a.id)}>
                                                    Vendre ({quantite})
                                                </button>
                                            </td>
                                            <td>
                                                <button className="bouton-short" onClick={() => handleOuvrirShort(a.id)}>
                                                    Short
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Dernier événement */}
                        {dernierEvenement && (
                            <div className="evenement-banner">
                                <span className="evenement-icon">📰</span>
                                <span className="evenement-texte">
                                    <strong>{dernierEvenement.actionNom}</strong> — {dernierEvenement.evenement}
                                </span>
                            </div>
                        )}
                    </section>

                    {/* Portefeuille + Shorts */}
                    <section className="jeu-carte">
                        <h2 className="jeu-carte-titre">💼 Mon Portefeuille</h2>

                        {Object.keys(portefeuille).length === 0 && Object.keys(shortPositions).length === 0 ? (
                            <p className="portefeuille-vide">Tu ne possèdes aucune action pour l'instant.</p>
                        ) : (
                            <>
                                {/* Positions longues */}
                                {Object.keys(portefeuille).length > 0 && (
                                    <table className="marche-tableau">
                                        <thead>
                                            <tr>
                                                <th>Action</th>
                                                <th>Qté</th>
                                                <th>Prix achat</th>
                                                <th>Prix actuel</th>
                                                <th>PnL</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(portefeuille).map(([id, p]) => (
                                                <tr key={id}>
                                                    <td className="marche-nom">{p.nom}</td>
                                                    <td>{p.quantite}</td>
                                                    <td>{p.prixMoyenAchat.toFixed(2)} €</td>
                                                    <td>{p.prixActuel.toFixed(2)} €</td>
                                                    <td className={p.plusValueLatente >= 0 ? 'positif' : 'negatif'}>
                                                        {p.plusValueLatente >= 0 ? '+' : ''}{p.plusValueLatente.toFixed(2)} €
                                                        <span className="pnl-pct"> ({p.pourcentageEvolution >= 0 ? '+' : ''}{p.pourcentageEvolution}%)</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {/* Positions short */}
                                {Object.keys(shortPositions).length > 0 && (
                                    <>
                                        <h3 className="portefeuille-section-titre">📉 Positions Short</h3>
                                        <table className="marche-tableau">
                                            <thead>
                                                <tr>
                                                    <th>Action</th>
                                                    <th>Qté</th>
                                                    <th>Entrée</th>
                                                    <th>Actuel</th>
                                                    <th>PnL</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(shortPositions).map(([id, s]) => (
                                                    <tr key={`short-${id}`}>
                                                        <td className="marche-nom">{s.nom}</td>
                                                        <td>{s.quantite}</td>
                                                        <td>{s.prixEntree.toFixed(2)} €</td>
                                                        <td>{s.prixActuel.toFixed(2)} €</td>
                                                        <td className={s.pnlLatent >= 0 ? 'positif' : 'negatif'}>
                                                            {s.pnlLatent >= 0 ? '+' : ''}{s.pnlLatent.toFixed(2)} €
                                                            <span className="pnl-pct"> ({s.pourcentage >= 0 ? '+' : ''}{s.pourcentage}%)</span>
                                                        </td>
                                                        <td>
                                                            <button className="bouton-vendre bouton-small" onClick={() => handleFermerShort(parseInt(id), s.quantite)}>
                                                                Fermer
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </>
                                )}
                            </>
                        )}

                        {/* Patrimoine total */}
                        <div className="patrimoine-total">
                            <span>Patrimoine total :</span>
                            <span className="patrimoine-valeur">{patrimoine.toFixed(2)} €</span>
                        </div>
                    </section>
                </div>

                {/* ── Actions spéciales (bas) ── */}
                <section className="jeu-carte">
                    <h2 className="jeu-carte-titre">⚡ Actions Spéciales</h2>
                    <div className="special-grille">

                        {/* Rumeur positive */}
                        <div className="special-carte">
                            <h3 className="special-titre">📢 Rumeur Positive</h3>
                            <p className="special-description">Fait monter le prix d'une action. Coûte 500 €.</p>
                            <select className="special-selection" value={rumeurAction} onChange={e => setRumeurAction(parseInt(e.target.value))}>
                                {actions.map((a) => (
                                    <option key={a.id} value={a.id}>{a.nom}</option>
                                ))}
                            </select>
                            <button className="special-bouton special-bouton-vert" onClick={() => handleRumeur(true)}>Lancer</button>
                        </div>

                        {/* Rumeur négative */}
                        <div className="special-carte">
                            <h3 className="special-titre">📉 Rumeur Négative</h3>
                            <p className="special-description">Fait baisser le prix d'une action. Coûte 500 €.</p>
                            <select className="special-selection" value={rumeurAction} onChange={e => setRumeurAction(parseInt(e.target.value))}>
                                {actions.map((a) => (
                                    <option key={a.id} value={a.id}>{a.nom}</option>
                                ))}
                            </select>
                            <button className="special-bouton special-bouton-rouge" onClick={() => handleRumeur(false)}>Lancer</button>
                        </div>

                        {/* Geler un joueur */}
                        <div className="special-carte">
                            <h3 className="special-titre">🧊 Geler un Joueur</h3>
                            <p className="special-description">Bloque un adversaire pendant 45s. Coûte 1000 €.</p>
                            <input
                                type="number"
                                className="special-selection"
                                placeholder="ID joueur cible"
                                value={gelerCible}
                                onChange={e => setGelerCible(e.target.value)}
                            />
                            <button className="special-bouton special-bouton-bleu" onClick={handleGeler}>Geler</button>
                        </div>

                        {/* Insider Trading */}
                        <div className="special-carte">
                            <h3 className="special-titre">🔍 Insider Trading</h3>
                            <p className="special-description">Révèle la tendance d'une action pendant 10s. Coûte 1500 €. (2 max)</p>
                            <select className="special-selection" value={insiderAction} onChange={e => setInsiderAction(parseInt(e.target.value))}>
                                {actions.map((a) => (
                                    <option key={a.id} value={a.id}>{a.nom}</option>
                                ))}
                            </select>
                            <button className="special-bouton special-bouton-jaune" onClick={handleInsider}>Révéler</button>
                        </div>

                    </div>
                </section>

            </div>
        </div>
    );
}
