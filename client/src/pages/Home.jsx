import { useState } from 'react';
import { playerAPI } from '../services/api';

function Home() {
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreatePlayer = async (e) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      alert('Veuillez entrer un nom');
      return;
    }

    setIsLoading(true);

    try {
      const response = await playerAPI.create({ name: playerName });
      console.log('✅ Joueur créé:', response.data);
      
      // Stocker le joueur dans le localStorage
      localStorage.setItem('player', JSON.stringify(response.data.player));
      
      // Rediriger vers le lobby
      window.location.href = '/lobby';
    } catch (error) {
      console.error('❌ Erreur création joueur:', error);
      alert('Erreur lors de la création du joueur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home">
      <div className="hero">
        <h1>🎮 Boursicotage</h1>
        <p className="tagline">Simulation Boursière Multijoueur Temps Réel</p>
        
        <div className="description">
          <p>💰 Gérez votre portefeuille d&rsquo;actions virtuelles</p>
          <p>📈 Profitez des fluctuations du marché</p>
          <p>⏱️ Attention : la partie peut se terminer à tout moment !</p>
          <p>🏆 Devenez le plus riche pour gagner</p>
        </div>

        <form onSubmit={handleCreatePlayer} className="player-form">
          <h2>Créer un compte joueur</h2>
          <input
            type="text"
            placeholder="Votre nom"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Création...' : 'Commencer à jouer'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Home;
