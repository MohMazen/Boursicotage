import  Stock     from '../models/Stock.js';
import EventEngine from './EventEngine.js';

class Market {
    constructor() {
        this.stocks     = this._initStocks();
        this.eventEngine = new EventEngine(this.stocks);
    }

    // ─── Initialisation ──────────────────────────────────────────────────────

    _initStocks() {
        return [
            new Stock(1, "TechCorp",    100, 'elevee'),
            new Stock(2, "BioLife",      80, 'moyenne'),
            new Stock(3, "EnergiePlus", 120, 'faible'),
            new Stock(4, "CryptoX",      50, 'elevee'),
            new Stock(5, "AgroSud",      90, 'faible'),
            new Stock(6, "MediFuture",  110, 'moyenne'),
        ];
    }

    // ─── Cycle de vie ────────────────────────────────────────────────────────

    demarrer() {
        this._intervalFluctuation = setInterval(() => {
            this.stocks.forEach(stock => stock.fluctuer());
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

    getStock(id) {
        return this.stocks.find(s => s.id === id);
    }

    getAllStocks() {
        return this.stocks.map(s => s.toJSON());
    }
}

export default Market;