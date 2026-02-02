import { useState, useEffect } from 'react';
import { gameAPI } from '../services/api';

function Lobby() {
  const [games, setGames] = useState([]);
  const [player, setPlayer] = useState(null);
  const [gameName, setGameName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Récupérer le joueur depuis le localStorage
    const storedPlayer = localStorage.getItem('player');
    if (storedPlayer) {
      setPlayer(JSON.parse(storedPlayer));
    }

    // Charger la liste des parties
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const response = await gameAPI.getAll();
      setGames(response.data.games);
    } catch (error) {
      console.error('❌ Erreur chargement parties:', error);
    }
  };

  const handleCreateGame = async (e) => {
    e.preventDefault();
    
    if (!gameName.trim()) {
      alert('Veuillez entrer un nom de partie');
      return;
    }

    if (!player) {
      alert('Vous devez créer un joueur d\'abord');
      return;
    }

    setIsLoading(true);

    try {
      const response = await gameAPI.create({
        name: gameName,
        createdBy: player.id,
      });
      
      console.log('✅ Partie créée:', response.data);
      
      // Rejoindre automatiquement la partie créée
      await gameAPI.join(response.data.game.id, player.id);
      
      // Rediriger vers la partie
      window.location.href = `/game?id=${response.data.game.id}`;
    } catch (error) {
      console.error('❌ Erreur création partie:', error);
      alert('Erreur lors de la création de la partie');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async (gameId) => {
    if (!player) {
      alert('Vous devez créer un joueur d\'abord');
      return;
    }

    try {
      await gameAPI.join(gameId, player.id);
      window.location.href = `/game?id=${gameId}`;
    } catch (error) {
      console.error('❌ Erreur rejoindre partie:', error);
      alert('Erreur lors de la connexion à la partie');
    }
  };

  if (!player) {
    return (
      <div className="lobby">
        <p>Vous devez créer un joueur d&rsquo;abord.</p>
        <button onClick={() => window.location.href = '/'}>
          Retour à l&rsquo;accueil
        </button>
      </div>
    );
  }

  return (
    <div className="lobby">
      <h1>🎮 Lobby</h1>
      
      <div className="player-info">
        Bienvenue, <strong>{player.name}</strong> !
      </div>

      <div className="create-game-section">
        <h2>Créer une nouvelle partie</h2>
        <form onSubmit={handleCreateGame}>
          <input
            type="text"
            placeholder="Nom de la partie"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Création...' : 'Créer une partie'}
          </button>
        </form>
      </div>

      <div className="games-list-section">
        <h2>Parties disponibles</h2>
        {games.length === 0 ? (
          <p>Aucune partie disponible pour le moment.</p>
        ) : (
          <ul className="games-list">
            {games.map(game => (
              <li key={game.id} className={`game-item status-${game.status}`}>
                <div className="game-info">
                  <strong>{game.name}</strong>
                  <span className="game-status">
                    {game.status === 'waiting' && '🟡 En attente'}
                    {game.status === 'playing' && '🟢 En cours'}
                    {game.status === 'finished' && '🔴 Terminée'}
                  </span>
                  <span className="game-players">
                    👥 {game.playerCount}/{game.maxPlayers}
                  </span>
                </div>
                {game.status === 'waiting' && (
                  <button onClick={() => handleJoinGame(game.id)}>
                    Rejoindre
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        <button onClick={loadGames} className="btn-refresh">
          🔄 Rafraîchir
        </button>
      </div>
    </div>
  );
}

export default Lobby;
