const map = [
    "##########",
    "#........#",
    "#.######.#",
    "#.#....#.#",
    "#.#.##.#.#",
    "#.#.##.#.#",
    "#.#....#.#",
    "#.######.#",
    "#........#",
    "##########"
  ];
  
  const gameDiv = document.getElementById("game");
  let pacman = { x: 1, y: 1 };
  let direction = "";
  
  function drawGame() {
    gameDiv.innerHTML = "";
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
  
        if (x === pacman.x && y === pacman.y) {
          cell.classList.add("pacman");
        } else {
          const tile = map[y][x];
          if (tile === "#") {
            cell.classList.add("wall");
          } else if (tile === ".") {
            cell.classList.add("dot");
          }
        }
        gameDiv.appendChild(cell);
      }
    }
  }
  
  function setDirection(dir) {
    direction = dir;
  }
  
  function move() {
    let newX = pacman.x;
    let newY = pacman.y;
  
    if (direction === "up") newY--;
    if (direction === "down") newY++;
    if (direction === "left") newX--;
    if (direction === "right") newX++;
  
    if (map[newY][newX] !== "#") {
      pacman.x = newX;
      pacman.y = newY;
  
      if (map[newY][newX] === ".") {
        map[newY] = map[newY].substring(0, newX) + " " + map[newY].substring(newX + 1);
      }
    }
  
    drawGame();
    checkWin();
  }
  
  function checkWin() {
    for (let row of map) {
      if (row.includes(".")) return;
    }
    alert("🎉 恭喜你吃光所有豆豆！");
  }
  
  setInterval(move, 200);
  drawGame();
  