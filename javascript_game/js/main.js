let camera = {
  x: 0,
  y: 0,
  width: canvas_id.width,
  height: canvas_id.height,
};

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

  // Prevent player from moving out of bounds
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > cols * tileSize)
    player.x = cols * tileSize - player.width;

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
