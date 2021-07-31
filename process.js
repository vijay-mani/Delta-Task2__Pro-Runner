screen.orientation.addEventListener("change", function () {
   if (screen.orientation.type == "landscape-primary" || screen.orientation.type == "landscape-secondary") {
      document.body.style.transform = `rotate(${screen.orientation.type == "landscape-primary" ? -90 : 90})`;
   }
});

const handleEvent = (event) => {
   if ((event.code === "Space" || event.touches.length >= 1) && !GAME.isGameOver) {
      if (player.pushedUp) {
         requestAnimationFrame(function () {
            push("down");
         });
      } else {
         requestAnimationFrame(function () {
            push("up");
         });
      }
   }
};

const titleDOM = document.getElementById("title");
const playBtnDOM = document.getElementById("play-btn");
const inputNameDOM = document.getElementById("input-name");
const canvas = document.getElementById("game");
const gameOverlayDOM = document.getElementById("game-overlay");
const gameOverlayTextDOM = document.getElementById("game-overlay-text");
const scoreDOM = document.getElementById("score");
const outerContainerDOM = document.getElementById("outer-container");
const viewScoresMenuDOM = document.getElementById("view-scores-menu");
const highScoresDOM = document.getElementById("high-scores");
const highScoresListDOM = document.getElementById("high-scores-list");

function play() {
   titleDOM.style.display = "none";
   inputNameDOM.style.display = "none";
   playBtnDOM.style.display = "none";
   outerContainerDOM.style.display = "flex";
   canvas.style.display = "inline";
   gameOverlayDOM.style.display = "flex";
   scoreDOM.style.display = "inline";

   let gameScript = document.createElement("script");
   gameScript.setAttribute("src", "./play.js");
   document.body.appendChild(gameScript);

   setTimeout(function () {
      startGame();
      document.addEventListener("keypress", handleEvent);
      document.addEventListener("touchstart", handleEvent);
   }, 765);
}

function startGame() {
   player.name = document.getElementById("name").value;
   gameOverlayDOM.style.display = "none";

   context.fillStyle = grey;
   context.fillRect(0, 125, spaceWidth, spaceHeight);

   contextObject.beginPath();
   contextObject.moveTo(player.xCord, player.yCord);
   contextObject.lineTo(player.xCord + player.side, player.yCord);
   contextObject.lineTo(player.xCord + player.side / 2, player.yCord - player.height);
   contextObject.closePath();
   contextObject.fillStyle = blue;
   contextObject.fill();

   window.requestAnimationFrame(renderHoles);
}

function showGameOver() {
   gameOverlayDOM.style.display = "flex";
   scoreDOM.innerHTML = "";
   gameOverlayTextDOM.textContent = `Game Over! Score: ${Math.floor(GAME.score / 10)}`;
   viewScoresMenuDOM.style.display = "flex";

   checkHighScore(Math.floor(GAME.score / 10));
}

function updateScore() {
   scoreDOM.textContent = `Score: ${Math.floor(GAME.score / 10)}`;
}

function checkHighScore(score) {
   var highScores = [];
   var lowestScore;
   if (!JSON.parse(localStorage.getItem("HIGH_SCORES") === null)) {
      highScores = JSON.parse(localStorage.getItem("HIGH_SCORES"));
   }
   if (highScores == null) {
      lowestScore = 0;
   } else {
      lowestScore = highScores[9] ? highScores[9].playerScore : 0;
   }

   if (score > lowestScore) {
      saveHighScore(highScores, score);
   }
}

function saveHighScore(highScores, score) {
   newEntry = {
      playerScore: score,
      playerName: player.name == "" ? "Random" : player.name,
   };
   if (highScores == null) {
      highScores = [newEntry];
   } else {
      highScores.push(newEntry);
   }
   highScores.sort((a, b) => b.playerScore - a.playerScore);

   highScores.splice(10);

   localStorage.setItem("HIGH_SCORES", JSON.stringify(highScores));
}

function viewHighScores() {
   viewScoresMenuDOM.style.display = "none";
   gameOverlayDOM.style.display = "none";
   outerContainerDOM.style.display = "none";
   highScoresDOM.style.display = "flex";

   var highScores = JSON.parse(localStorage.getItem("HIGH_SCORES")) ?? [];

   highScoresListDOM.innerHTML = highScores.map((entry) => `<li>${entry.playerScore} - ${entry.playerName}`).join("");
}