/**
 * GameTimer - Gère le timer aléatoire de fin de partie
 * La durée est secrète, personne ne sait quand ça s'arrête !
 */

class GameTimer {
  constructor(minDuration = 5 * 60 * 1000, maxDuration = 15 * 60 * 1000) {
    this.minDuration = minDuration; // 5 minutes par défaut
    this.maxDuration = maxDuration; // 15 minutes par défaut
    this.duration = 0;
    this.startTime = null;
    this.timerId = null;
    this.onEndCallback = null;
  }

  /**
   * Démarre le timer avec une durée aléatoire
   */
  start(onEnd) {
    // Génère une durée aléatoire entre min et max
    this.duration = Math.random() * (this.maxDuration - this.minDuration) + this.minDuration;
    this.startTime = Date.now();
    this.onEndCallback = onEnd;

    console.log(`⏱️  Timer démarré : partie terminera dans ${Math.round(this.duration / 1000)}s (secret !)`);

    // Programme la fin de partie
    this.timerId = setTimeout(() => {
      this.triggerEnd();
    }, this.duration);
  }

  /**
   * Déclenche la fin de partie
   */
  triggerEnd() {
    console.log('🏁 FIN DE PARTIE !');
    if (this.onEndCallback) {
      this.onEndCallback();
    }
  }

  /**
   * Annule le timer
   */
  cancel() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
      console.log('❌ Timer annulé');
    }
  }

  /**
   * Retourne le temps écoulé (en ms)
   */
  getElapsedTime() {
    if (!this.startTime) return 0;
    return Date.now() - this.startTime;
  }
}

module.exports = GameTimer;
