import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import './Game.css';

// Données fictives
const actions = [
    { id: 1, nom: 'TechCorp',   prix: 142.30, evolution: 2.4  },
    { id: 2, nom: 'EnergiePlus',prix: 87.50,  evolution: -1.2 },
    { id: 3, nom: 'BioSanté',   prix: 210.00, evolution: 0.8  },
    { id: 4, nom: 'FinanceX',   prix: 56.75,  evolution: -3.1 },
    { id: 5, nom: 'AutoDrive',  prix: 325.10, evolution: 5.0  },
];

const historique = {
    1: [
        { time: '00:00', prix: 138 },
        { time: '01:00', prix: 140 },
        { time: '02:00', prix: 139 },
        { time: '03:00', prix: 142 },
        { time: '04:00', prix: 141 },
        { time: '05:00', prix: 142.30 },
    ],
    2: [
        { time: '00:00', prix: 90 },
        { time: '01:00', prix: 89 },
        { time: '02:00', prix: 88.5 },
        { time: '03:00', prix: 87 },
        { time: '04:00', prix: 88 },
        { time: '05:00', prix: 87.50 },
    ],
    3: [
        { time: '00:00', prix: 205 },
        { time: '01:00', prix: 208 },
        { time: '02:00', prix: 212 },
        { time: '03:00', prix: 211 },
        { time: '04:00', prix: 209 },
        { time: '05:00', prix: 210 },
    ],
    4: [
        { time: '00:00', prix: 62 },
        { time: '01:00', prix: 60 },
        { time: '02:00', prix: 59 },
        { time: '03:00', prix: 58 },
        { time: '04:00', prix: 57 },
        { time: '05:00', prix: 56.75 },
    ],
    5: [
        { time: '00:00', prix: 300 },
        { time: '01:00', prix: 310 },
        { time: '02:00', prix: 315 },
        { time: '03:00', prix: 320 },
        { time: '04:00', prix: 322 },
        { time: '05:00', prix: 325.10 },
    ],
};

const portefeuille = [
    { id: 1, nom: 'TechCorp',    quantite: 3, prixAchat: 138.00, prixActuel: 142.30 },
    { id: 3, nom: 'BioSanté',    quantite: 1, prixAchat: 215.00, prixActuel: 210.00 },
];

