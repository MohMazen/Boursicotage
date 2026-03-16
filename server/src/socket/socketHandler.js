import game from '../instance/game_instance.js';

/**
 * socketHandler — branche Socket.io sur l'instance de jeu.
 *
 * Événements émis vers les clients :
 *   market:update   → cours de toutes les actions (toutes les 3 s via MarketEngine)
 *   market:event    → événement de marché aléatoire (toutes les 30 s)
 *   game:end        → classement final
 *   player:update   → portefeuille mis à jour après transaction
 *
 * Événements reçus depuis les clients :
 *   player:buy      → { playerId, actionId, quantite }
 *   player:sell     → { playerId, actionId, quantite }
 *   player:rumeur   → { playerId, actionId, positif }
 */
export const initSocket = (io) => {

    // ── Diffusion des cours toutes les 3 secondes ─────────────────────────────
    setInterval(() => {
        if (!game.started) return;
        io.emit('market:update', { actions: game.market.getAllStocks() });
    }, 3000);
// ── Callback d'événement de marché → émis à chaque événement aléatoire ───────
    game.market.setOnEvenement((evenement) => {
    io.emit('market:event', { evenement });
    io.emit('market:update', { actions: game.market.getAllStocks() });
    });

    // ── Callback de fin de partie → émis une seule fois ──────────────────────
    game.setOnGameEnd((classement) => {
        io.emit('game:end', { classement });
    });

    // ── Connexion d'un client ─────────────────────────────────────────────────
    io.on('connection', (socket) => {
        console.log(`[SOCKET] Client connecté : ${socket.id}`);

        // Envoie l'état actuel au nouveau client
        socket.emit('game:state', game.getGameState());

        // ── Achat ─────────────────────────────────────────────────────────────
        socket.on('player:buy', ({ playerId, actionId, quantite }) => {
            const result = game.acheter(playerId, actionId, parseInt(quantite));
            socket.emit('player:update', result);

            if (result.success) {
                // Diffuse le portefeuille mis à jour au joueur concerné
                console.log(`[SOCKET] Achat : joueur ${playerId}, action ${actionId} x${quantite}`);
            }
        });

        // ── Vente ──────────────────────────────────────────────────────────────
        socket.on('player:sell', ({ playerId, actionId, quantite }) => {
            const result = game.vendre(playerId, actionId, parseInt(quantite));
            socket.emit('player:update', result);

            if (result.success) {
                console.log(`[SOCKET] Vente : joueur ${playerId}, action ${actionId} x${quantite}`);
            }
        });

        // ── Action spéciale : rumeur ───────────────────────────────────────────
        socket.on('player:rumeur', ({ playerId, actionId, positif }) => {
        const result = game.repandreRumeur(parseInt(playerId), parseInt(actionId), positif);
        socket.emit('player:update', result);

        if (result.success) {
        // Les cours mis à jour immédiatement
            io.emit('market:update', { actions: game.market.getAllStocks() });
            console.log(`[SOCKET] Rumeur : joueur ${playerId} sur action ${actionId}`);
        }
    });

        socket.on('disconnect', () => {
            console.log(`[SOCKET] Client déconnecté : ${socket.id}`);
        });
    });
};