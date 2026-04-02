import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { GameProvider, useGameContext } from '../contexts/GameContext.jsx';
import './Game.css';

const COULEURS_ACTIONS = ['#00ff88', '#00c9ff', '#ff6b6b', '#ffd93d', '#c084fc'];

export default function Game() {
    const [searchParams] = useSearchParams();
    const pseudo = searchParams.get('pseudo') || 'Joueur';
    const playerId = parseInt(searchParams.get('playerId'));

    // Prevent rendering if playerId is invalid to avoid weird API errors
    if (!playerId) return <div>Chargement...</div>;

    return (
        <GameProvider pseudo={pseudo} playerId={playerId}>
            <GameUI />
        </GameProvider>
    );
}

function GameUI() {
    const {
        playerId, pseudo,
        actions, actionSelectionnee, setActionSelectionnee,
        solde, patrimoine, portefeuille, shortPositions,
        dernierEvenement, regime, message, joueurs, insiderInfo,
        tensionLevel, tensionMessage, phaseMarche,
        handleQuitter, handleAcheter, handleVendre,
        handleRumeur, handleGeler, handleInsider,
        handleOuvrirShort, handleFermerShort
    } = useGameContext();

    // ── Form States (UI only) ────────────────────────────────────────────
    const [quantite, setQuantite] = useState(1);
    const [shortQuantite] = useState(1);
    const [rumeurAction, setRumeurAction] = useState(1);
    const [gelerCible, setGelerCible] = useState('');
    const [insiderAction, setInsiderAction] = useState(1);

    // Auto-select opponent for geler action if there's only 1 opponent
    useEffect(() => {
        if (!gelerCible && joueurs.length > 0) {
            const opponent = joueurs.find(j => j.id !== playerId);
            if (opponent) setGelerCible(opponent.id.toString());
        }
    }, [joueurs, playerId, gelerCible]);

    // ── Calculs utilitaires ──────────────────────────────────────────────
    const actionCourante = actions.find(a => a.id === actionSelectionnee);
    const maxAchetable = actionCourante ? Math.floor(solde / actionCourante.prix) : 0;
    const quantitePossedee = (actionCourante && portefeuille[actionSelectionnee]) ? portefeuille[actionSelectionnee].quantite : 0;
    const coutTotal = actionCourante ? (quantite * actionCourante.prix).toFixed(2) : '0.00';

    const getHistoriqueFormate = (action) => {
        if (!action?.historique) return [];
        return action.historique.map((point, i, arr) => {
            const ageTicks = arr.length - 1 - i;
            return {
                time: ageTicks,
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
                    <button className="bouton-vendre bouton-small" style={{marginLeft: '10px'}} onClick={handleQuitter}>🚪 Quitter</button>
                </div>
            </header>

            {/* ── Message flash et alertes en Floating Overlay ── */}
            <div style={{ position: 'fixed', top: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', zIndex: 9999, pointerEvents: 'none' }}>
                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            className="jeu-message"
                            style={{ position: 'relative', margin: 0, boxShadow: '0 8px 16px rgba(0,0,0,0.5)', pointerEvents: 'auto' }}
                        >
                            {message}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Insider Info (très visible) ── */}
                <AnimatePresence>
                    {insiderInfo && (
                        <motion.div
                            initial={{ opacity: 0, x: 50, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8, x: -50 }}
                            className="insider-info"
                            style={{
                                position: 'relative', margin: 0, background: 'rgba(255, 215, 0, 0.15)',
                                border: '2px solid #ffd700', borderRadius: '12px', padding: '12px 24px',
                                boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)', pointerEvents: 'auto'
                            }}
                        >
                            🔍 <strong>{insiderInfo.actionNom}</strong> : tendance <span className={`insider-tendance insider-${insiderInfo.tendance}`}>{insiderInfo.tendance}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Overlay Tension (Rouge clignotant progressif) ── */}
            <AnimatePresence>
                {tensionLevel > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.1, tensionLevel * 0.15, 0.1] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'red', pointerEvents: 'none', zIndex: 900, mixBlendMode: 'overlay' }}
                    />
                )}
            </AnimatePresence>

            {/* ── Contenu principal ── */}
            <div className="jeu-contenu">

                {/* Graphe */}
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
                                reversed={false}
                                minTickGap={20}
                                tickFormatter={(tick) => {
                                    if (tick === 0) return 'Dernier';
                                    if (tick === 60) return '-1m';
                                    if (tick === 119 || tick === 120) return '-2m';
                                    return '';
                                }}
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

                {/* Marché + Portefeuille */}
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
                                                    onClick={() => handleAcheter(a.id, quantite)}
                                                    disabled={solde < a.prix * quantite}
                                                    title={solde < a.prix * quantite ? 'Solde insuffisant' : ''}
                                                >
                                                    Acheter ({quantite})
                                                </button>
                                            </td>
                                            <td>
                                                <button className="bouton-vendre" onClick={() => handleVendre(a.id, quantite)}>
                                                    Vendre ({quantite})
                                                </button>
                                            </td>
                                            <td>
                                                <button className="bouton-short" onClick={() => handleOuvrirShort(a.id, shortQuantite)}>
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
                            <p className="portefeuille-vide">Tu ne possèdes aucune action pour l&apos;instant.</p>
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

                {/* Actions spéciales */}
                <section className="jeu-carte">
                    <h2 className="jeu-carte-titre">⚡ Actions Spéciales</h2>
                    <div className="special-grille">

                        <div className="special-carte">
                            <h3 className="special-titre">📢 Rumeur Positive</h3>
                            <p className="special-description">Fait monter le prix d&apos;une action. Coûte 500 €.</p>
                            <select className="special-selection" value={rumeurAction} onChange={e => setRumeurAction(parseInt(e.target.value))}>
                                {actions.map((a) => (
                                    <option key={a.id} value={a.id}>{a.nom}</option>
                                ))}
                            </select>
                            <button className="special-bouton special-bouton-vert" onClick={() => handleRumeur(rumeurAction, true)}>Lancer</button>
                        </div>

                        <div className="special-carte">
                            <h3 className="special-titre">📉 Rumeur Négative</h3>
                            <p className="special-description">Fait baisser le prix d&apos;une action. Coûte 500 €.</p>
                            <select className="special-selection" value={rumeurAction} onChange={e => setRumeurAction(parseInt(e.target.value))}>
                                {actions.map((a) => (
                                    <option key={a.id} value={a.id}>{a.nom}</option>
                                ))}
                            </select>
                            <button className="special-bouton special-bouton-rouge" onClick={() => handleRumeur(rumeurAction, false)}>Lancer</button>
                        </div>

                        <div className="special-carte">
                            <h3 className="special-titre">🧊 Geler un Joueur</h3>
                            <p className="special-description">Bloque un adversaire pendant 45s. Coûte 1000 €.</p>
                            <select
                                className="special-selection"
                                value={gelerCible}
                                onChange={e => setGelerCible(e.target.value)}
                            >
                                <option value="">Choisir un joueur</option>
                                {joueurs.filter(j => j.id !== playerId).map(j => (
                                    <option key={j.id} value={j.id}>{j.name}</option>
                                ))}
                            </select>
                            <button className="special-bouton special-bouton-bleu" onClick={() => handleGeler(gelerCible)}>Geler</button>
                        </div>

                        {/* Insider Trading */}
                        <div className="special-carte">
                            <h3 className="special-titre">🔍 Insider Trading</h3>
                            <p className="special-description">Révèle la tendance d&apos;une action pendant 10s. Coûte 1500 €. (2 max)</p>
                            <select className="special-selection" value={insiderAction} onChange={e => setInsiderAction(parseInt(e.target.value))}>
                                {actions.map((a) => (
                                    <option key={a.id} value={a.id}>{a.nom}</option>
                                ))}
                            </select>
                            <button className="special-bouton special-bouton-jaune" onClick={() => handleInsider(insiderAction)}>Révéler</button>
                        </div>

                    </div>
                </section>

            </div>
        </div>
    );
}
