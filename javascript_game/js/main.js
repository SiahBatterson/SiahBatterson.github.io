const canvas_id = document.getElementById("canvas");
const ctx = canvas_id.getContext("2d");

// Set canvas size
canvas_id.width = 1280;
canvas_id.height = 720;
const name = localStorage.getItem("playerName");
let gamerunning = true;
let levels = 1;

let timer = {
  startTime: null, // Record the time when the level starts
  currentTime: 0, // Time elapsed in seconds
};

let player = {
  x: 0,
  y: 0,
  width: 40,
  height: 40,
  speed: 7,
  velocityX: 0,
  velocityY: 0,
  jumpStrength: 17,
  gravity: 0.9,
  grounded: false,
  coins: 0,
  onWall: false, // New: to detect wall contact
  wallJumpDirection: 0, // New: -1 for left wall, 1 for right wall
};

// Door object
let door = null;

// Tile and level settings
const tileSize = 50;
const rows = 20;
const cols = 32;

// Platforms array
let platforms = [];
let coins = [];

// Camera setup
let camera = {
  x: 0,
  y: 0,
  width: canvas_id.width,
  height: canvas_id.height,
};

function generateRandomMap() {
  let map = Array.from({ length: rows }, () => Array(cols).fill("."));

  // Ensure ground line
  for (let x = 0; x < cols; x++) {
    map[rows - 1][x] = "#";
  }

  // Introduce platforms with more spacing and varied types
  for (let y = 2; y < rows - 2; y++) {
    for (let x = 1; x < cols - 4; x++) {
      let rnd_number = Math.random();
      if (Math.random() < 0.1) {
        // Control platform density
        const platformType = Math.floor(Math.random() * 4);
        switch (platformType) {
          case 0: // 2x1 platform
            map[y][x] = "#";
            map[y][x + 1] = "#";
            break;
          case 1: // 3x1 platform
            map[y][x] = "#";
            map[y - 1][x - 1] = "#";
            map[y - 1][x] = "#";
            break;
          case 2: // 4x1 platform
            map[y][x] = "#";
            map[y][x + 1] = "#";
            map[y][x + 2] = "#";
            map[y][x + 3] = "#";
            break;
          case 3: // 2x2 platform
            map[y][x] = "#";
            map[y + 1][x] = "#";
            map[y][x + 1] = "#";
            map[y + 1][x + 1] = "#";
            break;
          case 4: // 2x2 platform
            map[y][x] = "#";
            map[y - 1][x] = "#";
            map[y - 2][x] = "#";
            map[y - 2][x - 1] = "#";
            break;
        }
      } else if (
        rnd_number > 0.11 &&
        rnd_number < 0.12 &&
        map[y + 1][x + 1] != "C" &&
        map[y + 1][x] != "C" &&
        map[y][x + 1] != "C" &&
        map[y - 1][x] != "C" &&
        map[y][x - 1] != "C" &&
        map[y - 1][x - 1] != "C"
      ) {
        map[y][x] = "C";
      }
    }
  }

  // Reserve a spawn area
  const spawnX = 2;
  const spawnY = rows - 5;
  for (let y = spawnY; y < spawnY + 3; y++) {
    for (let x = spawnX; x < spawnX + 3; x++) {
      map[y][x] = ".";
    }
  }

  // Place the player start point
  map[spawnY + 1][spawnX + 1] = "P";

  // Place a door at a random valid platform location
  let placed = false;
  while (!placed) {
    const x = Math.floor(Math.random() * (cols - 2)) + 1;
    const y = Math.floor(Math.random() * (rows - 5)) + 1;
    if (map[y][x] === "#" && map[y - 1][x] === ".") {
      map[y - 1][x] = "@";
      placed = true;
    }
  }

  return map.map((row) => row.join("")).join("\n");
}

