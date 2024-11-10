console.log("main.js loaded");
const canvas_id = document.getElementById("canvas");
const ctx = canvas_id.getContext("2d");

canvas_id.width = 800; // You can adjust this size
canvas_id.height = 600;

function update() {
  ctx.clearRect(0, 0, canvas_id.width, canvas_id.height); // Clears the entire canvas
  ctx.fillStyle = "black"; // Set fill color for visibility
  ctx.fillRect(0, 0, 50, 50); // Draw the rectangle
  requestAnimationFrame(update);
}

update();
