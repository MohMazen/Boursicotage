class GameTimer {
    constructor() {
        this._timer    = null;
        this._start    = null;
        this._end      = null;
        this._onEnd    = null;
    }

    start(onEnd, minMin = 5, maxMin = 15) {
        if (this._timer) return false;

        const randomMinutes = Math.floor(Math.random() * (maxMin - minMin + 1)) + minMin;
        const duration  = randomMinutes * 60 * 1000;
        this._start     = Date.now();
        this._end       = this._start + duration;
        this._onEnd     = onEnd;

        this._timer = setTimeout(() => {
            this._onEnd?.();
            this._timer = null;
        }, duration);

        console.log(`[TIMER] Durée secrète : ${randomMinutes} min`);
        return true;
    }

    stop() {
        if (this._timer) { clearTimeout(this._timer); this._timer = null; }
    }

    getTempsEcoule()    { return this._start ? Date.now() - this._start : 0; }
    getDureeRestante()  { return this._end   ? Math.max(0, this._end - Date.now()) : 0; }
}

export default GameTimer;