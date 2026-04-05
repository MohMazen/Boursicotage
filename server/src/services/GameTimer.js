/**
 * GameTimer — Gère le chronomètre d'une partie
 *
 * La durée est ALÉATOIRE (entre 3 et 8 minutes) et CACHÉE des joueurs.
 * Un événement `game:tension` est émis dans les 60 dernières secondes
 * pour stresser les joueurs sans révéler le temps exact.
 */
class GameTimer {
    constructor() {
        // Durée aléatoire entre 3 min (180 000 ms) et 8 min (480 000 ms)
        this.dureeMs    = Math.floor(180000 + Math.random() * 300000);
        this.startTime  = null;
        this.timeoutId  = null;
        this._tensionId = null;
        this._io        = null;   // référence Socket.IO pour émettre game:tension

        console.log(`[TIMER] Durée secrète générée : ${Math.floor(this.dureeMs / 1000)}s (${(this.dureeMs / 60000).toFixed(1)} min)`);
    }

    /**
     * Injecte l'instance Socket.IO pour émettre les événements de tension.
     */
    setIO(io) {
        this._io = io;
    }

    /**
     * Démarre le timer. Appelle `onFinish()` quand le temps est écoulé.
     * Planifie des événements `game:tension` dans les 60 dernières secondes.
     */
    start(onFinish) {
        this.startTime = Date.now();

        // Timer principal — fin de partie
        this.timeoutId = setTimeout(() => {
            onFinish();
        }, this.dureeMs);

        // Planifier les indices de tension dans les 60 dernières secondes
        this._planifierTension();
    }

    /**
     * Émet des signaux `game:tension` ambigus dans les 60 dernières secondes.
     * 3 signaux : à -60s, -35s, -15s (avec intensité croissante).
     */
    _planifierTension() {
        const tensionPoints = [
            { offset: 60000, level: 1, message: "Les marchés semblent instables..." },
            { offset: 35000, level: 2, message: "Tension croissante sur les marchés" },
            { offset: 15000, level: 3, message: "Alerte : clôture imminente possible" },
        ];

        for (const point of tensionPoints) {
            const delai = this.dureeMs - point.offset;
            if (delai > 0) {
                setTimeout(() => {
                    if (this._io && this.startTime) {
                        this._io.emit('game:tension', {
                            level:   point.level,
                            message: point.message
                        });
                        console.log(`[TIMER] Tension émise (niveau ${point.level})`);
                    }
                }, delai);
            }
        }
    }

    /**
     * Arrête le timer manuellement (fin anticipée).
     */
    stop() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    /**
     * Retourne le temps écoulé en millisecondes.
     */
    getTempsEcoule() {
        if (!this.startTime) return 0;
        return Date.now() - this.startTime;
    }

    /**
     * Retourne la durée totale (révélée uniquement APRÈS la fin de partie).
     */
    getDureeTotale() {
        return this.dureeMs;
    }

    /**
     * Retourne le temps restant en ms.
     * ⚠ NE JAMAIS EXPOSER cette valeur au client pendant la partie !
     */
    _getDureeRestante() {
        if (!this.startTime) return this.dureeMs;
        const restant = this.dureeMs - (Date.now() - this.startTime);
        return Math.max(0, restant);
    }
}

export default GameTimer;
