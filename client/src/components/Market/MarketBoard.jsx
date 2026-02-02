import { useState, useEffect } from 'react';
import socketService from '../../services/socket';

function MarketBoard() {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    // Connexion au socket
    socketService.connect();

    // Écouter l'état initial du marché
    socketService.onMarketInitial((initialStocks) => {
      console.log('📊 Marché initial reçu', initialStocks);
      setStocks(initialStocks);
    });

    // Écouter les mises à jour du marché
    socketService.onMarketUpdate((updatedStocks) => {
      setStocks(updatedStocks);
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  const getChangeClass = (stock) => {
    if (stock.price > stock.previousPrice) return 'positive';
    if (stock.price < stock.previousPrice) return 'negative';
    return 'neutral';
  };

  const getChangeSymbol = (stock) => {
    if (stock.price > stock.previousPrice) return '📈';
    if (stock.price < stock.previousPrice) return '📉';
    return '➡️';
  };

  return (
    <div className="market-board">
      <h2>📊 Tableau du Marché</h2>
      
      {stocks.length === 0 ? (
        <p>En attente du marché...</p>
      ) : (
        <table className="market-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Secteur</th>
              <th>Prix</th>
              <th>Variation</th>
              <th>Tendance</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => (
              <tr key={stock.id} className={getChangeClass(stock)}>
                <td><strong>{stock.name}</strong></td>
                <td>{stock.sector}</td>
                <td>{stock.price.toFixed(2)} €</td>
                <td className={getChangeClass(stock)}>
                  {getChangeSymbol(stock)} 
                  {stock.previousPrice > 0 ? ((stock.price - stock.previousPrice) / stock.previousPrice * 100).toFixed(2) : '0.00'}%
                </td>
                <td>{stock.trend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MarketBoard;