// Parse the ASCII map
function parseMap(map) {
  platforms = [];
  const rows = map.trim().split("\n");
  rows.forEach((row, y) => {
    [...row].forEach((char, x) => {
      if (char === "#") {
        platforms.push({
          x: x * tileSize,
          y: y * tileSize,
          width: tileSize,
          height: tileSize,
        });
      } else if (char === "P") {
        player.x = x * tileSize;
        player.y = y * tileSize;
      } else if (char === "@") {
        door = {
          x: x * tileSize,
          y: y * tileSize,
          width: tileSize,
          height: tileSize,
        };
      } else if (char === "C") {
        coins.push({
          x: x * tileSize,
          y: y * tileSize,
          width: tileSize / 2,
          height: tileSize / 2,
        });
      }
    });
  });
}

// Input tracking
let keys = {
  a: false,
  d: false,
};

window.addEventListener("keydown", (e) => {
  if (e.code === "Space" && player.grounded) {
    player.velocityY = -player.jumpStrength;
    player.grounded = false;
  } else if (e.code === "Space" && player.onWall) {
    // Wall jump logic
    player.velocityY = -player.jumpStrength * 1.2; // Slightly weaker than a normal jump
    player.onWall = false; // Reset wall status after jump
  }
  if (e.key === "a") keys.a = true;
  if (e.key === "d") keys.d = true;
});

window.addEventListener("keyup", (e) => {
  if (e.key === "a") keys.a = false;
  if (e.key === "d") keys.d = false;
});

// Basic AABB collision detection
function checkCollision(player, platform) {
  return (
    player.x < platform.x + platform.width &&
    player.x + player.width > platform.x &&
    player.y < platform.y + platform.height &&
    player.y + player.height > platform.y
  );
}

function resolveCollisions() {
  player.grounded = false;
  player.onWall = false;

  platforms.forEach((platform) => {
    if (checkCollision(player, platform)) {
      const dx1 = platform.x - (player.x + player.width); // Distance to platform's left
      const dx2 = platform.x + platform.width - player.x; // Distance to platform's right
      const dy1 = platform.y - (player.y + player.height); // Distance to platform's top
      const dy2 = platform.y + platform.height - player.y; // Distance to platform's bottom

      const minDist = Math.min(
        Math.abs(dx1),
        Math.abs(dx2),
        Math.abs(dy1),
        Math.abs(dy2)
      );

      if (minDist === Math.abs(dy1) && player.velocityY > 0) {
        // Ground collision
        player.y = platform.y - player.height;
        player.velocityY = 0;
        player.grounded = true;
      } else if (minDist === Math.abs(dy2) && player.velocityY < 0) {
        // Ceiling collision
        player.y = platform.y + platform.height;
        player.velocityY = 0;
      } else if (minDist === Math.abs(dx1) && player.velocityX > 0) {
        // Right wall collision
        player.x = platform.x - player.width;
        player.velocityX = 0;
        player.onWall = true;
        player.wallJumpDirection = 1;
      } else if (minDist === Math.abs(dx2) && player.velocityX < 0) {
        // Left wall collision
        player.x = platform.x + platform.width;
        player.velocityX = 0;
        player.onWall = true;
        player.wallJumpDirection = -1;
      }
    }
  });
}

function checkCoinCollision(player, coin) {
  return (
    player.x < coin.x + coin.width &&
    player.x + player.width > coin.x &&
    player.y < coin.y + coin.height &&
    player.y + player.height > coin.y
  );
}

