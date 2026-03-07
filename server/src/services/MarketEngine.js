import Action      from '../models/Action.js';
import EventEngine from './EventEngine.js';

class Market {
    constructor() {
        this.actions     = this._initActions();
        this.eventEngine = new EventEngine(this.actions);
    }

    // ─── Initialisation ──────────────────────────────────────────────────────

    _initActions() {
        return [
            new Action(1, "TechCorp",    100, 'elevee'),
            new Action(2, "BioLife",      80, 'moyenne'),
            new Action(3, "EnergiePlus", 120, 'faible'),
            new Action(4, "CryptoX",      50, 'elevee'),
            new Action(5, "AgroSud",      90, 'faible'),
            new Action(6, "MediFuture",  110, 'moyenne'),
        ];
    }

    // ─── Cycle de vie ────────────────────────────────────────────────────────

    demarrer() {
        this._intervalFluctuation = setInterval(() => {
            this.actions.forEach(action => action.fluctuer());
        }, 3000);
        this.eventEngine.demarrer();
    }

    arreter() {
        clearInterval(this._intervalFluctuation);
        this._intervalFluctuation = null;
        this.eventEngine.arreter();
    }

    // ─── Délégation vers EventEngine ─────────────────────────────────────────

    getDernierEvenement() {
        return this.eventEngine.getDernierEvenement();
    }

    // ─── Accesseurs ──────────────────────────────────────────────────────────

    getAction(id) {
        return this.actions.find(a => a.id === id);
    }

    getAllActions() {
        return this.actions.map(a => a.toJSON());
    }
}

export default Market;