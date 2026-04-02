import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate }       from 'react-router-dom';
import { 
    AreaChart, Area, XAxis, YAxis, 
    ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { getSocket } from '../services/socket.js';
import { 
    ajouterJoueur, acheterAction, vendreAction, 
    getPortefeuille, demarrerPartie,
    repandreRumeur, insiderTrading, gelerJoueur,
    resetPartie
} from '../services/api.js';
import AnimatedBackground     from '../components/AnimatedBackground.jsx';
import './Game.css'; // On réutilise les styles de base du jeu
import './LocalMultiplayer.css'; // Avec des ajustements pour le split-screen


export default function LocalMultiplayer() {
    const navigate = useNavigate();
    
    // ── État Marché (Partagé) ───────────────────────────────────────────
    const [actions, setActions] = useState([]);
    const [actionSelectionnee, setActionSelectionnee] = useState(1);
    const [regime, setRegime] = useState({ regime: 'normal', label: 'Marché normal' });

    // ── État Joueur 1 ──────────────────────────────────────────────────
    const [p1, setP1] = useState({ id: null, solde: 10000, patrimoine: 10000, portefeuille: {} });
    
    // ── État Joueur 2 ──────────────────────────────────────────────────
    const [p2, setP2] = useState({ id: null, solde: 10000, patrimoine: 10000, portefeuille: {} });

    const initRef = useRef(false);

    useEffect(() => {
        if (initRef.current) return;
        initRef.current = true;

        const setup = async () => {
            try {
                await resetPartie();
                const res1 = await ajouterJoueur('Joueur 1 (Gauche)');
                const res2 = await ajouterJoueur('Joueur 2 (Droite)');

                setP1(prev => ({ ...prev, id: res1.data.joueur.id }));
                setP2(prev => ({ ...prev, id: res2.data.joueur.id }));

                await demarrerPartie();
            } catch (err) {
                console.error("Erreur setup local :", err);
            }
        };
        setup();
    }, []);

    const [p1Message, setP1Message] = useState('');
    const [p2Message, setP2Message] = useState('');

    const setTempMessage = useCallback((isP1, msg) => {
        if (isP1) {
            setP1Message(msg);
            setTimeout(() => setP1Message(''), 5000);
        } else {
            setP2Message(msg);
            setTimeout(() => setP2Message(''), 5000);
        }
    }, []);

    // ── Socket.IO — Marché Partagé ──────────────────────────────────────
    useEffect(() => {
        const socket = getSocket();
        socket.on('market:update', (data) => setActions(data.actions));
        socket.on('market:regime', (data) => setRegime(data));
        socket.on('game:end', (data) => navigate('/classement', { state: data }));
        socket.on('game:message', (data) => {
            if (data.playerId === p1.id) setTempMessage(true, `🧊 ${data.message}`);
            if (data.playerId === p2.id) setTempMessage(false, `🧊 ${data.message}`);
        });
        
        return () => {
            socket.off('market:update');
            socket.off('market:regime');
            socket.off('game:end');
            socket.off('game:message');
        };
    }, [navigate, p1.id, p2.id, setTempMessage]);

    // ── Rafraîchir Portefeuilles ─────────────────────────────────────────
    const refreshData = useCallback(async () => {
        if (!p1.id || !p2.id) return;
        try {
            const r1 = await getPortefeuille(p1.id);
            setP1(prev => ({ 
                ...prev, 
                solde: r1.data.solde, 
                patrimoine: r1.data.patrimoine, 
                portefeuille: r1.data.portefeuille 
            }));

            const r2 = await getPortefeuille(p2.id);
            setP2(prev => ({ 
                ...prev, 
                solde: r2.data.solde, 
                patrimoine: r2.data.patrimoine, 
                portefeuille: r2.data.portefeuille 
            }));
        } catch (err) { console.error(err); }
    }, [p1.id, p2.id]);

    // Fetch initial ou manuel après transaction (sans boucle de 3 secondes)
    useEffect(() => {
        refreshData();
    }, [refreshData]);

    // Calcul PnL + patrimoine en local basé sur l'évolution WebSockets du marché
    useEffect(() => {
        if (!actions.length) return;

        const updateState = (prev) => {
            if (!prev.id || Object.keys(prev.portefeuille).length === 0) return prev;
            let nouveauPatrimoine = prev.solde;
            let changed = false;
            const newPF = { ...prev.portefeuille };
            for (const id in newPF) {
                const ligne = newPF[id];
                const action = actions.find(a => a.id === parseInt(id));
                if (action) {
                    nouveauPatrimoine += ligne.quantite * action.prix;
                    if (ligne.prixActuel !== action.prix) {
                        ligne.prixActuel = action.prix;
                        ligne.valeurTotale = parseFloat((ligne.quantite * action.prix).toFixed(2));
                        ligne.plusValueLatente = parseFloat(((action.prix - ligne.prixMoyenAchat) * ligne.quantite).toFixed(2));
                        ligne.pourcentageEvolution = parseFloat((((action.prix - ligne.prixMoyenAchat) / ligne.prixMoyenAchat) * 100).toFixed(2));
                        changed = true;
                    }
                }
            }
            if (changed || Math.abs(prev.patrimoine - nouveauPatrimoine) > 0.01) {
                return { ...prev, portefeuille: newPF, patrimoine: nouveauPatrimoine };
            }
            return prev;
        };

        setP1(updateState);
        setP2(updateState);
    }, [actions]);

    // ── Trading Logic (Générique) ────────────────────────────────────────
    const trade = useCallback(async (playerId, actionId, type) => {
        try {
            if (type === 'achat') await acheterAction(playerId, actionId, 1);
            else await vendreAction(playerId, actionId, 1);
            refreshData();
        } catch (err) { 
            const msg = err.response?.data?.message || 'Erreur trading';
            setTempMessage(playerId === p1.id, `❌ ${msg}`);
        }
    }, [p1.id, refreshData, setTempMessage]);

    const specialAction = useCallback(async (playerId, type, data) => {
        try {
            if (type === 'rumeur') await repandreRumeur(playerId, actionSelectionnee, data.positif);
            if (type === 'insider') await insiderTrading(playerId, actionSelectionnee);
            if (type === 'geler')  await gelerJoueur(playerId, data.cibleId);
            refreshData();
        } catch (err) {
            const msg = err.response?.data?.message || 'Erreur action';
            setTempMessage(playerId === p1.id, `❌ ${msg}`);
        }
    }, [p1.id, actionSelectionnee, refreshData, setTempMessage]);

    // ── Keyboard Shortcuts (Raccourcis duel) ──────────────────────────────
    useEffect(() => {
        const handleKeys = (e) => {
            const key = e.key.toLowerCase();
            if (!p1.id || !p2.id) return;
            
            // ── J1 : GAUCHE ──
            if (key === 'a') trade(p1.id, actionSelectionnee, 'achat');
            if (key === 'e') trade(p1.id, actionSelectionnee, 'vente');
            if (key === 'z') setActionSelectionnee(prev => (prev % actions.length) + 1);
            if (key === 'q') specialAction(p1.id, 'rumeur', { positif: true });
            if (key === 's') specialAction(p1.id, 'rumeur', { positif: false });
            if (key === 'd') specialAction(p1.id, 'insider');
            if (key === 'x') specialAction(p1.id, 'geler', { cibleId: p2.id });

            // ── J2 : DROITE ──
            if (key === 'i') trade(p2.id, actionSelectionnee, 'achat');
            if (key === 'p') trade(p2.id, actionSelectionnee, 'vente');
            if (key === 'o') setActionSelectionnee(prev => (prev % actions.length) + 1);
            if (key === 'k') specialAction(p2.id, 'rumeur', { positif: true });
            if (key === 'l') specialAction(p2.id, 'rumeur', { positif: false });
            if (key === 'm') specialAction(p2.id, 'insider');
            if (key === 'n') specialAction(p2.id, 'geler', { cibleId: p1.id });
        };

        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [p1.id, p2.id, actionSelectionnee, actions.length, specialAction, trade]);

    // ── Calculs Formats Graphe ────────────────────────────────────────────
    const actionCourante = actions.find(a => a.id === actionSelectionnee);
    const getHistoriqueFormate = (action) => {
        if (!action?.historique) return [];
        return action.historique.map((point, i, arr) => ({
            time: arr.length - 1 - i,
            prix: point.prix
        }));
    };

    const handleQuitterDuel = async () => {
        try { await resetPartie(); } catch (e) { console.error(e); }
        navigate('/');
    };

    return (
        <div className="jeu-page local-multiplayer">
            <AnimatedBackground />

            {/* Header Commun */}
            <header className="jeu-entete local-header">
                <div className="header-duel-info">
                    <span className="logo-duel">⚔️ DUEL LOCAL</span>
                    <div className="phase-shared">🏦 {regime.label}</div>
                    <button className="btn-quit" onClick={handleQuitterDuel}>Quitter le duel</button>
                </div>
            </header>

            {/* Zone Graphique Commune (Milieu) */}
            <div className="shared-market-zone">
                <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={getHistoriqueFormate(actionCourante)}>
                        <defs>
                            <linearGradient id="colorDuel" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00ff88" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#21262d" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="time" hide reversed={false} />
                        <YAxis stroke="#8b949e" domain={['auto', 'auto']} orientation="right" width={40} />
                        <Area type="linear" dataKey="prix" stroke="#00ff88" strokeWidth={3} fillOpacity={1} fill="url(#colorDuel)" />
                    </AreaChart>
                </ResponsiveContainer>
                <div className="shared-action-name">
                   📈 {actionCourante?.nom || 'Chargement...'} : {actionCourante?.prix.toFixed(2)} €
                </div>
            </div>

            {/* Split Screen Bottom */}
            <div className="split-view">
                
                {/* Joueur 1 (Gauche) */}
                <section className="player-panel player-left">
                    <div className="player-header">
                        <span className="p-tag">J1 (GAUCHE)</span>
                        <div className="p-wealth">📊 {p1.patrimoine.toFixed(0)} €</div>
                    </div>
                    <div className="p-cash">💰 Cash: {p1.solde.toFixed(2)} €</div>
                    {p1Message && <div className="jeu-message" style={{position: 'static', margin: '10px 0', fontSize: '0.9rem'}}>{p1Message}</div>}
                    
                    <div className="p-shortcuts">
                        <span><strong>(A)</strong> Achat</span>
                        <span><strong>(E)</strong> Vente</span>
                        <span><strong>(Z)</strong> Stock</span>
                        <span><strong>(Q/S)</strong> +/-</span>
                        <span><strong>(D)</strong> Info</span>
                        <span><strong>(X)</strong> GEL</span>
                    </div>

                    <div className="p-portfolio">
                        {Object.entries(p1.portefeuille).map(([id, p]) => (
                            <div key={id} className="p-stock-line">
                                <span>{p.nom} : <strong>{p.quantite}</strong></span>
                                <span className={p.plusValueLatente >= 0 ? 'pos' : 'neg'}>
                                    ({p.plusValueLatente >= 0 ? '+' : ''}{p.plusValueLatente.toFixed(0)}€)
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Joueur 2 (Droite) */}
                <section className="player-panel player-right">
                    <div className="player-header">
                        <span className="p-tag">J2 (DROITE)</span>
                        <div className="p-wealth">📊 {p2.patrimoine.toFixed(0)} €</div>
                    </div>
                    <div className="p-cash">💰 Cash: {p2.solde.toFixed(2)} €</div>
                    {p2Message && <div className="jeu-message" style={{position: 'static', margin: '10px 0', fontSize: '0.9rem'}}>{p2Message}</div>}

                    <div className="p-shortcuts">
                        <span><strong>(I)</strong> Achat</span>
                        <span><strong>(P)</strong> Vente</span>
                        <span><strong>(O)</strong> Stock</span>
                        <span><strong>(K/L)</strong> +/-</span>
                        <span><strong>(M)</strong> Info</span>
                        <span><strong>(N)</strong> GEL</span>
                    </div>

                    <div className="p-portfolio">
                        {Object.entries(p2.portefeuille).map(([id, p]) => (
                            <div key={id} className="p-stock-line">
                                <span>{p.nom} : <strong>{p.quantite}</strong></span>
                                <span className={p.plusValueLatente >= 0 ? 'pos' : 'neg'}>
                                    ({p.plusValueLatente >= 0 ? '+' : ''}{p.plusValueLatente.toFixed(0)}€)
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

            </div>

        </div>
    );
}