function update() {
  if (!gamerunning) {
    return;
  }
  ctx.clearRect(0, 0, canvas_id.width, canvas_id.height);

  // Update the timer
  if (timer.startTime) {
    timer.currentTime = ((Date.now() - timer.startTime) / 1000).toFixed(2); // Update elapsed time
  }

  player.velocityY += player.gravity;

  // Horizontal movement
  player.velocityX = 0;
  if (keys.a) player.velocityX = -player.speed;
  if (keys.d) player.velocityX = player.speed;

  player.x += player.velocityX;
  player.y += player.velocityY;

  // Coin collection logic
  for (let i = coins.length - 1; i >= 0; i--) {
    if (checkCoinCollision(player, coins[i])) {
      coins.splice(i, 1); // Remove the coin from the array
      player.coins++; // Increment player's coin count
    }
  }

  player.grounded = false;
  resolveCollisions();

  // Check collision with door
  checkLevelCompletion();

  // Camera logic
  camera.x = Math.max(
    0,
    Math.min(player.x - camera.width / 2, cols * tileSize - camera.width)
  );
  camera.y = Math.max(
    0,
    Math.min(player.y - camera.height / 2, rows * tileSize - camera.height)
  );

  // Draw platforms
  ctx.fillStyle = "green";
  platforms.forEach((platform) => {
    ctx.fillRect(
      platform.x - camera.x,
      platform.y - camera.y,
      platform.width,
      platform.height
    );
  });

  // Draw coins
  ctx.fillStyle = "gold";
  coins.forEach((coin) => {
    ctx.fillRect(coin.x - camera.x, coin.y - camera.y, coin.width, coin.height);
  });

  // Draw the player
  ctx.fillStyle = "blue";
  ctx.fillRect(
    player.x - camera.x,
    player.y - camera.y,
    player.width,
    player.height
  );

  // Display the timer
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText(`Time: ${timer.currentTime}s`, 10, 60);

  // Display the coin count
  ctx.fillText(`Coins: ${player.coins}`, 10, 30);

  // Draw the door
  ctx.fillStyle = "red";
  ctx.fillRect(door.x - camera.x, door.y - camera.y, door.width, door.height);

  requestAnimationFrame(update);
}

// Reset game
function resetGame() {
  timer.startTime = Date.now(); // Record the start time
  player.coins = 0; // Reset coin count
  coins = []; // Reset coin array
  platforms = []; // Reset platforms
  const newMap = generateRandomMap();
  parseMap(newMap);
  update();
}

async function savePlayerData(name, coins, levels) {
  const playerData = { name, coins, levels };

  try {
    const response = await fetch("/data.json", {
      method: "POST", // If your server supports it
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(playerData),
    });

    if (!response.ok) {
      throw new Error("Failed to save data");
    }

    console.log("Data saved:", playerData);
  } catch (error) {
    console.error("Error saving player data:", error);
  }
}

function showLevelCompleteMenu() {
  gamerunning = false;
  levels += 1;
  const menu = document.createElement("div");
  menu.id = "levelCompleteMenu";
  menu.innerHTML = `
      <h2>Level Completed!</h2>
      <button id="returnHome">Return Home</button>
      <button id="nextLevel">Next Level</button>
    `;

  document.body.appendChild(menu);

  document.getElementById("returnHome").addEventListener("click", () => {
    savePlayerData(localStorage.getItem("playerName"), player.coins, levels);
    window.location.href = "index.html"; // Redirect to leaderboard
  });

  document.getElementById("nextLevel").addEventListener("click", () => {
    menu.remove(); // Remove menu
    startNextLevel(); // Start the next level
  });
}

function startNextLevel() {
  gamerunning = true; // Mark game as running
  resetGame(); // Restart the game for the next level
}

function savePlayerData(name, coins, levels) {
  const playerData = { name, coins, levels };

  fetch("./data.json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(playerData),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Failed to save player data");
      console.log("Player data saved:", playerData);
    })
    .catch((error) => console.error("Error saving player data:", error));
}

// Trigger the menu on level completion
function checkLevelCompletion() {
  if (
    player.x < door.x + door.width &&
    player.x + player.width > door.x &&
    player.y < door.y + door.height &&
    player.y + player.height > door.y
  ) {
    showLevelCompleteMenu(); // Show level completion menu
  }
}

// Initialize
const initialMap = generateRandomMap();
timer.startTime = Date.now();
parseMap(initialMap);
update();
