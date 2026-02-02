import { useState } from 'react';
import PropTypes from 'prop-types';

function Portfolio({ player, stocks }) {
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const calculatePortfolioValue = () => {
    if (!player || !stocks || stocks.length === 0) return 0;
    
    let totalValue = 0;
    for (const [stockId, qty] of Object.entries(player.portfolio || {})) {
      const stock = stocks.find(s => s.id === stockId);
      if (stock) {
        totalValue += stock.price * qty;
      }
    }
    return totalValue;
  };

  const getTotalValue = () => {
    return (player?.cash || 0) + calculatePortfolioValue();
  };

  const handleBuy = () => {
    if (selectedStock && quantity > 0) {
      console.log(`Acheter ${quantity}x ${selectedStock.name}`);
      // TODO: Appeler l'API pour acheter
    }
  };

  const handleSell = () => {
    if (selectedStock && quantity > 0) {
      console.log(`Vendre ${quantity}x ${selectedStock.name}`);
      // TODO: Appeler l'API pour vendre
    }
  };

  if (!player) {
    return <div className="portfolio">Chargement du portefeuille...</div>;
  }

  return (
    <div className="portfolio">
      <h2>💼 Portefeuille de {player.name}</h2>
      
      <div className="portfolio-summary">
        <div className="stat">
          <span className="label">💰 Cash disponible :</span>
          <span className="value">{player.cash.toFixed(2)} €</span>
        </div>
        <div className="stat">
          <span className="label">📈 Valeur des actions :</span>
          <span className="value">{calculatePortfolioValue().toFixed(2)} €</span>
        </div>
        <div className="stat total">
          <span className="label">🏆 Valeur totale :</span>
          <span className="value">{getTotalValue().toFixed(2)} €</span>
        </div>
      </div>

      <h3>Actions détenues</h3>
      {Object.keys(player.portfolio || {}).length === 0 ? (
        <p>Aucune action pour le moment.</p>
      ) : (
        <ul className="portfolio-list">
          {Object.entries(player.portfolio).map(([stockId, qty]) => {
            const stock = stocks.find(s => s.id === stockId);
            if (!stock) return null;
            
            return (
              <li key={stockId}>
                <strong>{stock.name}</strong> : {qty} actions × {stock.price.toFixed(2)} € = {(qty * stock.price).toFixed(2)} €
              </li>
            );
          })}
        </ul>
      )}

      <div className="trading-panel">
        <h3>Acheter / Vendre</h3>
        <select 
          value={selectedStock?.id || ''} 
          onChange={(e) => setSelectedStock(stocks.find(s => s.id === e.target.value))}
        >
          <option value="">Sélectionner une action</option>
          {stocks.map(stock => (
            <option key={stock.id} value={stock.id}>
              {stock.name} - {stock.price.toFixed(2)} €
            </option>
          ))}
        </select>
        
        <input 
          type="number" 
          min="1" 
          value={quantity} 
          onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
          placeholder="Quantité"
        />
        
        <div className="trading-buttons">
          <button onClick={handleBuy} className="btn-buy">Acheter</button>
          <button onClick={handleSell} className="btn-sell">Vendre</button>
        </div>
      </div>
    </div>
  );
}

Portfolio.propTypes = {
  player: PropTypes.shape({
    name: PropTypes.string,
    cash: PropTypes.number,
    portfolio: PropTypes.object,
  }),
  stocks: PropTypes.array,
};

export default Portfolio;
