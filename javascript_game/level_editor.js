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
  handleTilePlacement(x, y);
});

canvas.addEventListener("wheel", (e) => {
  const zoomIntensity = 0.1;
  zoom =
    e.deltaY < 0
      ? Math.min(2, zoom + zoomIntensity)
      : Math.max(0.5, zoom - zoomIntensity);
  drawGrid();
});

// Place or erase tiles
function handleTilePlacement(x, y) {
  if (x >= 0 && y >= 0 && x < gridWidth && y < gridHeight) {
    levelData[y][x] = isEraseMode ? 0 : selectedTile;
    drawGrid();
  }
}

// Export to ASCII
function exportToASCII() {
  return levelData.map((row) => row.join("")).join("\n");
}

// Save Level Functionality
document.getElementById("save-level").addEventListener("click", () => {
  document.getElementById("overlay").style.display = "block";
  document.getElementById("save-popup").style.display = "block";
});

document.getElementById("cancel-save").addEventListener("click", () => {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("save-popup").style.display = "none";
});

document.getElementById("confirm-save").addEventListener("click", () => {
  const levelName = document.getElementById("level-name-input").value.trim();
  if (levelName) {
    const asciiMap = exportToASCII();
    const level = { name: levelName, data: asciiMap };
    saveData("levels_data.json", level); // Save to levels_data.json
  }
  document.getElementById("overlay").style.display = "none";
  document.getElementById("save-popup").style.display = "none";
});

import { saveData } from "./dispatch.js"; // Assume this handles JSON saving

// Initialize grid and draw it
loadTextures();
initializeGrid();
drawGrid();
