const GameLogic = require('./models/game_logic.js');
const GameView = require("./views/game.js");
const Countries = require("./models/countries.js")


document.addEventListener('DOMContentLoaded', () => {  
  const gameContainer = document.querySelector("#game-container");
  const gameView = new GameView(gameContainer);
  gameView.bindEvents();

  const countries = new Countries();
  countries.getData();

  const gameLogic = new GameLogic();
  gameLogic.prepareQuestions();
  gameLogic.bindEvents();
  gameLogic.dealWithAnswers();
})
