const RequestHelper = require('../helpers/request_helper.js');
const PubSub = require('../helpers/pub_sub.js');
const GameView = require('../views/game.js');

const GameLogic = function () {
  this.currentQuestionIndex = 0;
  this.questions = [];
  this.request = new RequestHelper('/api/game');
}

GameLogic.prototype.isLastQuestion = function() {
  return this.currentQuestionIndex === this.questions.length - 1;
}

GameLogic.prototype.bindEvents = function () {
  PubSub.subscribe("GameView:next-question", (evt) => {
    this.nextQuestion();
  })
  PubSub.subscribe("GameView:previous-question", (evt) => {
    this.previousQuestion();
  })
}

GameLogic.prototype.getFlagQuestions = function () {
  PubSub.subscribe("Countries:questions-ready", (evt) => {
    const flagQuestions = evt.detail;
    flagQuestions.forEach(flagQuestion => this.questions.push(flagQuestion));
  });
  return this.questions;
};
GameLogic.prototype.prepareQuestions = function () {
  this.request.get() //get all questions from database
  .then((questions) => {
    questions.forEach(question => this.questions.push(question)); //assign data received to the array
    this.setupStartButtonListener();
  })
  .catch((err) => console.error(err));
  this.getFlagQuestions();
};

GameLogic.prototype.setupStartButtonListener = function () {
  const startContainer = document.querySelector('#start-container');
  startContainer.focus();
  const startButton = document.querySelector('#start-button');
  startButton.addEventListener('click', () => {
    startButton.classList.add('hidden');
    this.publishCurrentQuestion();
  });
  document.addEventListener('keyup', (evt) => {
    if (evt.key == 'Enter') {
      if (startButton.classList.contains('hidden')) return;
      startButton.classList.add('hidden');
      this.publishCurrentQuestion();
    }
  });
};

GameLogic.prototype.publishCurrentQuestion = function () {
  const question = this.questions[this.currentQuestionIndex]
  question.number = this.currentQuestionIndex + 1;
  PubSub.publish('Game:data-ready', question);
}

GameLogic.prototype.previousQuestion = function () {
  this.currentQuestionIndex -= 1;
  this.publishCurrentQuestion();
  if (this.currentQuestionIndex > 0) {
    const previousButton = document.querySelector('#button-previous');
    previousButton.classList.remove('hidden');
  }
};

GameLogic.prototype.nextQuestion = function () {
  this.currentQuestionIndex += 1;
  this.publishCurrentQuestion();
  if (this.isLastQuestion()) {
    const nextButton = document.querySelector('#button-next');
    nextButton.classList.add('hidden');
  }

  const previousButton = document.querySelector('#button-previous');
  previousButton.classList.remove('hidden');
};

GameLogic.prototype.dealWithAnswers = function () {
  const game = new GameView('#game-container');

  PubSub.subscribe("QuestionView:click-guess", (evt) => {
    const answer = evt.detail;
    if (answer.userAnswer == answer.answer) {
      PubSub.publish("PopUpBox:answer-calculated", {
        correct: true,
        isLastQuestion: this.isLastQuestion()
      });
      this.nextQuestion();
    } else {
      PubSub.publish("PopUpBox:answer-calculated", {
        correct: false,
        isLastQuestion: this.isLastQuestion()
      });
    }
  });
};

module.exports = GameLogic;
