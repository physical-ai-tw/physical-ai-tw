const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
context.scale(30, 30); // 30x30 pixel per block

const startButton = document.getElementById("start-button");
const leftBtn = document.getElementById("left");
const rightBtn = document.getElementById("right");
const downBtn = document.getElementById("down");
const rotateBtn = document.getElementById("rotate");

const ROWS = 20;
const COLS = 10;

let arena = createMatrix(COLS, ROWS);
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let animationId = null;

let player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  score: 0,
};

const colors = [
  null,
  "#FF0D72", // T
  "#0DC2FF", // I
  "#0DFF72", // S
  "#F538FF", // Z
  "#FF8E0D", // L
  "#FFE138", // J
  "#3877FF", // O
];

// 方塊形狀定義
function createPiece(type) {
  switch (type) {
    case "T":
      return [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
      ];
    case "O":
      return [
        [2, 2],
        [2, 2],
      ];
    case "L":
      return [
        [0, 0, 3],
        [3, 3, 3],
        [0, 0, 0],
      ];
    case "J":
      return [
        [4, 0, 0],
        [4, 4, 4],
        [0, 0, 0],
      ];
    case "I":
      return [
        [0, 5, 0, 0],
        [0, 5, 0, 0],
        [0, 5, 0, 0],
        [0, 5, 0, 0],
      ];
    case "S":
      return [
        [0, 6, 6],
        [6, 6, 0],
        [0, 0, 0],
      ];
    case "Z":
      return [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0],
      ];
  }
}

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
        context.strokeStyle = "#000";
        context.lineWidth = 0.08;
        context.strokeRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (
        m[y][x] !== 0 &&
        (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0
      ) {
        return true;
      }
    }
  }
  return false;
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    sweepArena();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerRotate(dir) {
  const pos = player.pos.x;
  rotate(player.matrix, dir);
  let offset = 1;
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) {
    matrix.forEach((row) => row.reverse());
  } else {
    matrix.reverse();
  }
}

function sweepArena() {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y >= 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    y++;
    player.score += rowCount * 10;
    rowCount *= 2;
  }
}

function playerReset() {
  const pieces = "TJLOSZI";
  player.matrix = createPiece(pieces[(pieces.length * Math.random()) | 0]);
  player.pos.y = 0;
  player.pos.x = ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);
  if (collide(arena, player)) {
    arena.forEach((row) => row.fill(0));
    cancelAnimationFrame(animationId);
    animationId = null;
    showStartButton();
  }
}

function draw() {
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}

function update(time = 0) {
  if (!animationId) return; // 遊戲結束後停止更新

  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;

  if (dropCounter > dropInterval) {
    playerDrop();
  }

  draw();
  animationId = requestAnimationFrame(update);
}

function startGame() {
  arena = createMatrix(COLS, ROWS);
  player.score = 0;
  playerReset();
  hideStartButton();
  lastTime = 0;
  dropCounter = 0;
  animationId = requestAnimationFrame(update);
}

function hideStartButton() {
  startButton.style.display = "none";
}

function showStartButton() {
  startButton.style.display = "block";
}

// 控制按鈕事件綁定，且只在遊戲開始後有效
startButton.addEventListener("click", startGame);

leftBtn.addEventListener("click", () => {
  if (animationId) playerMove(-1);
});

rightBtn.addEventListener("click", () => {
  if (animationId) playerMove(1);
});

downBtn.addEventListener("click", () => {
  if (animationId) playerDrop();
});

rotateBtn.addEventListener("click", () => {
  if (animationId) playerRotate(1);
});

// 鍵盤控制（桌機版也可用）
document.addEventListener("keydown", (event) => {
  if (!animationId) return; // 未開始遊戲或遊戲結束時無效
  if (event.repeat) return; // 避免長按重複觸發

  switch (event.key) {
    case "ArrowLeft":
      playerMove(-1);
      break;
    case "ArrowRight":
      playerMove(1);
      break;
    case "ArrowDown":
      playerDrop();
      break;
    case "ArrowUp":
    case "x":
    case "X":
      playerRotate(1);
      break;
  }
});
