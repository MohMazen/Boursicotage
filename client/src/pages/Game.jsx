import { useState, useEffect } from 'react';
import GameRoom from '../components/Game/GameRoom';

function Game() {
  const [gameId, setGameId] = useState(null);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    // Récupérer l'ID de la partie depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (!id) {
      alert('ID de partie manquant');
      window.location.href = '/lobby';
      return;
    }

    setGameId(id);

    // Récupérer le joueur depuis le localStorage
    const storedPlayer = localStorage.getItem('player');
    if (!storedPlayer) {
      alert('Vous devez créer un joueur d\'abord');
      window.location.href = '/';
      return;
    }

    setPlayer(JSON.parse(storedPlayer));
  }, []);

  if (!gameId || !player) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="game-page">
      <GameRoom gameId={gameId} player={player} />
    </div>
  );
}

export default Game;
