import { useNavigate, useSearchParams } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground.jsx';
import './Lobby.css';

// Données fictives pour l'instant
const joueurs = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
];

export default function Lobby() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const pseudo = searchParams.get('pseudo') || 'Inconnu';

    return (
        <div className="lobby-page">
            <AnimatedBackground />
            <h1 className="lobby-titre">📈 Boursicotage</h1>
            <p className="lobby-pseudo">Connecté en tant que : <span>{pseudo}</span></p>

            <div className="lobby-carte">
                <p className="lobby-sous-titre">Joueurs connectés ({joueurs.length})</p>

                <ul className="lobby-liste">
                    {joueurs.map((joueur) => (
                        <li key={joueur.id} className="lobby-joueur">
                            <div className="lobby-joueur-point"></div>
                            {joueur.name}
                        </li>
                    ))}
                </ul>

                <button className="lobby-bouton" onClick={() => navigate(`/game?pseudo=${pseudo}`)}>
                    Démarrer la partie
                </button>
            </div>
        </div>
    );
}
