console.log("main.js loaded");
const canvas_id = document.getElementById("canvas");
const ctx = canvas_id.getContext("2d");

// Set canvas size
canvas_id.width = 800;
canvas_id.height = 600;

// Player object
let player = {
  x: 100,
  y: 500,
  width: 50,
  height: 50,
  speed: 5,
  velocityY: 0,
  jumpStrength: 15,
  gravity: 0.8,
  grounded: false,
};

// ASCII map (define your level here)
const asciiMap = `
................
.....###........
.......#........
...#####........
...........#####`;

// Tile size for platforms
const tileSize = 50;

// Platforms array
let platforms = [];

// Parse the ASCII map
function parseMap(map) {
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
      }
    });
  });
}

// Object to keep track of keys
let keys = {
  a: false,
  d: false,
};

// Listen for keydown and keyup events
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

function update() {
  ctx.clearRect(0, 0, canvas_id.width, canvas_id.height);

  // Apply gravity
  player.velocityY += player.gravity;
  player.y += player.velocityY;

  // Horizontal movement
  if (keys.a) player.x -= player.speed;
  if (keys.d) player.x += player.speed;

  // Collision detection with each platform
  player.grounded = false; // Reset grounded status
  platforms.forEach((platform) => {
    if (
      player.x < platform.x + platform.width &&
      player.x + player.width > platform.x &&
      player.y < platform.y + platform.height &&
      player.y + player.height > platform.y
    ) {
      // Player is standing on a platform
      if (player.velocityY > 0) {
        // Only stop falling
        player.y = platform.y - player.height; // Place player on top of the platform
        player.velocityY = 0; // Stop vertical movement
        player.grounded = true; // Set grounded to true
      }
    }
  });

  // Prevent player from moving out of bounds
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas_id.width)
    player.x = canvas_id.width - player.width;

  // Draw the player
  ctx.fillStyle = "blue";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw the platforms
  ctx.fillStyle = "green";
  platforms.forEach((platform) => {
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
  });

  requestAnimationFrame(update);
}

// Parse the map and start the game
parseMap(asciiMap);
update();
