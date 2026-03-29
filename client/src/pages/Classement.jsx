import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import AnimatedBackground from '../components/AnimatedBackground.jsx';
import './Classement.css';

const medailles = ['🥇', '🥈', '🥉'];

export default function Classement() {
    const navigate = useNavigate();
    const location = useLocation();
    const [revealIndex, setRevealIndex] = useState(-1);

    // Données reçues via navigation state (émises par game:end)
    const data = location.state || {};
    const classement = useMemo(() => data.classement || [], [data.classement]);
    const stats = data.stats || {};
    const dureePartie = data.dureePartie || stats.dureePartie;

    // ── Animation de reveal progressif ── 
    useEffect(() => {
        if (classement.length === 0) return;

        // Reveal du dernier au premier
        const reversed = [...classement].reverse();
        reversed.forEach((_, i) => {
            setTimeout(() => {
                setRevealIndex(classement.length - 1 - i);
            }, 800 * (i + 1));
        });

        // Confettis quand le vainqueur est révélé
        setTimeout(() => {
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6, x: 0.5 },
                colors: ['#00ff88', '#00c9ff', '#ffd93d', '#c084fc']
            });

            // Deuxième burst
            setTimeout(() => {
                confetti({
                    particleCount: 80,
                    spread: 60,
                    origin: { y: 0.7, x: 0.3 }
                });
                confetti({
                    particleCount: 80,
                    spread: 60,
                    origin: { y: 0.7, x: 0.7 }
                });
            }, 400);
        }, 800 * classement.length + 200);
    }, [classement, classement.length]);

    const formatDuree = (ms) => {
        if (!ms) return '—';
        const totalSecs = Math.floor(ms / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        return `${mins}m ${secs.toString().padStart(2, '0')}s`;
    };

    return (
        <div className="classement-page">
            <AnimatedBackground />

            <div className="classement-contenu">
                <h1 className="classement-titre">🏁 Fin de Partie</h1>
                <p className="classement-sous-titre">Classement final</p>

                {/* ── Durée révélée ── */}
                {dureePartie && (
                    <div className="classement-duree">
                        ⏱ Durée de la partie : <strong>{formatDuree(dureePartie)}</strong>
                    </div>
                )}

                {/* ── Podium ── */}
                <div className="podium">
                    {classement.map((joueur, index) => (
                        <div
                            key={joueur.id}
                            className={`podium-carte ${index === 0 ? 'podium-premier' : ''} ${revealIndex <= index ? 'podium-visible' : 'podium-hidden'}`}
                            style={{ '--delay': `${index * 0.1}s` }}
                        >
                            <span className="podium-medaille">{medailles[index] || `#${index + 1}`}</span>
                            <span className="podium-nom">{joueur.name}</span>
                            <span className="podium-patrimoine">{joueur.patrimoine.toFixed(2)} €</span>
                            <span className="podium-solde">Cash : {joueur.solde.toFixed(2)} €</span>
                        </div>
                    ))}
                </div>

                {/* ── Statistiques par joueur ── */}
                {stats.joueurs && (
                    <div className="stats-section">
                        <h2 className="stats-titre">📊 Statistiques de Trading</h2>
                        <div className="stats-grille">
                            {Object.entries(stats.joueurs).map(([id, s]) => (
                                <div key={id} className="stats-carte">
                                    <h3 className="stats-joueur-nom">{s.name}</h3>
                                    <div className="stats-liste">
                                        <div className="stats-item">
                                            <span className="stats-label">Transactions</span>
                                            <span className="stats-valeur">{s.nbTransactions}</span>
                                        </div>
                                        {s.meilleureTransaction && (
                                            <div className="stats-item">
                                                <span className="stats-label">Meilleur trade</span>
                                                <span className="stats-valeur positif">
                                                    +{s.meilleureTransaction.gain.toFixed(2)} € ({s.meilleureTransaction.actionNom})
                                                </span>
                                            </div>
                                        )}
                                        {s.actionPlusTradee && (
                                            <div className="stats-item">
                                                <span className="stats-label">Action favorite</span>
                                                <span className="stats-valeur">{s.actionPlusTradee.nom} ({s.actionPlusTradee.count}×)</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button className="classement-bouton" onClick={() => navigate('/')}>
                    🔄 Rejouer
                </button>
            </div>
        </div>
    );
}
