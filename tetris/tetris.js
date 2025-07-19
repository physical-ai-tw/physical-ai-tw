const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
context.scale(20, 20);  // 每格 20px

const matrix = [
  [0, 0, 0],
  [1, 1, 1],
  [0, 1, 0],
];

function createMatrix(w, h) {
  const m = [];
  while (h--) m.push(new Array(w).fill(0));
  return m;
}

const arena = createMatrix(10, 20);

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val) arena[y + player.pos.y][x + player.pos.x] = val;
    });
  });
}

function rotateMatrix(m) {
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [m[x][y], m[y][x]] = [m[y][x], m[x][y]];
    }
  }
  m.forEach(row => row.reverse());
}

function rotate() {
  const clone = JSON.parse(JSON.stringify(player.matrix));
  rotateMatrix(clone);
  const pos = player.pos.x;
  let offset = 1;
  player.matrix = clone;
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > clone[0].length) {
      player.matrix = JSON.parse(JSON.stringify(clone));
      player.pos.x = pos;
      return;
    }
  }
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val) {
        context.fillStyle = 'cyan';
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function draw() {
  context.fillStyle = '#111';
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}

function mergeAndSweep() {
  outer: for (let y = arena.length - 1; y >= 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (!arena[y][x]) continue outer;
    }
    arena.splice(y, 1);
    arena.unshift(new Array(arena[0].length).fill(0));
  }
}

function drop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    player.pos.y = 0;
    player.pos.x = Math.floor(arena[0].length / 2) - 1;
    mergeAndSweep();
    if (collide(arena, player)) {
      alert('💥 遊戲結束！');
      arena.forEach(row => row.fill(0));
    }
  }
  dropCounter = 0;
}

function move(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
  const delta = time - lastTime;
  lastTime = time;
  dropCounter += delta;
  if (dropCounter > dropInterval) drop();
  draw();
  requestAnimationFrame(update);
}

const player = {
  pos: { x: 3, y: 0 },
  matrix: matrix,
};

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') move(-1);
  else if (e.key === 'ArrowRight') move(1);
  else if (e.key === 'ArrowDown') drop();
  else if (e.key === 'ArrowUp') rotate();
});

update();
