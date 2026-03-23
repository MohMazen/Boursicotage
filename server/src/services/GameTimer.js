/**
 * GameTimer — Gère le chronomètre d'une partie
 * Durée par défaut : 5 minutes (300 000 ms)
 */
class GameTimer {
    constructor(dureeMs = 5 * 60 * 1000) {
        this.dureeMs   = dureeMs;
        this.startTime = null;
        this.timeoutId = null;
    }

    /**
     * Démarre le timer. Appelle `onFinish()` quand le temps est écoulé.
     */
    start(onFinish) {
        this.startTime = Date.now();
        this.timeoutId = setTimeout(() => {
            onFinish();
        }, this.dureeMs);
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
     * Retourne le temps restant en millisecondes.
     */
    getDureeRestante() {
        if (!this.startTime) return this.dureeMs;
        const restant = this.dureeMs - (Date.now() - this.startTime);
        return Math.max(0, restant);
    }
}

export default GameTimer;
