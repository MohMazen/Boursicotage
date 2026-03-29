import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../services/socket.js';
import {
    acheterAction, vendreAction, repandreRumeur, gelerJoueur,
    insiderTrading, ouvrirShort, fermerShort,
    getPortefeuille, getShortPositions as fetchShortPositions, quitterPartie,
    getEtatPartie
} from '../services/api.js';

const GameContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useGameContext = () => useContext(GameContext);

export const GameProvider = ({ children, pseudo, playerId }) => {
    const navigate = useNavigate();

    // ── État principal ───────────────────────────────────────────────────
    const [actions, setActions] = useState([]);
    const [actionSelectionnee, setActionSelectionnee] = useState(1);
    const [solde, setSolde] = useState(10000);
    const [patrimoine, setPatrimoine] = useState(10000);
    const [portefeuille, setPortefeuille] = useState({});
    const [shortPositions, setShortPositions] = useState({});
    const [dernierEvenement, setDernierEvenement] = useState(null);
    const [regime, setRegime] = useState({ regime: 'normal', label: 'Marché normal' });

    // ── Actions spéciales ────────────────────────────────────────────────
    const [message, setMessage] = useState('');
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
            if (data.joueurs) setJoueurs(data.joueurs);
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
        } catch (error) { console.error(error); }
        try {
            const res = await fetchShortPositions(playerId);
            setShortPositions(res.data.shorts || {});
        } catch (error) { console.error(error); }
    }, [playerId]);

    // Fetch initial au montage
    useEffect(() => {
        refreshPortefeuille();
        getEtatPartie().then(res => {
            if (res.data.actions) setActions(res.data.actions);
            if (res.data.regime) setRegime(res.data.regime);
            if (res.data.joueurs) setJoueurs(res.data.joueurs);
        }).catch(err => console.error(err));
    }, [refreshPortefeuille]);

    // Recalcul local du patrimoine et des PnL pour éviter le Polling HTTP de 3 secondes
    useEffect(() => {
        if (!actions.length) return;

        let nouveauPatrimoine = solde;
        let pFChanged = false;
        let sPChanged = false;

        const newPortefeuille = { ...portefeuille };
        for (const id in newPortefeuille) {
            const ligne = newPortefeuille[id];
            const action = actions.find(a => a.id === parseInt(id));
            if (action) {
                nouveauPatrimoine += ligne.quantite * action.prix;
                if (ligne.prixActuel !== action.prix) {
                    ligne.prixActuel = action.prix;
                    ligne.valeurTotale = parseFloat((ligne.quantite * action.prix).toFixed(2));
                    ligne.plusValueLatente = parseFloat(((action.prix - ligne.prixMoyenAchat) * ligne.quantite).toFixed(2));
                    ligne.pourcentageEvolution = parseFloat((((action.prix - ligne.prixMoyenAchat) / ligne.prixMoyenAchat) * 100).toFixed(2));
                    pFChanged = true;
                }
            }
        }

        const newShortPositions = { ...shortPositions };
        for (const id in newShortPositions) {
            const pos = newShortPositions[id];
            const action = actions.find(a => a.id === parseInt(id));
            if (action) {
                if (pos.prixActuel !== action.prix) {
                    pos.prixActuel = action.prix;
                    pos.pnlLatent = parseFloat(((pos.prixEntree - action.prix) * pos.quantite).toFixed(2));
                    pos.pourcentage = parseFloat((((pos.prixEntree - action.prix) / pos.prixEntree) * 100).toFixed(2));
                    sPChanged = true;
                }
            }
        }

        if (pFChanged) setPortefeuille(newPortefeuille);
        if (sPChanged) setShortPositions(newShortPositions);
        
        // Mettre à jour le patrimoine si nécessaire, avec une tolérance pour les flottants
        if (Math.abs(patrimoine - nouveauPatrimoine) > 0.01) {
            setPatrimoine(nouveauPatrimoine);
        }
    }, [actions, solde]); // recalculer à chaque tick marché ou changement de solde

    // ── Fonctions de trading ─────────────────────────────────────────────
    const handleQuitter = async () => {
        try {
            await quitterPartie(playerId);
            navigate('/');
        } catch (err) { console.error(err); }
    };

    const handleAcheter = async (actionId, quantite) => {
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

    const handleVendre = async (actionId, quantite) => {
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

    const handleRumeur = async (rumeurAction, positif) => {
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

    const handleGeler = async (gelerCible) => {
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

    const handleInsider = async (insiderAction) => {
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

    const handleOuvrirShort = async (actionId, shortQuantite) => {
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

    const contextValue = {
        playerId, pseudo,
        actions, setActions,
        actionSelectionnee, setActionSelectionnee,
        solde, patrimoine, portefeuille, shortPositions,
        dernierEvenement, regime, message, joueurs, insiderInfo,
        tensionLevel, tensionMessage, phaseMarche,
        handleQuitter, handleAcheter, handleVendre,
        handleRumeur, handleGeler, handleInsider,
        handleOuvrirShort, handleFermerShort
    };

    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    );
};
