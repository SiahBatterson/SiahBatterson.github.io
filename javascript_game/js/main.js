const canvas_id = document.getElementById("canvas");
const ctx = canvas_id.getContext("2d");

// Set canvas size
canvas_id.width = 1280;
canvas_id.height = 720;
const name = localStorage.getItem("playerName");
let gamerunning = true;
let levels = 1;

// Load textures
const platformTexture = new Image();
platformTexture.src = "textures/platform.png"; // Path to your platform texture

const playerTexture = new Image();
playerTexture.src = "textures/player.png"; // Path to your player texture

const coinTexture = new Image();
coinTexture.src = "textures/coin.png"; // Path to your coin texture

const doorTexture = new Image();
doorTexture.src = "textures/door.png"; // Path to your door texture

let time_left_to_complete_level = 25;

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
  onWall: false,
  wallJumpDirection: 0,
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

  // Ensure ground line at the bottom of the map
  for (let x = 0; x < cols; x++) {
    map[rows - 1][x] = "#";
  }

  // Generate platforms
  for (let y = 2; y < rows - 2; y++) {
    let consecutivePlatforms = 0;

    for (let x = 1; x < cols - 4; x++) {
      let rnd_number = Math.random();

      // Ensure platforms are reachable by breaking long flat sections
      if (consecutivePlatforms > 6 && Math.random() > 0.5) {
        map[y][x] = ".";
        consecutivePlatforms = 0; // Reset counter after breaking
        continue;
      }

      // Create platform sections
      if (rnd_number < 0.12) {
        const groundLength = Math.floor(Math.random() * 4) + 2; // Shorter sections (2-5 tiles)
        for (let i = 0; i < groundLength; i++) {
          if (x + i < cols - 2) {
            map[y][x + i] = "#"; // Set ground
            consecutivePlatforms++;
          }
        }
        x += groundLength - 1; // Skip processed ground
      } else if (rnd_number >= 0.12 && rnd_number < 0.18) {
        // Add some isolated or elevated platforms
        const platformType = Math.floor(Math.random() * 3);
        switch (platformType) {
          case 0: // 2x1 platform
            map[y][x] = "#";
            map[y][x + 1] = "#";
            consecutivePlatforms += 2;
            break;
          case 1: // Elevated 3x1 platform
            if (y - 1 > 0) {
              map[y - 1][x] = "#";
              map[y - 1][x + 1] = "#";
              map[y - 1][x + 2] = "#";
            }
            break;
          case 2: // 2x2 small island
            map[y][x] = "#";
            map[y + 1][x] = "#";
            map[y][x + 1] = "#";
            map[y + 1][x + 1] = "#";
            consecutivePlatforms += 2;
            break;
        }
      }

      // Fill unreachable gaps vertically if needed
      if (map[y][x] === "." && map[y - 1][x] === "#" && map[y + 1][x] === "#") {
        map[y][x] = "#"; // Fill gap
      }

      // Add occasional collectible
      if (rnd_number > 0.2 && rnd_number < 0.22) {
        map[y][x] = "C";
      }

      // Ensure small gaps in flat levels
      if (rnd_number > 0.85) {
        x += Math.floor(Math.random() * 2) + 1; // Break platform gaps
        consecutivePlatforms = 0;
      }
    }
  }

  // Guarantee spawn area (always clear)
  const spawnX = 2;
  const spawnY = rows - 5;
  for (let y = spawnY; y < spawnY + 3; y++) {
    for (let x = spawnX; x < spawnX + 3; x++) {
      map[y][x] = ".";
    }
  }

  map[spawnY + 1][spawnX + 1] = "P"; // Set spawn point

  // Ensure a reachable door placement at the top of a ground block
  let placed = false;
  while (!placed) {
    const x = Math.floor(Math.random() * (cols - 2)) + 1;
    const y = Math.floor(Math.random() * (rows - 5)) + 1;
    if (map[y][x] === "#" && map[y - 1][x] === ".") {
      map[y - 1][x] = "@"; // Place door
      placed = true;
    }
  }

  return map.map((row) => row.join("")).join("\n");
}

