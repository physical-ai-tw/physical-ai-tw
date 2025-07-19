const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(30, 30);  // Scale to fit 360x600

const matrix = [
  [[1, 1, 1],
   [0, 1, 0]],             // T

  [[0, 2, 2],
   [2, 2, 0]],             // S

  [[3, 3, 0],
   [0, 3, 3]],             // Z

  [[4, 4],
   [4, 4]],                // O

  [[0, 0, 5],
   [5, 5, 5]],             // L

  [[6, 0, 0],
   [6, 6, 6]],             // J

  [[7, 7, 7, 7]],          // I
];

const colors = [
  null,
  '#FF0D72',
  '#0DC2FF',
  '#0DFF72',
  '#F538FF',
  '#FF8E0D',
  '#FFE138',
  '#3877FF',
];

const arena = createMatrix(12, 20);

let player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  score: 0,
};

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let gameRunning = false;

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 &&
          (arena[y + o.y] &&
           arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
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

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
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
  let offset = 1;
  rotate(player.matrix, dir);
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

function playerReset() {
  player.matrix = createPiece();
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) -
                 (player.matrix[0].length / 2 | 0);
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
  }
}

function createPiece() {
  const rand = matrix[Math.floor(Math.random() * matrix.length)];
  return rand.map(row => row.slice()); // deep copy
}

function arenaSweep() {
  outer: for (let y = arena.length - 1; y >= 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;
    player.score += 10;
  }
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x,
                         y + offset.y,
                         1, 1);
      }
    });
  });
}

function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}

function update(time = 0) {
  if (!gameRunning) return;
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }

  draw();
  requestAnimationFrame(update);
}

function resetGameState() {
  arena.forEach(row => row.fill(0));
  player.score = 0;
  playerReset();
  dropCounter = 0;
  lastTime = 0;
}

function initControls() {
  document.getElementById('left').addEventListener('click', () => {
    if (gameRunning) playerMove(-1);
  });
  document.getElementById('right').addEventListener('click', () => {
    if (gameRunning) playerMove(1);
  });
  document.getElementById('rotate').addEventListener('click', () => {
    if (gameRunning) playerRotate(1);
  });
  document.getElementById('down').addEventListener('click', () => {
    if (gameRunning) playerDrop();
  });

  document.addEventListener('keydown', event => {
    if (!gameRunning) return;
    if (event.key === 'ArrowLeft') playerMove(-1);
    else if (event.key === 'ArrowRight') playerMove(1);
    else if (event.key === 'ArrowDown') playerDrop();
    else if (event.key === 'ArrowUp') playerRotate(1);
  });
}

document.getElementById('start').addEventListener('click', () => {
  if (!gameRunning) {
    gameRunning = true;
    resetGameState();
    update();
    document.getElementById('start').innerText = '🔁 重新開始';
  } else {
    resetGameState();
  }
});

initControls();
