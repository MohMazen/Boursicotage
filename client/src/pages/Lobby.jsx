import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground.jsx';
import { demarrerPartie, getEtatPartie } from '../services/api.js';
import './Lobby.css';

export default function Lobby() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const pseudo = searchParams.get('pseudo') || localStorage.getItem('pseudo') || 'Inconnu';
    const [nbJoueurs, setNbJoueurs] = useState(0);
    const [erreur, setErreur] = useState('');


    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await getEtatPartie();
                setNbJoueurs(res.data.nbJoueurs);
                if (res.data.started) navigate(`/game?pseudo=${pseudo}`);
            } catch (e) {}
        }, 2000);
        return () => clearInterval(interval);
    }, [navigate, pseudo]);

    const handleDemarrer = async () => {
        setErreur('');
        try {
            await demarrerPartie();
            navigate(`/game?pseudo=${pseudo}`);
        } catch (err) {
            setErreur(err.response?.data?.message || 'Erreur lors du démarrage.');
        }
    };

    return (
        <div className="lobby-page">
            <AnimatedBackground />
            <h1 className="lobby-titre">📈 Boursicotage</h1>
            <p className="lobby-pseudo">Connecté en tant que : <span>{pseudo}</span></p>

            <div className="lobby-carte">
                <p className="lobby-sous-titre">Joueurs connectés ({nbJoueurs})</p>

                {erreur && <p className="lobby-erreur">{erreur}</p>}

                <button
                    className="lobby-bouton"
                    onClick={handleDemarrer}
                    disabled={nbJoueurs < 2}
                >
                    Démarrer la partie
                </button>

                {nbJoueurs < 2 && (
                    <p className="lobby-attente">En attente d'un autre joueur...</p>
                )}
            </div>
        </div>
    );
}
