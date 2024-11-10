console.log("main.js loaded");
const canvas_id = document.getElementById("canvas");
const ctx = canvas_id.getContext("2d");

function update() {
  ctx.fillRect(0, 0, 50, 50);
  requestAnimationFrame(update);
}
