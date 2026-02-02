import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MarketBoard from '../Market/MarketBoard';
import Portfolio from '../Portfolio/Portfolio';
import socketService from '../../services/socket';

function GameRoom({ gameId, player }) {
  const [stocks, setStocks] = useState([]);
  const [gameStatus, setGameStatus] = useState('waiting');
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Connexion et rejoindre la partie
    socketService.connect();
    socketService.joinGame(gameId, player.id);

    // Écouter les événements
    socketService.onMarketUpdate((updatedStocks) => {
      setStocks(updatedStocks);
    });

    socketService.onGameStarted(() => {
      console.log('🎮 Partie démarrée !');
      setGameStatus('playing');
    });

    socketService.onGameEnd(() => {
      console.log('🏁 Partie terminée !');
      setGameStatus('finished');
      alert('La partie est terminée ! 🏁');
    });

    socketService.onGameEvent((event) => {
      console.log('💥 Événement de jeu:', event);
      setEvents(prev => [event, ...prev].slice(0, 5)); // Garder les 5 derniers
    });

    return () => {
      socketService.disconnect();
    };
  }, [gameId, player.id]);

  return (
    <div className="game-room">
      <h1>🎮 Partie : {gameId}</h1>
      
      <div className="game-status">
        Statut : <strong>{gameStatus === 'playing' ? '🟢 En cours' : '🟡 En attente'}</strong>
      </div>

      {events.length > 0 && (
        <div className="events-panel">
          <h3>📢 Événements récents</h3>
          <ul>
            {events.map((event, index) => (
              <li key={index}>
                <strong>{event.name}</strong> : {event.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="game-layout">
        <div className="left-panel">
          <MarketBoard />
        </div>
        
        <div className="right-panel">
          <Portfolio player={player} stocks={stocks} />
        </div>
      </div>
    </div>
  );
}

GameRoom.propTypes = {
  gameId: PropTypes.string.isRequired,
  player: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default GameRoom;
