const game = {
  players: [],
  currentPlayerIndex: 0,
  currentRound: 1,
  maxRounds: 0,
  timeoutDuration: 0,
  timeoutID: null,
  letters: "ABCDEFGHIJLMNOPRSTUV".split(""),
  usedLetters: [],
  boardData: [],
  scores: [],
};

let intervalID = null;

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
  document.getElementById("setup").style.display = "none";

  startNewRound();
}

function startNewRound() {
  game.currentPlayerIndex = 0;
  const letter = getRandomLetter();
  document.getElementById("timer").style.display = "";
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
          <td><div class="input-cell"><input type="text" class="column-input" data-player="${index}" data-column="nome"></div></td>
          <td><div class="input-cell"><input type="text" class="column-input" data-player="${index}" data-column="pais"></div></td>
          <td><div class="input-cell"><input type="text" class="column-input" data-player="${index}" data-column="cor"></div></td>
          <td><div class="input-cell"><input type="text" class="column-input" data-player="${index}" data-column="fruta"></div></td>
          <td><div class="input-cell"><input type="text" class="column-input" data-player="${index}" data-column="parte_do_corpo"></div></td>
          <td><div class="input-cell"><input type="text" class="column-input" data-player="${index}" data-column="animal"></div></td>
          <td><div class="input-cell"><button class="end-turn" data-player="${index}">STOP</button></td>
        `;
    tbody.appendChild(row);
  });
}

function setPlayerTurn() {
  if (game.currentPlayerIndex >= game.players.length) {
    endRound();
    return;
  }

  const playerInputs = document.querySelectorAll(
    `input[data-player="${game.currentPlayerIndex}"]`
  );
  playerInputs.forEach((input) => (input.disabled = false));

  const endTurnButton = document.querySelector(
    `button.end-turn[data-player="${game.currentPlayerIndex}"]`
  );
  endTurnButton.disabled = false;

  endTurnButton.replaceWith(endTurnButton.cloneNode(true));
  const newEndTurnButton = document.querySelector(
    `button.end-turn[data-player="${game.currentPlayerIndex}"]`
  );

  newEndTurnButton.addEventListener("click", () => {
    clearTimeout(game.timeoutID);
    clearInterval(intervalID);
    endTurn(true);
    //setPlayerTurn();
  });

  startTimeout();
}

function startTimeout() {
  let remainingTime = game.timeoutDuration / 1000;
  document.getElementById(
    "timer"
  ).innerText = `Tempo restante: ${remainingTime}s`;

  intervalID = setInterval(() => {
    remainingTime--;
    if (remainingTime <= 0) {
      clearInterval(intervalID);
    } else {
      document.getElementById(
        "timer"
      ).innerText = `Tempo restante: ${remainingTime}s`;
    }
  }, 1000);

  game.timeoutID = setTimeout(() => {
    clearInterval(intervalID);
    endTurn(false);
  }, game.timeoutDuration);
}

function endTurn(isManual) {
  clearTimeout(game.timeoutID);
  clearInterval(intervalID);

  const playerInputs = document.querySelectorAll(
    `input[data-player="${game.currentPlayerIndex}"]`
  );

  if (playerInputs.length > 0) {
    playerInputs.forEach((input) => {
      input.disabled = true;
      input.type = "password";
    });
  }

  const endTurnButton = document.querySelector(
    `button.end-turn[data-player="${game.currentPlayerIndex}"]`
  );

  if (endTurnButton) {
    endTurnButton.disabled = true;
  }

  if (isManual) {
    console.log("Jogador encerrou manualmente");
  } else {
    console.log("Tempo acabou, encerrando jogada automaticamente");
    alert("Tempo da jogada acabou! Troque de lugar com o próximo jogador");
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
    playerData[input.dataset.column] = input.value.toLowerCase();
  });

  game.boardData[playerIndex] = playerData;
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/ç/g, "c")
    .replace(/\p{Diacritic}/gu, "");
}

function validateAndScoreAnswers() {
  const answerCounts = {};

  game.boardData.forEach((data, playerIndex) => {
    Object.entries(data).forEach(([column, answer]) => {
      answer = normalizeText(answer);

      if (validAnswers[column] && validAnswers[column].includes(answer)) {
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
      answer = normalizeText(answer);

      if (validAnswers[column] && validAnswers[column].includes(answer)) {
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
  clearInterval(intervalID);
  clearTimeout(game.timeoutID);

  validateAndScoreAnswers();
  updateScoreBoard();

  if (game.currentRound < game.maxRounds) {
    game.currentRound++;
    document.getElementById("newRound").classList.remove("hidden");
  } else {
    endGame();
  }

  game.players.forEach((_, playerIndex) => {
    const playerInputs = document.querySelectorAll(
      `input[data-player="${playerIndex}"]`
    );

    if (playerInputs.length > 0) {
      playerInputs.forEach((input) => {
        input.disabled = true;
        input.type = "text";
      });
    }
  });

  document.getElementById("timer").style.display = "none";
}

function fillScoreDiv() {
  const scoreDiv = document.getElementById("score");
  scoreDiv.innerHTML = "";

  game.players.forEach((player, index) => {
    const scoreRow = document.createElement("div");
    scoreRow.innerText = `${player}: ${game.scores[index]} pontos`;
    scoreDiv.appendChild(scoreRow);
  });
}

function updateScoreBoard() {
  fillScoreDiv();

  document.getElementById("scoreBoard").classList.remove("hidden");
}

function endGame() {
  const scoreDiv = document.getElementById("score");

  fillScoreDiv();

  const maxScore = Math.max(...game.scores);

  const winners = game.players.filter(
    (_, index) => game.scores[index] === maxScore
  );

  let winnerMessage = document.createElement("h3");

  if (winners.length > 1) {
    winnerMessage.innerText = `Empate entre: ${winners.join(
      ", "
    )} com ${maxScore} pontos!`;
  } else {
    winnerMessage.innerText = `Vencedor: ${winners[0]} com ${maxScore} pontos!`;
  }
  winnerMessage.style.margin = "16px 0";

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
