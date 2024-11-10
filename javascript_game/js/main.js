console.log("main.js loaded");
const canvas_id = document.getElementById("canvas");
const ctx = canvas_id.getContext("2d");

// Set canvas size
canvas_id.width = 800;
canvas_id.height = 600;

// Player object
let player = {
  x: 100,
  y: 500, // Start near the bottom of the canvas
  width: 50,
  height: 50,
  speed: 5,
  velocityY: 0, // Vertical velocity
  jumpStrength: 15, // How high the player can jump
  gravity: 0.8, // Gravity value
  grounded: false, // Whether the player is on the ground
};

// Ground
const ground = {
  x: 0,
  y: 550, // Ground position
  width: canvas_id.width,
  height: 50,
};

// Object to keep track of keys
let keys = {
  w: false,
  a: false,
  d: false,
};

// Listen for keydown and keyup events
window.addEventListener("keydown", (e) => {
  if (e.key === "w" && player.grounded) {
    player.velocityY = -player.jumpStrength; // Jump
    player.grounded = false; // Leave the ground
  }
  if (e.key === "a") keys.a = true; // Move left
  if (e.key === "d") keys.d = true; // Move right
});

window.addEventListener("keyup", (e) => {
  if (e.key === "a") keys.a = false;
  if (e.key === "d") keys.d = false;
});

function update() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas_id.width, canvas_id.height);

  // Apply gravity
  player.velocityY += player.gravity;
  player.y += player.velocityY;

  // Horizontal movement
  if (keys.a) player.x -= player.speed;
  if (keys.d) player.x += player.speed;

  // Ground collision detection
  if (player.y + player.height > ground.y) {
    player.y = ground.y - player.height; // Reset to the top of the ground
    player.velocityY = 0; // Stop downward movement
    player.grounded = true; // Player is on the ground
  }

  // Prevent player from moving out of bounds
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas_id.width)
    player.x = canvas_id.width - player.width;

  // Draw the player
  ctx.fillStyle = "blue";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw the ground
  ctx.fillStyle = "green";
  ctx.fillRect(ground.x, ground.y, ground.width, ground.height);

  // Request next frame
  requestAnimationFrame(update);
}

update();
