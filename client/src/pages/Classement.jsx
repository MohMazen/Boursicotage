import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground.jsx';
import './Classement.css';

const medailles = ['🥇', '🥈', '🥉'];

export default function Classement() {
    const navigate = useNavigate();
    const [classement, setClassement] = useState([]);

    useEffect(() => {
        const data = localStorage.getItem('classement');
        if (data) setClassement(JSON.parse(data));
    }, []);

    const handleRejouer = () => {
        localStorage.removeItem('playerId');
        localStorage.removeItem('pseudo');
        localStorage.removeItem('classement');
        navigate('/');
    };

    return (
        <div className="classement-page">
            <AnimatedBackground />

            <div className="classement-contenu">
                <h1 className="classement-titre">🏁 Fin de Partie</h1>
                <p className="classement-sous-titre">Classement final</p>

                <div className="podium">
                    {classement.map((joueur, index) => (
                        <div key={joueur.id} className={`podium-carte ${index === 0 ? 'podium-premier' : ''}`}>
                            <span className="podium-medaille">{medailles[index] || index + 1}</span>
                            <span className="podium-nom">{joueur.name}</span>
                            <span className="podium-patrimoine">{joueur.patrimoine.toFixed(2)} €</span>
                        </div>
                    ))}
                </div>

                <button className="classement-bouton" onClick={handleRejouer}>
                    Rejouer
                </button>
            </div>
        </div>
    );
}
