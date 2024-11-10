console.log("main.js loaded");
const canvas_id = document.getElementById("canvas");
const ctx = canvas_id.getContext("2d");

canvas_id.width = 800; // You can adjust this size
canvas_id.height = 600;

// Initial position and speed of the square
let square = {
  x: 100,
  y: 100,
  size: 50,
  speed: 5,
};

// Object to keep track of which keys are pressed
let keys = {
  w: false,
  a: false,
  s: false,
  d: false,
};

window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "w":
      keys.w = true;
      break;
    case "a":
      keys.a = true;
      break;
    case "s":
      keys.s = true;
      break;
    case "d":
      keys.d = true;
      break;
  }
});

window.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "w":
      keys.w = false;
      break;
    case "a":
      keys.a = false;
      break;
    case "s":
      keys.s = false;
      break;
    case "d":
      keys.d = false;
      break;
  }
});

function update() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas_id.width, canvas_id.height);

  // Update square position based on keys
  if (keys.w) square.y -= square.speed; // Move up
  if (keys.a) square.x -= square.speed; // Move left
  if (keys.s) square.y += square.speed; // Move down
  if (keys.d) square.x += square.speed; // Move right

  // Draw the square
  ctx.fillStyle = "black";
  ctx.fillRect(square.x, square.y, square.size, square.size);

  // Request next frame
  requestAnimationFrame(update);
}

update();
