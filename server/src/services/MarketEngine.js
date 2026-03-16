import Stock       from '../models/Stock.js';
import EventEngine from './EventEngine.js';

class Market {
    constructor() {
        this.stocks      = this._initStocks();
        this.eventEngine = new EventEngine(this.stocks);
        this._intervalFluctuation = null;
        this._intervalTendance = null;
    }

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

    demarrer() {
        this._intervalFluctuation = setInterval(() => {
            this.stocks.forEach(stock => stock.fluctuer());
        }, 3000);
        this.eventEngine.demarrer();
        this._intervalTendance = setInterval(() => {
        this.stocks.forEach(stock => {
            stock._tendance = (Math.random() * 0.02 - 0.01); // entre -1% et +1% de tendance
        });
    }, 120000);
    }

    arreter() {
        clearInterval(this._intervalFluctuation);
        this._intervalFluctuation = null;
        clearInterval(this._intervalTendance);
        this._intervalTendance = null;
        this.eventEngine.arreter();
    }

    getDernierEvenement()        { return this.eventEngine.getDernierEvenement(); }
    setDernierEvenement(ev)      { this.eventEngine.setDernierEvenement(ev); }
    setOnEvenement(cb)           { this.eventEngine.setOnEvenement(cb); }
    getFausseInfo(positif)       { return this.eventEngine.getFausseInfo(positif); }
    getStock(id)                 { return this.stocks.find(s => s.id === id); }
    getAllStocks()                { return this.stocks.map(s => s.toJSON()); }
}

export default Market;