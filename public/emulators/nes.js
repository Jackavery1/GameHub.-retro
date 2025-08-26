// Émulateur NES simple avec jeux intégrés
// Basé sur des jeux rétro recréés en JavaScript

(function () {
  const canvas = document.getElementById("nesScreen");
  const ctx = canvas.getContext("2d");

  let currentGame = null;
  let gameLoop = null;
  let keys = {};

  // Gestion des touches
  window.addEventListener("keydown", (e) => {
    keys[e.code] = true;
  });

  window.addEventListener("keyup", (e) => {
    keys[e.code] = false;
  });

  // Jeux intégrés
  const games = {
    tetris: {
      name: "Tetris",
      init: initTetris,
      update: updateTetris,
      render: renderTetris,
    },
    snake: {
      name: "Snake",
      init: initSnake,
      update: updateSnake,
      render: renderSnake,
    },
    pong: {
      name: "Pong",
      init: initPong,
      update: updatePong,
      render: renderPong,
    },
    breakout: {
      name: "Breakout",
      init: initBreakout,
      update: updateBreakout,
      render: renderBreakout,
    },
  };

  // Gestion des boutons de jeux
  document.querySelectorAll(".game-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const gameId = btn.dataset.rom;
      const gameName = btn.dataset.name;

      // Mise à jour visuelle
      document
        .querySelectorAll(".game-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Arrêter le jeu actuel
      if (gameLoop) {
        cancelAnimationFrame(gameLoop);
        gameLoop = null;
      }

      // Démarrer le nouveau jeu
      if (games[gameId]) {
        currentGame = games[gameId];
        currentGame.init();
        gameLoop = requestAnimationFrame(gameLoop);

        // Feedback sonore
        if (typeof AudioFX !== "undefined") {
          AudioFX.bleep(1200, 0.08, "square", 0.05);
        }
      }
    });
  });

  // Contrôles
  document.getElementById("btnPause").addEventListener("click", () => {
    if (gameLoop) {
      cancelAnimationFrame(gameLoop);
      gameLoop = null;
    }
  });

  document.getElementById("btnResume").addEventListener("click", () => {
    if (currentGame && !gameLoop) {
      gameLoop = requestAnimationFrame(gameLoop);
    }
  });

  document.getElementById("btnReset").addEventListener("click", () => {
    if (currentGame) {
      currentGame.init();
    }
  });

  document.getElementById("btnFullscreen").addEventListener("click", () => {
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    }
  });

  // Boucle de jeu
  function gameLoop() {
    if (currentGame) {
      currentGame.update();
      currentGame.render();
    }
    gameLoop = requestAnimationFrame(gameLoop);
  }

  // === TETRIS ===
  let tetrisBoard = [];
  let tetrisPiece = null;
  let tetrisScore = 0;
  let tetrisLevel = 1;
  let tetrisLines = 0;

  function initTetris() {
    tetrisBoard = Array(20)
      .fill()
      .map(() => Array(10).fill(0));
    tetrisScore = 0;
    tetrisLevel = 1;
    tetrisLines = 0;
    spawnTetrisPiece();
  }

  function spawnTetrisPiece() {
    const pieces = [
      [[1, 1, 1, 1]], // I
      [
        [1, 1],
        [1, 1],
      ], // O
      [
        [1, 1, 1],
        [0, 1, 0],
      ], // T
      [
        [1, 1, 1],
        [1, 0, 0],
      ], // L
      [
        [1, 1, 1],
        [0, 0, 1],
      ], // J
      [
        [1, 1, 0],
        [0, 1, 1],
      ], // S
      [
        [0, 1, 1],
        [1, 1, 0],
      ], // Z
    ];
    tetrisPiece = {
      shape: pieces[Math.floor(Math.random() * pieces.length)],
      x: 3,
      y: 0,
    };
  }

  function updateTetris() {
    if (keys["ArrowLeft"] && canMoveTetrisPiece(-1, 0)) {
      tetrisPiece.x--;
    }
    if (keys["ArrowRight"] && canMoveTetrisPiece(1, 0)) {
      tetrisPiece.x++;
    }
    if (keys["ArrowDown"] && canMoveTetrisPiece(0, 1)) {
      tetrisPiece.y++;
    }
    if (keys["Space"]) {
      while (canMoveTetrisPiece(0, 1)) {
        tetrisPiece.y++;
      }
    }

    // Gravité
    if (!canMoveTetrisPiece(0, 1)) {
      placeTetrisPiece();
      clearTetrisLines();
      spawnTetrisPiece();
      if (!canMoveTetrisPiece(0, 0)) {
        // Game Over
        initTetris();
      }
    }
  }

  function canMoveTetrisPiece(dx, dy) {
    for (let y = 0; y < tetrisPiece.shape.length; y++) {
      for (let x = 0; x < tetrisPiece.shape[y].length; x++) {
        if (tetrisPiece.shape[y][x]) {
          const newX = tetrisPiece.x + x + dx;
          const newY = tetrisPiece.y + y + dy;
          if (
            newX < 0 ||
            newX >= 10 ||
            newY >= 20 ||
            (newY >= 0 && tetrisBoard[newY][newX])
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }

  function placeTetrisPiece() {
    for (let y = 0; y < tetrisPiece.shape.length; y++) {
      for (let x = 0; x < tetrisPiece.shape[y].length; x++) {
        if (tetrisPiece.shape[y][x]) {
          tetrisBoard[tetrisPiece.y + y][tetrisPiece.x + x] = 1;
        }
      }
    }
  }

  function clearTetrisLines() {
    for (let y = 19; y >= 0; y--) {
      if (tetrisBoard[y].every((cell) => cell)) {
        tetrisBoard.splice(y, 1);
        tetrisBoard.unshift(Array(10).fill(0));
        tetrisLines++;
        tetrisScore += 100 * tetrisLevel;
        tetrisLevel = Math.floor(tetrisLines / 10) + 1;
      }
    }
  }

  function renderTetris() {
    // Fond
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 256, 240);

    // Grille
    ctx.strokeStyle = "#333";
    for (let x = 0; x <= 10; x++) {
      ctx.beginPath();
      ctx.moveTo(x * 20, 0);
      ctx.lineTo(x * 20, 200);
      ctx.stroke();
    }
    for (let y = 0; y <= 20; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * 10);
      ctx.lineTo(200, y * 10);
      ctx.stroke();
    }

    // Pièces placées
    ctx.fillStyle = "#0f0";
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 10; x++) {
        if (tetrisBoard[y][x]) {
          ctx.fillRect(x * 20 + 1, y * 10 + 1, 18, 8);
        }
      }
    }

    // Pièce active
    if (tetrisPiece) {
      ctx.fillStyle = "#f0f";
      for (let y = 0; y < tetrisPiece.shape.length; y++) {
        for (let x = 0; x < tetrisPiece.shape[y].length; x++) {
          if (tetrisPiece.shape[y][x]) {
            ctx.fillRect(
              (tetrisPiece.x + x) * 20 + 1,
              (tetrisPiece.y + y) * 10 + 1,
              18,
              8
            );
          }
        }
      }
    }

    // Score
    ctx.fillStyle = "#fff";
    ctx.font = "12px monospace";
    ctx.fillText(`Score: ${tetrisScore}`, 210, 20);
    ctx.fillText(`Level: ${tetrisLevel}`, 210, 40);
    ctx.fillText(`Lines: ${tetrisLines}`, 210, 60);
  }

  // === SNAKE ===
  let snakeBody = [];
  let snakeDir = { x: 1, y: 0 };
  let snakeFood = {};
  let snakeScore = 0;

  function initSnake() {
    snakeBody = [{ x: 10, y: 10 }];
    snakeDir = { x: 1, y: 0 };
    snakeScore = 0;
    spawnSnakeFood();
  }

  function spawnSnakeFood() {
    snakeFood = {
      x: Math.floor(Math.random() * 20),
      y: Math.floor(Math.random() * 20),
    };
  }

  function updateSnake() {
    if (keys["ArrowLeft"] && snakeDir.x === 0) snakeDir = { x: -1, y: 0 };
    if (keys["ArrowRight"] && snakeDir.x === 0) snakeDir = { x: 1, y: 0 };
    if (keys["ArrowUp"] && snakeDir.y === 0) snakeDir = { x: 0, y: -1 };
    if (keys["ArrowDown"] && snakeDir.y === 0) snakeDir = { x: 0, y: 1 };

    const head = {
      x: snakeBody[0].x + snakeDir.x,
      y: snakeBody[0].y + snakeDir.y,
    };

    // Collision avec les murs
    if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
      initSnake();
      return;
    }

    // Collision avec le corps
    if (
      snakeBody.some((segment) => segment.x === head.x && segment.y === head.y)
    ) {
      initSnake();
      return;
    }

    snakeBody.unshift(head);

    // Manger la nourriture
    if (head.x === snakeFood.x && head.y === snakeFood.y) {
      snakeScore += 10;
      spawnSnakeFood();
    } else {
      snakeBody.pop();
    }
  }

  function renderSnake() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 256, 240);

    // Serpent
    ctx.fillStyle = "#0f0";
    snakeBody.forEach((segment, i) => {
      ctx.fillRect(segment.x * 12, segment.y * 12, 10, 10);
    });

    // Nourriture
    ctx.fillStyle = "#f00";
    ctx.fillRect(snakeFood.x * 12, snakeFood.y * 12, 10, 10);

    // Score
    ctx.fillStyle = "#fff";
    ctx.font = "12px monospace";
    ctx.fillText(`Score: ${snakeScore}`, 10, 20);
  }

  // === PONG ===
  let pongPaddle1 = 80;
  let pongPaddle2 = 80;
  let pongBall = { x: 128, y: 120, vx: 2, vy: 1 };
  let pongScore1 = 0;
  let pongScore2 = 0;

  function initPong() {
    pongPaddle1 = 80;
    pongPaddle2 = 80;
    pongBall = { x: 128, y: 120, vx: 2, vy: 1 };
    pongScore1 = 0;
    pongScore2 = 0;
  }

  function updatePong() {
    // Contrôles paddle 1 (WASD)
    if (keys["KeyW"] && pongPaddle1 > 0) pongPaddle1 -= 3;
    if (keys["KeyS"] && pongPaddle1 < 160) pongPaddle1 += 3;

    // Contrôles paddle 2 (flèches)
    if (keys["ArrowUp"] && pongPaddle2 > 0) pongPaddle2 -= 3;
    if (keys["ArrowDown"] && pongPaddle2 < 160) pongPaddle2 += 3;

    // Mouvement de la balle
    pongBall.x += pongBall.vx;
    pongBall.y += pongBall.vy;

    // Collision avec les murs
    if (pongBall.y <= 0 || pongBall.y >= 240) {
      pongBall.vy = -pongBall.vy;
    }

    // Collision avec les paddles
    if (
      pongBall.x <= 10 &&
      pongBall.y >= pongPaddle1 &&
      pongBall.y <= pongPaddle1 + 40
    ) {
      pongBall.vx = -pongBall.vx;
      pongBall.vy += (pongBall.y - pongPaddle1 - 20) * 0.1;
    }
    if (
      pongBall.x >= 246 &&
      pongBall.y >= pongPaddle2 &&
      pongBall.y <= pongPaddle2 + 40
    ) {
      pongBall.vx = -pongBall.vx;
      pongBall.vy += (pongBall.y - pongPaddle2 - 20) * 0.1;
    }

    // Score
    if (pongBall.x <= 0) {
      pongScore2++;
      pongBall = { x: 128, y: 120, vx: 2, vy: 1 };
    }
    if (pongBall.x >= 256) {
      pongScore1++;
      pongBall = { x: 128, y: 120, vx: -2, vy: 1 };
    }
  }

  function renderPong() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 256, 240);

    // Paddles
    ctx.fillStyle = "#fff";
    ctx.fillRect(5, pongPaddle1, 5, 40);
    ctx.fillRect(246, pongPaddle2, 5, 40);

    // Balle
    ctx.fillRect(pongBall.x - 2, pongBall.y - 2, 4, 4);

    // Ligne centrale
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(128, 0);
    ctx.lineTo(128, 240);
    ctx.stroke();
    ctx.setLineDash([]);

    // Score
    ctx.fillStyle = "#fff";
    ctx.font = "20px monospace";
    ctx.fillText(pongScore1, 100, 30);
    ctx.fillText(pongScore2, 156, 30);
  }

  // === BREAKOUT ===
  let breakoutPaddle = 100;
  let breakoutBall = { x: 128, y: 200, vx: 2, vy: -2 };
  let breakoutBricks = [];
  let breakoutScore = 0;

  function initBreakout() {
    breakoutPaddle = 100;
    breakoutBall = { x: 128, y: 200, vx: 2, vy: -2 };
    breakoutScore = 0;

    // Créer les briques
    breakoutBricks = [];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 8; col++) {
        breakoutBricks.push({
          x: col * 32,
          y: row * 16 + 50,
          width: 30,
          height: 14,
          alive: true,
        });
      }
    }
  }

  function updateBreakout() {
    // Contrôles paddle
    if (keys["ArrowLeft"] && breakoutPaddle > 0) breakoutPaddle -= 4;
    if (keys["ArrowRight"] && breakoutPaddle < 200) breakoutPaddle += 4;

    // Mouvement de la balle
    breakoutBall.x += breakoutBall.vx;
    breakoutBall.y += breakoutBall.vy;

    // Collision avec les murs
    if (breakoutBall.x <= 0 || breakoutBall.x >= 256) {
      breakoutBall.vx = -breakoutBall.vx;
    }
    if (breakoutBall.y <= 0) {
      breakoutBall.vy = -breakoutBall.vy;
    }

    // Collision avec le paddle
    if (
      breakoutBall.y >= 200 &&
      breakoutBall.y <= 210 &&
      breakoutBall.x >= breakoutPaddle &&
      breakoutBall.x <= breakoutPaddle + 50
    ) {
      breakoutBall.vy = -breakoutBall.vy;
      breakoutBall.vx += (breakoutBall.x - breakoutPaddle - 25) * 0.1;
    }

    // Collision avec les briques
    breakoutBricks.forEach((brick) => {
      if (
        brick.alive &&
        breakoutBall.x >= brick.x &&
        breakoutBall.x <= brick.x + brick.width &&
        breakoutBall.y >= brick.y &&
        breakoutBall.y <= brick.y + brick.height
      ) {
        brick.alive = false;
        breakoutBall.vy = -breakoutBall.vy;
        breakoutScore += 10;
      }
    });

    // Game over
    if (breakoutBall.y >= 240) {
      initBreakout();
    }
  }

  function renderBreakout() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 256, 240);

    // Paddle
    ctx.fillStyle = "#fff";
    ctx.fillRect(breakoutPaddle, 210, 50, 10);

    // Balle
    ctx.fillRect(breakoutBall.x - 2, breakoutBall.y - 2, 4, 4);

    // Briques
    ctx.fillStyle = "#f0f";
    breakoutBricks.forEach((brick) => {
      if (brick.alive) {
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
      }
    });

    // Score
    ctx.fillStyle = "#fff";
    ctx.font = "12px monospace";
    ctx.fillText(`Score: ${breakoutScore}`, 10, 20);
  }

  // Démarrer avec Tetris par défaut
  const firstBtn = document.querySelector(".game-btn");
  if (firstBtn) {
    firstBtn.click();
  }
})();