function parseMap(map) {
  platforms = [];
  coins = [];
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

// Initialization and game loop logic remains unchanged...

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

  // Update the timer
  if (timer.startTime) {
    timer.currentTime = ((Date.now() - timer.startTime) / 1000).toFixed(2); // Update elapsed time
  }

  if (timer.currentTime > time_left_to_complete_level) {
    console.log("Time is up! Redirecting to leaderboard...");
    const name = localStorage.getItem("playerName");

    gamerunning = false; // Stop the game loop
    savePlayerData(name, player.coins, levels); // Save player data
    setTimeout(() => {
      window.location.href = "../index.html"; // Redirect to leaderboard after saving
    }, 500); // Small delay to ensure save completes
    return;
  }

  ctx.clearRect(0, 0, canvas_id.width, canvas_id.height);

  player.velocityY += player.gravity;

  // Horizontal movement
  player.velocityX = 0;
  if (keys.a) player.velocityX = -player.speed;
  if (keys.d) player.velocityX = player.speed;

  player.x += player.velocityX;
  player.y += player.velocityY;

  resolveCollisions();

  // Coin collection logic
  for (let i = coins.length - 1; i >= 0; i--) {
    if (checkCoinCollision(player, coins[i])) {
      coins.splice(i, 1); // Remove the coin from the array
      player.coins++; // Increment player's coin count
    }
  }

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

  drawScene(); // Draw everything

  requestAnimationFrame(update);
}

function drawScene() {
  // Draw platforms with texture
  platforms.forEach((platform) => {
    ctx.drawImage(
      platformTexture,
      platform.x - camera.x,
      platform.y - camera.y,
      platform.width,
      platform.height
    );
  });

  // Draw coins with texture
  coins.forEach((coin) => {
    ctx.drawImage(
      coinTexture,
      coin.x - camera.x,
      coin.y - camera.y,
      coin.width,
      coin.height
    );
  });

  // Draw player with texture
  ctx.drawImage(
    playerTexture,
    player.x - camera.x,
    player.y - camera.y,
    player.width,
    player.height
  );

  // Draw door with texture
  ctx.drawImage(
    doorTexture,
    door.x - camera.x,
    door.y - camera.y,
    door.width,
    door.height
  );

  // Display the timer and coin count
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText(
    `Time: ${timer.currentTime}/${time_left_to_complete_level}s`,
    10,
    50
  ); // Display timer
  ctx.fillText(`Coins: ${player.coins}`, 10, 80); // Display coins
}

function checkCoinCollision(player, coin) {
  return (
    player.x < coin.x + coin.width &&
    player.x + player.width > coin.x &&
    player.y < coin.y + coin.height &&
    player.y + player.height > coin.y
  );
}

// Reset game
function resetGame() {
  timer.startTime = Date.now(); // Record the start time
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
  time_left_to_complete_level = 25 / (levels / 2);
  time_left_to_complete_level = Math.round(time_left_to_complete_level);
  const menu = document.createElement("div");
  menu.id = "levelCompleteMenu";
  menu.innerHTML = `
      <h2>Level Completed!</h2>
      <button id="returnHome">Return Home</button>
      <button id="nextLevel">Next Level</button>
    `;

  document.body.appendChild(menu);

  document.getElementById("returnHome").addEventListener("click", async () => {
    const name = localStorage.getItem("playerName");
    console.log(`Attempting to save data for ${name}`); // Debugging log

    await savePlayerData(name, player.coins, levels); // Save player data
    console.log("Player data saved, redirecting to index...");

    window.location.href = "../index.html"; // Redirect to leaderboard
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

async function savePlayerData(name, coins, levels) {
  const playerData = { name, coins, levels };

  try {
    const response = await fetch("/.netlify/functions/dispatch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_payload: {
          data: playerData,
        },
      }),
    });

    console.log("Fetch response:", response); // Log fetch response

    if (!response.ok) {
      throw new Error(`Failed to save data: ${response.statusText}`);
    }

    console.log("Data successfully saved:", await response.json()); // Confirm data is sent
  } catch (error) {
    console.error("Error saving player data:", error); // Log errors
  }
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
