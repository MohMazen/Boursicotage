import { useState, useEffect, useCallback } from 'react';
import { useNavigate }       from 'react-router-dom';
import { 
    AreaChart, Area, XAxis, YAxis, Tooltip, 
    ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { getSocket, reconnectSocket } from '../services/socket.js';
import { 
    ajouterJoueur, acheterAction, vendreAction, 
    getPortefeuille, demarrerPartie 
} from '../services/api.js';
import AnimatedBackground     from '../components/AnimatedBackground.jsx';
import './Game.css'; // On réutilise les styles de base du jeu
import './LocalMultiplayer.css'; // Avec des ajustements pour le split-screen

const COULEURS_ACTIONS = ['#00ff88', '#00c9ff', '#ff6b6b', '#ffd93d', '#c084fc'];

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

    const [message, setMessage] = useState('');

    // ── Initialisation — Inscription 2 Joueurs ───────────────────────────
    useEffect(() => {
        const setup = async () => {
            try {
                // On s'assure d'être sur localhost pour le split-screen sans sessionToken bloquant ?
                // On utilise des pseudos uniques pour forcer la création locale
                const res1 = await ajouterJoueur('Joueur 1 (Gauche)');
                const res2 = await ajouterJoueur('Joueur 2 (Droite)');

                setP1(prev => ({ ...prev, id: res1.data.joueur.id }));
                setP2(prev => ({ ...prev, id: res2.data.joueur.id }));

                // On démarre la partie immédiatement (mode local arcade)
                await demarrerPartie();
            } catch (err) {
                console.error("Erreur setup local :", err);
                setMessage("❌ Erreur d'initialisation du duel local");
            }
        };
        setup();
    }, []);

    // ── Socket.IO — Marché Partagé ──────────────────────────────────────
    useEffect(() => {
        const socket = getSocket();
        socket.on('market:update', (data) => setActions(data.actions));
        socket.on('market:regime', (data) => setRegime(data));
        socket.on('game:end', (data) => navigate('/classement', { state: data }));
        
        return () => {
            socket.off('market:update');
            socket.off('market:regime');
            socket.off('game:end');
        };
    }, [navigate]);

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
        } catch {}
    }, [p1.id, p2.id]);

    useEffect(() => {
        const interval = setInterval(refreshData, 2000);
        return () => clearInterval(interval);
    }, [refreshData]);

    // ── Trading Logic (Générique) ────────────────────────────────────────
    const trade = async (playerId, actionId, type) => {
        try {
            if (type === 'achat') await acheterAction(playerId, actionId, 1);
            else await vendreAction(playerId, actionId, 1);
            refreshData();
        } catch {}
    };

    const specialAction = async (playerId, type, data) => {
        try {
            if (type === 'rumeur') await repandreRumeur(playerId, actionSelectionnee, data.positif);
            if (type === 'insider') await insiderTrading(playerId, actionSelectionnee);
            if (type === 'geler')  await gelerJoueur(playerId, data.cibleId);
            refreshData();
        } catch {}
    };

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
    }, [p1.id, p2.id, actionSelectionnee, actions.length]);

    // ── Calculs Formats Graphe ────────────────────────────────────────────
    const actionCourante = actions.find(a => a.id === actionSelectionnee);
    const getHistoriqueFormate = (action) => {
        if (!action?.historique) return [];
        return action.historique.map((point, i, arr) => ({
            time: arr.length - 1 - i,
            prix: point.prix
        }));
    };

    return (
        <div className="jeu-page local-multiplayer">
            <AnimatedBackground />

            {/* Header Commun */}
            <header className="jeu-entete local-header">
                <div className="header-duel-info">
                    <span className="logo-duel">⚔️ DUEL LOCAL</span>
                    <div className="phase-shared">🏦 {regime.label}</div>
                    <button className="btn-quit" onClick={() => navigate('/')}>Quitter le duel</button>
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
                        <XAxis dataKey="time" hide reversed={true} />
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
