const [cos60, spaceWidth, spaceHeight] = [Math.cos(Math.PI / 6), 800, 200];
const [grey, blue, red] = ["#363636", "#2588D4", "#EA3D51"];
const [context, contextObject, canvasObject] = [canvas.getContext("2d"), document.getElementById("object").getContext("2d"), document.getElementById("object")];

class Player {
   constructor(side, xCord, yCord) {
      this.name = "";
      this.degrees = 180;
      this.pushedUp = false;
      this.transitioned = true;
      this.side = side;
      this.height = (side * Math.sqrt(3)) / 2;
      this.xCord = xCord;
      this.yCord = yCord;
      this.centerCord = { x: this.xCord + side / 2, y: this.yCord - this.height + (this.side / 2) * cos60 };
      this.radius = Math.hypot(this.side / 2, this.yCord - this.centerCord.y);
   }

   drawShape() {
      contextObject.translate(this.centerCord.x, this.centerCord.y);
      contextObject.rotate((Math.PI / 180) * this.degrees);
      contextObject.beginPath();
      contextObject.moveTo(-this.side / 2, -this.height + (this.side / 2) * cos60);
      contextObject.lineTo(this.side / 2, -this.height + (this.side / 2) * cos60);
      contextObject.lineTo(0, (this.side / 2) * cos60);
      contextObject.closePath();
      contextObject.fillStyle = blue;
      contextObject.fill();
      contextObject.rotate(-(Math.PI / 180) * this.degrees);
      contextObject.translate(-this.centerCord.x, -this.centerCord.y);
   }

   updateCenter() {
      this.centerCord.y = this.yCord - this.height + (this.side / 2) * cos60;
   }
}

class Game {
   constructor() {
      this.speedX = 2;
      this.speedY = 5;
      this.distance = 0;
      this.score = 0;
      this.isGameOver = false;
      this.level = 1;
      this.levelGap = 5000;
      this.isObjectRendering = false;
      this.isHoleRendering = false;
      this.plan = {
         powerUpProb: 10,
         holeProb: 100,
      };
   }

   updateGamePlay() {
      if (this.distance > this.levelGap) {
         this.distance = 0;
         this.level++;
      
         if (this.level <= 4) {
            this.plan = {
               powerUpProb: 20,
               holeProb: 100,
            };
            this.levelGap += 5000;
            this.speedX++;
         }
      }
      if (!GAME.isObjectRendering) {
         var step = Math.floor(Math.random() * 100) + 1;
         if (!GAME.isHoleRendering) {
            window.requestAnimationFrame(renderHoles);
         }
      } else if (!GAME.isHoleRendering) {
         window.requestAnimationFrame(renderHoles);
      }
   }
}

class Hole {
   constructor() {
      this.width = 200 - 10 * Math.floor(Math.random() * 5);
      this.xCord = 800;
      this.yCord = Math.round(Math.random()) == 1 ? 0 : 325;
   }
   reset() {
      this.yCord = Math.round(Math.random()) == 1 ? 0 : 325;
      this.xCord = 800;
      this.width = 200 - 10 * Math.floor(Math.random() * 5);
   }
}

var GAME = new Game();
var player = new Player(50, 100, 325);
var hole = new Hole();

function push(direction) {
   player.transitioned = false;
   if ((direction === "up" && player.yCord > 170) || (direction !== "up" && player.yCord < 325)) {
      if (player.yCord >= 200 && player.yCord < 300) {
         player.degrees -= 9;
      }
      player.yCord += direction === "up" ? -GAME.speedY : GAME.speedY;
      if (player.yCord === 170) {
         player.yCord = 125 + player.height;
      }
      contextObject.clearRect(0, 0, canvasObject.width, canvasObject.height);
      player.updateCenter();
      player.drawShape();
      if (player.yCord === 125 + player.height) {
         player.yCord = 170;
      }
      requestAnimationFrame(function () {
         push(direction);
      });
   } else {
      player.degrees = direction === "up" ? 0 : 180;
      player.transitioned = true;
      player.pushedUp = direction === "up" ? true : false;
   }
}

function renderHoles() {
   if (GAME.isGameOver) {
      return;
   }
   GAME.isHoleRendering = true;
   updateScore();
   GAME.distance++;
   GAME.score = GAME.score + 1 / 10;
   if (hole.xCord < 800) {
      context.clearRect(hole.xCord + GAME.speedX, hole.yCord, hole.width, 125);
   }

   context.fillStyle = grey;
   context.fillRect(hole.xCord, hole.yCord, hole.width, 125);

   hole.xCord = hole.xCord - GAME.speedX;

   if (touchedHole(hole.xCord, hole.xCord + hole.width)) {
      showGameOver();
   } else {
      if (hole.xCord >= -hole.width) {
         window.requestAnimationFrame(renderHoles);
      }
      if (hole.xCord === -hole.width - GAME.speedX || (GAME.speedX % 3 === 0 && hole.xCord < -hole.width)) {
         context.clearRect(hole.xCord + GAME.speedX, hole.yCord, hole.width, 125);
         hole.reset();
         GAME.isHoleRendering = false;
         GAME.updateGamePlay();
      }
   }
}

function touchedHole(x, y) {
   if (
      (hole.yCord == 0 && player.transitioned && player.pushedUp && player.xCord <= y && player.xCord >= x) ||
      (hole.yCord != 0 && player.transitioned && !player.pushedUp && player.xCord + player.side / 2 <= y && player.xCord <= y && player.xCord >= x)
   ) {
      GAME.isGameOver = true;
      return true;
   }
   return false;
}