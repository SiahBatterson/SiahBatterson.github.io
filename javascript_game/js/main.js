const canvas_id = document.getElementById("canvas");
const ctx = canvas_id.getContext("2d");

// Set canvas size
canvas_id.width = 1280;
canvas_id.height = 720;

// Player object
let player = {
  x: 0,
  y: 0,
  width: 50,
  height: 50,
  speed: 5,
  velocityY: 0,
  jumpStrength: 15,
  gravity: 0.8,
  grounded: false,
};

// Door object
let door = null;

// Tile and level settings
const tileSize = 50;
const rows = 20; // Larger level size
const cols = 32;

// Platforms array
let platforms = [];

// Camera setup
let camera = {
  x: 0,
  y: 0,
  width: canvas_id.width,
  height: canvas_id.height,
};

// Generate a random ASCII map with bias
function generateRandomMap() {
  let map = Array.from({ length: rows }, () => Array(cols).fill("."));

  // Introduce bias for platform placement
  for (let y = 2; y < rows - 1; y++) {
    // Avoid first row for platforms
    for (let x = 1; x < cols - 1; x++) {
      if (Math.random() < 0.2 + y * 0.02) {
        // Higher probability for lower rows
        map[y][x] = "#";

        // Add some connectivity bias
        if (Math.random() < 0.3) {
          map[y][x - 1] = "#";
          map[y][x + 1] = "#";
        }
      }
    }
  }

  // Ensure ground on the last row
  for (let x = 0; x < cols; x++) {
    map[rows - 1][x] = "#";
  }

  // Place the player start point
  map[rows - 2][1] = "P";

  // Place the door on an accessible platform
  let placed = false;
  while (!placed) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * (rows - 2)); // Avoid last row for door
    if (map[y][x] === "#") {
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
  }
  if (e.key === "a") keys.a = true;
  if (e.key === "d") keys.d = true;
});

window.addEventListener("keyup", (e) => {
  if (e.key === "a") keys.a = false;
  if (e.key === "d") keys.d = false;
});

// Collision detection for all sides
function checkCollision(player, platform) {
  const playerBottom = player.y + player.height;
  const playerTop = player.y;
  const playerRight = player.x + player.width;
  const playerLeft = player.x;

  const platformBottom = platform.y + platform.height;
  const platformTop = platform.y;
  const platformRight = platform.x + platform.width;
  const platformLeft = platform.x;

  // Top collision
  if (
    playerBottom > platformTop &&
    playerTop < platformTop &&
    playerRight > platformLeft &&
    playerLeft < platformRight
  ) {
    player.y = platformTop - player.height;
    player.velocityY = 0;
    player.grounded = true;
  }

  // Bottom collision
  if (
    playerTop < platformBottom &&
    playerBottom > platformBottom &&
    playerRight > platformLeft &&
    playerLeft < platformRight
  ) {
    player.y = platformBottom;
    player.velocityY = 0.5; // Prevent snapping
  }

  // Left collision
  if (
    playerRight > platformLeft &&
    playerLeft < platformLeft &&
    playerBottom > platformTop &&
    playerTop < platformBottom
  ) {
    player.x = platformLeft - player.width;
  }

  // Right collision
  if (
    playerLeft < platformRight &&
    playerRight > platformRight &&
    playerBottom > platformTop &&
    playerTop < platformBottom
  ) {
    player.x = platformRight;
  }
}

// Update and render loop
function update() {
  ctx.clearRect(0, 0, canvas_id.width, canvas_id.height);

  // Apply gravity
  player.velocityY += player.gravity;
  player.y += player.velocityY;

  // Horizontal movement
  if (keys.a) player.x -= player.speed;
  if (keys.d) player.x += player.speed;

  // Collision detection with platforms
  player.grounded = false;
  platforms.forEach((platform) => {
    checkCollision(player, platform);
  });

  // Check collision with door
  if (
    player.x < door.x + door.width &&
    player.x + player.width > door.x &&
    player.y < door.y + door.height &&
    player.y + player.height > door.y
  ) {
    alert("Level Completed!");
    resetGame();
  }

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

  // Draw the player
  ctx.fillStyle = "blue";
  ctx.fillRect(
    player.x - camera.x,
    player.y - camera.y,
    player.width,
    player.height
  );

  // Draw the door
  ctx.fillStyle = "red";
  ctx.fillRect(door.x - camera.x, door.y - camera.y, door.width, door.height);

  requestAnimationFrame(update);
}

// Reset the game
function resetGame() {
  const newMap = generateRandomMap();
  parseMap(newMap);
}

// Initialize
const initialMap = generateRandomMap();
parseMap(initialMap);
update();