export default function Game() {
    const [searchParams] = useSearchParams();
    const pseudo = searchParams.get('pseudo') || 'Joueur';
    const [actionSelectionnee, setActionSelectionnee] = useState(1);

    return (
        <div className="game-page">

            {/* ── Header ── */}
            <header className="game-header">
                <div className="game-header-left">
                    <span className="game-logo">📈 Boursicotage</span>
                </div>
                <div className="game-header-center">
                    <div className="game-timer">⏱ 05:00</div>
                </div>
                <div className="game-header-right">
                    <span className="game-pseudo">{pseudo}</span>
                    <span className="game-solde">💰 10 000 €</span>
                </div>
            </header>

            {/* ── Contenu principal ── */}
            <div className="game-content">

                {/* ── Graphe (haut) ── */}
                <section className="game-card">
                    <h2 className="game-card-title">📉 Historique des prix</h2>
                    <div className="graphe-selecteurs">
                        {actions.map((a) => (
                            <button
                                key={a.id}
                                className={`graphe-btn ${actionSelectionnee === a.id ? 'graphe-btn-actif' : ''}`}
                                onClick={() => setActionSelectionnee(a.id)}
                            >
                                {a.nom}
                            </button>
                        ))}
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={historique[actionSelectionnee]}>
                            <CartesianGrid stroke="#21262d" />
                            <XAxis dataKey="time" stroke="#8b949e" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#8b949e" tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '8px' }}
                                labelStyle={{ color: '#8b949e' }}
                                itemStyle={{ color: '#00ff88' }}
                            />
                            <Line type="monotone" dataKey="prix" stroke="#00ff88" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </section>

                {/* ── Marché + Portefeuille (milieu, côte à côte) ── */}
                <div className="game-milieu">

                    {/* Marché gauche */}
                    <section className="game-card">
                        <h2 className="game-card-title">📊 Marché</h2>
                        <table className="market-table">
                            <thead>
                                <tr>
                                    <th>Action</th>
                                    <th>Prix</th>
                                    <th>Évolution</th>
                                    <th>Acheter</th>
                                    <th>Vendre</th>
                                </tr>
                            </thead>
                            <tbody>
                                {actions.map((a) => (
                                    <tr key={a.id}>
                                        <td className="market-nom">{a.nom}</td>
                                        <td className="market-prix">{a.prix.toFixed(2)} €</td>
                                        <td className={a.evolution >= 0 ? 'positive' : 'negative'}>
                                            {a.evolution >= 0 ? '▲' : '▼'} {Math.abs(a.evolution).toFixed(1)}%
                                        </td>
                                        <td><button className="btn-acheter">Acheter</button></td>
                                        <td><button className="btn-vendre">Vendre</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    {/* Portefeuille droite */}
                    <section className="game-card">
                        <h2 className="game-card-title">💼 Mon Portefeuille</h2>
                        {portefeuille.length === 0 ? (
                            <p className="portefeuille-vide">Tu ne possèdes aucune action pour l'instant.</p>
                        ) : (
                            <table className="market-table">
                                <thead>
                                    <tr>
                                        <th>Action</th>
                                        <th>Quantité</th>
                                        <th>Prix d'achat</th>
                                        <th>Prix actuel</th>
                                        <th>Gain / Perte</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {portefeuille.map((p) => {
                                        const gain = (p.prixActuel - p.prixAchat) * p.quantite;
                                        return (
                                            <tr key={p.id}>
                                                <td className="market-nom">{p.nom}</td>
                                                <td>{p.quantite}</td>
                                                <td>{p.prixAchat.toFixed(2)} €</td>
                                                <td>{p.prixActuel.toFixed(2)} €</td>
                                                <td className={gain >= 0 ? 'positive' : 'negative'}>
                                                    {gain >= 0 ? '+' : ''}{gain.toFixed(2)} €
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </section>

                </div>

                {/* ── Actions spéciales (bas) ── */}
                <section className="game-card">
                    <h2 className="game-card-title">⚡ Actions Spéciales</h2>
                    <div className="special-grid">

                        {/* Rumeur positive */}
                        <div className="special-card">
                            <h3 className="special-titre">📢 Rumeur Positive</h3>
                            <p className="special-desc">Fait monter le prix d'une action. Coûte 500 €.</p>
                            <select className="special-select">
                                {actions.map((a) => (
                                    <option key={a.id} value={a.id}>{a.nom}</option>
                                ))}
                            </select>
                            <button className="special-btn special-btn-vert">Lancer</button>
                        </div>

                        {/* Rumeur négative */}
                        <div className="special-card">
                            <h3 className="special-titre">📉 Rumeur Négative</h3>
                            <p className="special-desc">Fait baisser le prix d'une action. Coûte 500 €.</p>
                            <select className="special-select">
                                {actions.map((a) => (
                                    <option key={a.id} value={a.id}>{a.nom}</option>
                                ))}
                            </select>
                            <button className="special-btn special-btn-rouge">Lancer</button>
                        </div>

                        {/* Geler un joueur */}
                        <div className="special-card">
                            <h3 className="special-titre">🧊 Geler un Joueur</h3>
                            <p className="special-desc">Bloque un adversaire pendant 45s. Coûte 1000 €.</p>
                            <select className="special-select">
                                <option value="2">Bob</option>
                            </select>
                            <button className="special-btn special-btn-bleu">Geler</button>
                        </div>

                    </div>
                </section>

            </div>
        </div>
    );
}
