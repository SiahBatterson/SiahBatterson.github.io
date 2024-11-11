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
const rows = 20; // Increase rows for larger levels
const cols = 32; // Increase cols for larger levels

// Platforms array
let platforms = [];

// Camera setup
let camera = {
  x: 0,
  y: 0,
  width: canvas_id.width,
  height: canvas_id.height,
};

// Generate a random ASCII map
function generateRandomMap() {
  let map = Array.from({ length: rows }, () => Array(cols).fill("."));

  // Randomly place platforms
  for (let i = 0; i < rows * cols * 0.2; i++) {
    // Adjust density
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    map[y][x] = "#";
  }

  // Ensure ground on the last row
  for (let x = 0; x < cols; x++) {
    map[rows - 1][x] = "#";
  }

  // Place the player start point
  map[rows - 2][1] = "P"; // Starting position near the bottom left

  // Place the door on an accessible platform
  let placed = false;
  while (!placed) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    if (map[y][x] === "#" && y < rows - 1) {
      map[y - 1][x] = "@"; // Place door on a platform
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
    if (
      player.x < platform.x + platform.width &&
      player.x + player.width > platform.x &&
      player.y < platform.y + platform.height &&
      player.y + player.height > platform.y
    ) {
      if (player.velocityY > 0) {
        player.y = platform.y - player.height;
        player.velocityY = 0;
        player.grounded = true;
      }
    }
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
