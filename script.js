const game = {
  players: [],
  currentPlayerIndex: 0,
  currentRound: 1,
  maxRounds: 0,
  timeoutDuration: 0,
  timeoutID: null,
  letters: "A".split(""),
  usedLetters: [],
  boardData: [],
  scores: [],
};

let validAnswers = {};

async function loadValidAnswers() {
  const response = await fetch("validAnswers.json");
  validAnswers = await response.json();
}

function setupGame() {
  const playerCount = document.getElementById("playerCount").value;
  const playerNames = document.getElementById("playerNames").value.split(",");
  const roundCount = document.getElementById("roundCount").value;
  const timeout = document.getElementById("timeout").value;

  game.players = playerNames.slice(0, playerCount);
  game.maxRounds = roundCount;
  game.timeoutDuration = timeout * 1000;
  game.currentRound = 1;
  game.scores = Array(game.players.length).fill(0);
  game.boardData = Array(game.players.length).fill({});

  document.getElementById("setup").classList.add("hidden");
  document.getElementById("gameBoard").classList.remove("hidden");

  startNewRound();
}

function startNewRound() {
  game.currentPlayerIndex = 0;
  const letter = getRandomLetter();
  document.getElementById("randomLetter").innerText = letter;
  document.getElementById("roundNumber").innerText = game.currentRound;

  buildTable();
  setPlayerTurn();
}

function getRandomLetter() {
  let letter;
  do {
    const randomIndex = Math.floor(Math.random() * game.letters.length);
    letter = game.letters[randomIndex];
  } while (game.usedLetters.includes(letter));

  game.usedLetters.push(letter);
  return letter;
}

function buildTable() {
  const tbody = document.getElementById("gameBody");
  tbody.innerHTML = "";

  game.players.forEach((player, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
          <td>${player}</td>
          <td><input type="text" class="column-input" data-player="${index}" data-column="nome"></td>
          <td><input type="text" class="column-input" data-player="${index}" data-column="pais"></td>
          <td><input type="text" class="column-input" data-player="${index}" data-column="cor"></td>
          <td><input type="text" class="column-input" data-player="${index}" data-column="fruta"></td>
          <td><input type="text" class="column-input" data-player="${index}" data-column="parte_do_corpo"></td>
          <td><input type="text" class="column-input" data-player="${index}" data-column="animal"></td>
          <td><button class="end-turn" data-player="${index}">STOP</button></td>
        `;
    tbody.appendChild(row);
  });
}

function setPlayerTurn() {
  const playerInputs = document.querySelectorAll(
    `input[data-player="${game.currentPlayerIndex}"]`
  );
  playerInputs.forEach((input) => (input.disabled = false));

  const endTurnButton = document.querySelector(
    `button.end-turn[data-player="${game.currentPlayerIndex}"]`
  );
  endTurnButton.disabled = false;

  endTurnButton.addEventListener("click", () => {
    endTurn(true);
  });

  startTimeout();
}

function startTimeout() {
  game.timeoutID = setTimeout(() => {
    endTurn(false);
  }, game.timeoutDuration);
}

function endTurn(isManual) {
  clearTimeout(game.timeoutID);

  const playerInputs = document.querySelectorAll(
    `input[data-player="${game.currentPlayerIndex}"]`
  );

  playerInputs.forEach((input) => {
    input.disabled = true;
    input.type = "password";
  });

  const endTurnButton = document.querySelector(
    `button.end-turn[data-player="${game.currentPlayerIndex}"]`
  );
  endTurnButton.disabled = true;

  if (isManual) {
    console.log("Jogador encerrou manualmente");
  } else {
    console.log("Tempo acabou, encerrando jogada automaticamente");
  }

  savePlayerData(game.currentPlayerIndex);

  game.currentPlayerIndex++;

  if (game.currentPlayerIndex < game.players.length) {
    setPlayerTurn();
  } else {
    endRound();
  }
}

function savePlayerData(playerIndex) {
  const playerInputs = document.querySelectorAll(
    `input[data-player="${playerIndex}"]`
  );
  const playerData = {};

  playerInputs.forEach((input) => {
    // Converte a resposta para minúscula antes de salvar
    playerData[input.dataset.column] = input.value.toLowerCase();
  });

  game.boardData[playerIndex] = playerData;
}

function validateAndScoreAnswers() {
  const answerCounts = {};

  game.boardData.forEach((data, playerIndex) => {
    Object.entries(data).forEach(([column, answer]) => {
      if (
        validAnswers[column] &&
        validAnswers[column].includes(answer.toLowerCase())
      ) {
        if (!answerCounts[column]) {
          answerCounts[column] = {};
        }
        if (!answerCounts[column][answer]) {
          answerCounts[column][answer] = [];
        }
        answerCounts[column][answer].push(playerIndex);
      }
    });
  });

  game.players.forEach((player, index) => {
    let score = 0;

    Object.entries(game.boardData[index]).forEach(([column, answer]) => {
      if (
        validAnswers[column] &&
        validAnswers[column].includes(answer.toLowerCase())
      ) {
        if (answerCounts[column][answer].length === 1) {
          score += 10;
        } else {
          score += 5;
        }
      }
    });

    game.scores[index] += score;
  });
}

function endRound() {
  validateAndScoreAnswers();
  updateScoreBoard();

  if (game.currentRound < game.maxRounds) {
    game.currentRound++;
    document.getElementById("newRound").classList.remove("hidden");
  } else {
    endGame();
  }
}

function updateScoreBoard() {
  const scoreDiv = document.getElementById("score");
  scoreDiv.innerHTML = "";

  game.players.forEach((player, index) => {
    const scoreRow = document.createElement("div");
    scoreRow.innerText = `${player}: ${game.scores[index]} pontos`;
    scoreDiv.appendChild(scoreRow);
  });

  document.getElementById("scoreBoard").classList.remove("hidden");
}

function endGame() {
  const scoreDiv = document.getElementById("score");
  scoreDiv.innerHTML = "";

  const maxScore = Math.max(...game.scores);
  const winnerIndex = game.scores.indexOf(maxScore);
  const winner = game.players[winnerIndex];

  const winnerMessage = document.createElement("h3");
  winnerMessage.innerText = `Vencedor: ${winner} com ${maxScore} pontos!`;
  scoreDiv.appendChild(winnerMessage);

  alert("Fim do jogo! Veja o placar.");

  document.getElementById("newGame").classList.remove("hidden");
}

loadValidAnswers().then(() => {
  document.getElementById("startGame").addEventListener("click", setupGame);
  document
    .getElementById("newGame")
    .addEventListener("click", () => location.reload());

  document.getElementById("newRound").addEventListener("click", () => {
    game.usedLetters = [];
    document.getElementById("newRound").classList.add("hidden");
    startNewRound();
  });
});
