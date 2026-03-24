import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground.jsx';
import './Classement.css';

// Données fictives
const classement = [
    { id: 1, name: 'Alice',   patrimoine: 14320.50 },
    { id: 2, name: 'Bob',     patrimoine: 11200.00 },
    { id: 3, name: 'Charlie', patrimoine: 9800.75  },
];

const medailles = ['🥇', '🥈', '🥉'];

export default function Classement() {
    const navigate = useNavigate();

    return (
        <div className="classement-page">
            <AnimatedBackground />

            <div className="classement-contenu">
                <h1 className="classement-titre">🏁 Fin de Partie</h1>
                <p className="classement-sous-titre">Classement final</p>

                {/* ── Podium ── */}
                <div className="podium">
                    {classement.map((joueur, index) => (
                        <div key={joueur.id} className={`podium-carte ${index === 0 ? 'podium-premier' : ''}`}>
                            <span className="podium-medaille">{medailles[index] || index + 1}</span>
                            <span className="podium-nom">{joueur.name}</span>
                            <span className="podium-patrimoine">{joueur.patrimoine.toFixed(2)} €</span>
                        </div>
                    ))}
                </div>

                <button className="classement-btn" onClick={() => navigate('/')}>
                    Rejouer
                </button>
            </div>
        </div>
    );
}
