// Instance unique partagée entre tous les contrôleurs
// Ainsi gameController et playerController travaillent toujours sur la même partie
import Game from '../models/Game.js';

const game = new Game();

export default game;
