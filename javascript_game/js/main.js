const canvas_id = document.getElementById("canvas");
const ctx = canvas_id.getContext("2d");

import { generateRandomMap } from "./terraingeneration.js";

// Set canvas size
canvas_id.width = 1280;
canvas_id.height = 720;
const name = localStorage.getItem("playerName");
let gamerunning = true;
let levels = 1;
let addedTime = 0;

// Load textures
const platformTexture = new Image();
platformTexture.src = "textures/platform.png"; // Path to your platform texture

const groundTexture = new Image();
groundTexture.src = "textures/ground.png";

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

function generateRandomMap_() {
  return generateRandomMap();
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
          texture: "top", // Assign top for default platform texture
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
      } else if (char === "%") {
        platforms.push({
          x: x * tileSize,
          y: y * tileSize,
          width: tileSize,
          height: tileSize,
          texture: "ground", // Different texture for ground
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
    drawLevelCompleteMenu(); // Continuously redraw the menu
    requestAnimationFrame(update); // Keep the loop running for the menu
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
    if (platform.texture == "top") {
      ctx.drawImage(
        platformTexture,
        platform.x - camera.x,
        platform.y - camera.y,
        platform.width,
        platform.height
      );
    } else {
      ctx.drawImage(
        groundTexture,
        platform.x - camera.x,
        platform.y - camera.y,
        platform.width,
        platform.height
      );
    }
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
  const newMap = generateRandomMap(rows, cols);
  parseMap(newMap);
  update();
}

async function savePlayerData(name, coins, levels) {
  const playerData = { name, coins, levels };

  try {
    // Fetch the current leaderboard
    const response = await fetch(
      `./data.json?cache-bust=${new Date().getTime()}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch leaderboard data.");
    }

    const data = await response.json();

    // Check if the name already exists (case-insensitive)
    const existingIndex = data.findIndex(
      (entry) => entry.name.toLowerCase() === name.toLowerCase()
    );

    if (existingIndex !== -1) {
      // Use updateData for overwriting existing entries
      console.log(`Updating data for existing player: ${name}`);
      data[existingIndex] = playerData;
      await sendToNetlifyFunction("updateData", data);
    } else {
      // Use saveData for new entries
      console.log(`Saving new player data: ${name}`);
      data.push(playerData);
      await sendToNetlifyFunction("saveData", data);
    }

    console.log("Player data saved or updated successfully.");
  } catch (error) {
    console.error("Error saving player data:", error);
  }
}

async function sendToNetlifyFunction(functionName, payload) {
  try {
    const response = await fetch(`/.netlify/functions/${functionName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to call ${functionName}. Status: ${response.status}`
      );
    }

    const result = await response.json();
    console.log(`${functionName} response:`, result);
  } catch (error) {
    console.error(`Error calling ${functionName}:`, error);
  }
}

function showLevelCompleteMenu() {
  gamerunning = false; // Pause the game
  drawLevelCompleteMenu();

  // Temporarily disable game-level event listeners
  clearCanvasEvents();

  // Re-apply button clicks specific to menu:
  canvas_id.addEventListener("click", handleMenuClick);
}

function handleMenuClick(event) {
  const rect = canvas_id.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  // "Return Home" button bounds
  if (
    mouseX >= canvas_id.width / 2 - 150 &&
    mouseX <= canvas_id.width / 2 - 50 &&
    mouseY >= canvas_id.height / 2 + 50 &&
    mouseY <= canvas_id.height / 2 + 90
  ) {
    canvas_id.removeEventListener("click", handleMenuClick);
    returnHome();
  }

  // "Next Level" button bounds
  if (
    mouseX >= canvas_id.width / 2 + 50 &&
    mouseX <= canvas_id.width / 2 + 150 &&
    mouseY >= canvas_id.height / 2 + 50 &&
    mouseY <= canvas_id.height / 2 + 90
  ) {
    canvas_id.removeEventListener("click", handleMenuClick);
    startNextLevel();
  }
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

function showLevelCompleteMenu() {
  gamerunning = false; // Pause the game loop
  coinTime = player.coins * 0.5;
  leftoverTime = addedTime / 4;
  time_left_to_complete_level = 25 / (1 / levels) + (coinTime + leftoverTime);
  drawLevelCompleteMenu(); // Render the menu on the canvas
}

function drawButton(label, x, y, width, height) {
  ctx.fillStyle = "#007bff";
  ctx.fillRect(x, y, width, height); // Draw button

  ctx.fillStyle = "#ffffff";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.fillText(label, x + width / 2, y + height / 2 + 5); // Center label
}

// Update drawLevelCompleteMenu:
function drawLevelCompleteMenu() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, canvas_id.width, canvas_id.height);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(canvas_id.width / 2 - 150, canvas_id.height / 2 - 100, 300, 200);

  ctx.fillStyle = "#000000";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    "Level Completed!",
    canvas_id.width / 2,
    canvas_id.height / 2 - 60
  );

  ctx.fillText(
    `Coins collected: ${player.coins} (+${(player.coins * 0.5).toFixed(1)}s)`,
    canvas_id.width / 2,
    canvas_id.height / 2 - 30
  );
  ctx.fillText(
    `Leftover time: ${addedTime.toFixed(1)}s (+${(addedTime / 4).toFixed(1)}s)`,
    canvas_id.width / 2,
    canvas_id.height / 2
  );
  ctx.fillText(
    `Total time added: ${(player.coins * 0.5 + addedTime / 4).toFixed(1)}s`,
    canvas_id.width / 2,
    canvas_id.height / 2 + 30
  );

  drawButton(
    "Return Home",
    canvas_id.width / 2 - 150,
    canvas_id.height / 2 + 50,
    100,
    40
  );
  drawButton(
    "Next Level",
    canvas_id.width / 2 + 50,
    canvas_id.height / 2 + 50,
    100,
    40
  );
}

function clearCanvasEvents() {
  const cloneCanvas = canvas_id.cloneNode(true);
  canvas_id.parentNode.replaceChild(cloneCanvas, canvas_id);
}

function returnHome() {
  savePlayerData(localStorage.getItem("playerName"), player.coins, levels).then(
    () => {
      window.location.href = "../index.html"; // Redirect to the home page
    }
  );
}

function startNextLevel() {
  resetGame();
  gamerunning = true; // Resume the game
}

// Initialize
const initialMap = generateRandomMap(rows, cols);
console.log("Generated Map:\n" + initialMap);
timer.startTime = Date.now();
parseMap(initialMap);
update();
