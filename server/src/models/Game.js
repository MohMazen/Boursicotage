/**
 * Game Model
 * Représente une partie de jeu
 */

class Game {
  constructor(id, name, createdBy) {
    this.id = id;
    this.name = name;
    this.createdBy = createdBy;
    this.players = [];
    this.status = 'waiting'; // waiting, playing, finished
    this.maxPlayers = 8;
    this.createdAt = new Date();
    this.startedAt = null;
    this.endedAt = null;
  }

  /**
   * Ajoute un joueur à la partie
   */
  addPlayer(playerId) {
    if (this.status !== 'waiting') {
      throw new Error('La partie a déjà commencé');
    }
    
    if (this.players.length >= this.maxPlayers) {
      throw new Error('La partie est complète');
    }
    
    if (this.players.includes(playerId)) {
      throw new Error('Le joueur est déjà dans la partie');
    }
    
    this.players.push(playerId);
    
    return {
      success: true,
      playerCount: this.players.length,
    };
  }

  /**
   * Démarre la partie
   */
  start() {
    if (this.status !== 'waiting') {
      throw new Error('La partie ne peut pas être démarrée');
    }
    
    if (this.players.length < 2) {
      throw new Error('Minimum 2 joueurs requis');
    }
    
    this.status = 'playing';
    this.startedAt = new Date();
    
    return {
      success: true,
      startedAt: this.startedAt,
    };
  }

  /**
   * Termine la partie
   */
  end() {
    if (this.status !== 'playing') {
      throw new Error('La partie n\'est pas en cours');
    }
    
    this.status = 'finished';
    this.endedAt = new Date();
    
    return {
      success: true,
      endedAt: this.endedAt,
    };
  }

  /**
   * Retourne un résumé de la partie
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      createdBy: this.createdBy,
      players: this.players,
      status: this.status,
      maxPlayers: this.maxPlayers,
      playerCount: this.players.length,
      createdAt: this.createdAt,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
    };
  }
}

module.exports = Game;
