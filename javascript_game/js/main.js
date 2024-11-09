console.log("main.js loaded");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContent("2d");

function update() {
  ctx.fillRect(0, 0, 50, 50);
  requestAnimationFrame(update);
}
