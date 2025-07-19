"use strict";

const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

context.scale(BLOCK_SIZE, BLOCK_SIZE);

const COLORS = [
  null,
  "#FF4136", // I (紅)
  "#0074D9", // J (藍)
  "#FFDC00", // L (黃)
  "#2ECC40", // O (綠)
  "#B10DC9", // S (紫)
  "#FF851B", // T (橘)
  "#7FDBFF"  // Z (淺藍)
];

// 七種方塊型態 (陣列內的矩陣)
const SHAPES = [
  [],
  [[1,1,1,1]], // I
  [[2,0,0],[2,2,2]], // J
  [[0,0,3],[3,3,3]], // L
  [[4,4],[4,4]],     // O
  [[0,5,5],[5,5,0]], // S
  [[0,6,0],[6,6,6]], // T
  [[7,7,0],[0,7,7]]  // Z
];

// 遊戲場地（矩陣）
function createMatrix(w, h) {
  const matrix = [];
  while(h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

// 檢查碰撞
function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for(let y=0; y < m.length; ++y) {
    for(let x=0; x < m[y].length; ++x) {
      if(m[y][x] !== 0 &&
         (arena[y + o.y] &&
          arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

// 合併玩家方塊到場地
function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if(value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

// 旋轉方塊矩陣
function rotate(matrix, dir) {
  for(let y=0; y < matrix.length; ++y) {
    for(let x=0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if(dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

// 清除一行並加分
function arenaSweep() {
  let rowCount = 0;
  outer: for(let y = arena.length - 1; y >= 0; --y) {
    for(let x = 0; x < arena[y].length; ++x) {
      if(arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++rowCount;
    ++y;
  }
  if(rowCount > 0) {
    score += rowCount * 10;
    updateScore();
  }
}

// 繪製方塊
function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if(value !== 0) {
        context.fillStyle = COLORS[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
        context.strokeStyle = "#222";
        context.lineWidth = 0.05;
        context.strokeRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

// 繪製整個畫面
function draw() {
  context.fillStyle = "#000";
  context.fillRect(0, 0, COLS, ROWS);
  drawMatrix(arena, {x:0, y:0});
  drawMatrix(player.matrix, player.pos);
}

// 更新分數顯示
function updateScore() {
  document.title = `Score: ${score}`;
}

// 玩家掉落一格
function playerDrop() {
  player.pos.y++;
  if(collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    arenaSweep();
    resetPlayer();
  }
  dropCounter = 0;
}

// 玩家向左移動
function playerMove(dir) {
  player.pos.x += dir;
  if(collide(arena, player)) {
    player.pos.x -= dir;
  }
}

// 玩家旋轉
function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while(collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if(offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

// 重新生成新方塊
function resetPlayer() {
  const pieces = 'IJLOSTZ';
  player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
  player.pos.y = 0;
  player.pos.x = (COLS / 2 | 0) - (player.matrix[0].length / 2 | 0);

  if(collide(arena, player)) {
    gameOver();
  }
}

// 生成指定形狀的方塊矩陣
function createPiece(type) {
  switch(type) {
    case 'I': return [[1,1,1,1]];
    case 'J': return [[2,0,0],[2,2,2]];
    case 'L': return [[0,0,3],[3,3,3]];
    case 'O': return [[4,4],[4,4]];
    case 'S': return [[0,5,5],[5,5,0]];
    case 'T': return [[0,6,0],[6,6,6]];
    case 'Z': return [[7,7,0],[0,7,7]];
  }
}

// 遊戲結束處理
function gameOver() {
  cancelAnimationFrame(animationId);
  startButton.classList.remove("hidden");
  alert("遊戲結束！分數：" + score);
}

// 遊戲主循環
function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if(dropCounter > dropInterval) {
    playerDrop();
  }
  draw();
  animationId = requestAnimationFrame(update);
}

// 初始化與開始遊戲
function startGame() {
  arena = createMatrix(COLS, ROWS);
  score = 0;
  updateScore();
  resetPlayer();
  startButton.classList.add("hidden");
  lastTime = 0;
  dropCounter = 0;
  dropInterval = 1000;
  animationId = requestAnimationFrame(update);
}

// 處理鍵盤控制
function keyListener(event) {
  if(!animationId) return; // 遊戲沒開始不反應

  if(event.repeat) return; // 避免連續重複觸發

  switch(event.key) {
    case "ArrowLeft": playerMove(-1); break;
    case "ArrowRight": playerMove(1); break;
    case "ArrowDown": playerDrop(); break;
    case "ArrowUp": playerRotate(1); break;
  }
}

// 處理觸控控制按鈕
function setupControls() {
  leftBtn.addEventListener("click", () => playerMove(-1));
  rightBtn.addEventListener("click", () => playerMove(1));
  downBtn.addEventListener("click", () => playerDrop());
  rotateBtn.addEventListener("click", () => playerRotate(1));
}

// 變數宣告
let arena, player = {pos: {x:0,y:0}, matrix:null};
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let score = 0;
let animationId = null;

const startButton = document.getElementById("start-button");
const leftBtn = document.getElementById("left");
const rightBtn = document.getElementById("right");
const downBtn = document.getElementById("down");
const rotateBtn = document.getElementById("rotate");

startButton.addEventListener("click", startGame);
window.addEventListener("keydown", keyListener);
setupControls();
