const canvas = document.getElementById("editor-canvas");
const ctx = canvas.getContext("2d");
const tileSize = 32; // Size of each tile
let gridWidth = 100; // Default grid width (in tiles)
let gridHeight = 100; // Default grid height (in tiles)

let selectedTile = 1; // Default selected tile
let levelData = []; // Stores level grid data

let offsetX = 0; // Grid panning offsets
let offsetY = 0;
let zoom = 1.0; // Zoom level

let isMouseDown = false; // Tracks if the mouse is held down
let isEraseMode = false; // Tracks if we are erasing
let lastMousePos = { x: 0, y: 0 }; // For tracking panning

const textures = {};

// Load tile textures
function loadTextures() {
  const texturePaths = {
    1: "textures/grass.png", // Grass
    2: "textures/ground.png", // Ground
    3: "textures/coin.png", // Coin
    4: "textures/door.png", // Door
    5: "textures/spike.png", // Spike
    6: "textures/background.png", // Background
  };

  for (const [tileType, path] of Object.entries(texturePaths)) {
    const img = new Image();
    img.src = path;
    textures[tileType] = img;
  }
}

// Initialize the grid with empty tiles
function initializeGrid() {
  for (let y = 0; y < gridHeight; y++) {
    levelData[y] = Array(gridWidth).fill(0); // 0 indicates empty tile
  }
}

// Draw the entire grid with panning and zooming
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(zoom, zoom);
  ctx.translate(offsetX, offsetY);

  for (let y = 0; y < levelData.length; y++) {
    for (let x = 0; x < levelData[y].length; x++) {
      drawTile(x, y, levelData[y][x]);
    }
  }

  // Grid lines
  ctx.strokeStyle = "#ccc";
  for (let x = 0; x <= gridWidth * tileSize; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, gridHeight * tileSize);
    ctx.stroke();
  }
  for (let y = 0; y <= gridHeight * tileSize; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(gridWidth * tileSize, y);
    ctx.stroke();
  }

  ctx.restore();
}

// Draw an individual tile
function drawTile(x, y, type) {
  if (type !== 0 && textures[type]) {
    ctx.drawImage(
      textures[type],
      x * tileSize,
      y * tileSize,
      tileSize,
      tileSize
    );
  } else {
    ctx.fillStyle = "#fff"; // Empty space
    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
  }
}

// Panning and dragging to place tiles
canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left - offsetX) / (tileSize * zoom));
  const y = Math.floor((e.clientY - rect.top - offsetY) / (tileSize * zoom));

  if (e.button === 2) {
    isMouseDown = true;
    lastMousePos = { x: e.clientX, y: e.clientY };
  } else {
    handleTilePlacement(x, y);
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (isMouseDown && e.button === 2) {
    offsetX += (e.clientX - lastMousePos.x) / zoom;
    offsetY += (e.clientY - lastMousePos.y) / zoom;
    lastMousePos = { x: e.clientX, y: e.clientY };
    drawGrid();
  }
});

canvas.addEventListener("mouseup", () => {
  isMouseDown = false;
});

canvas.addEventListener("wheel", (e) => {
  const zoomIntensity = 0.1;
  if (e.deltaY < 0) zoom = Math.min(2, zoom + zoomIntensity);
  else zoom = Math.max(0.5, zoom - zoomIntensity);

  drawGrid();
});

// Place or erase tiles
function handleTilePlacement(x, y) {
  if (x >= 0 && y >= 0 && x < gridWidth && y < gridHeight) {
    levelData[y][x] = isEraseMode ? 0 : selectedTile;
    drawGrid();
  }
}

// Convert the grid to an ASCII map
function exportToASCII() {
  let asciiMap = "";
  for (let row of levelData) {
    asciiMap += row.join("") + "\n";
  }
  return asciiMap;
}

import { saveData } from "./dispatch.js"; // Import save function

document.getElementById("save-level").addEventListener("click", () => {
  const asciiMap = exportToASCII(); // Convert the grid to ASCII
  const level = { name: `Level_${Date.now()}`, data: asciiMap };

  saveData("levels_data.json", level);
});
// Initialize grid and draw it
loadTextures();
initializeGrid();
drawGrid();
