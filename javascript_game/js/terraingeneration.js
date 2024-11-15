export function generateRandomMap(rows, cols, config = {}) {
  const {
    maxConsecutivePlatforms = 5,
    minVerticalSpacing = 2,
    specialTileChance = 0.05,
  } = config;

  let map = Array.from({ length: rows }, () => Array(cols).fill("."));

  // Ensure ground line at the bottom of the map
  for (let x = 0; x < cols; x++) {
    map[rows - 1][x] = "#";
  }

  let previousRowHasTop = Array(cols).fill(false);

  // Generate platforms
  for (let y = minVerticalSpacing; y < rows - 2; y++) {
    let consecutivePlatforms = 0;

    for (let x = 1; x < cols - 4; x++) {
      let rnd_number = Math.random();

      if (
        consecutivePlatforms > maxConsecutivePlatforms &&
        Math.random() > 0.5
      ) {
        map[y][x] = ".";
        consecutivePlatforms = 0;
        continue;
      }

      if (rnd_number < 0.12 && !previousRowHasTop[x]) {
        const groundLength = Math.floor(Math.random() * 4) + 2;
        for (let i = 0; i < groundLength; i++) {
          if (x + i < cols - 2) {
            map[y + 1][x + i] = "%";
            map[y][x + i] = "#";
            consecutivePlatforms++;
          }
        }
        x += groundLength - 1;
      }

      // Place patterns like L-shapes or tall pieces
      else if (rnd_number >= 0.13 && rnd_number < 0.14) {
        placeRandomPattern(map, x, y);
      }

      // Add special tile randomly
      if (Math.random() < specialTileChance && map[y + 1][x] !== "#") {
        map[y][x] = "G"; // Special tile
      }

      previousRowHasTop[x] = map[y][x] === "#";

      if (rnd_number > 0.85) {
        x += Math.floor(Math.random() * 2) + 1;
        consecutivePlatforms = 0;
      }
    }
  }

  // Guarantee spawn area (always clear)
  const spawnX = 2;
  const spawnY = rows - 5;
  for (let y = spawnY; y < spawnY + 3; y++) {
    for (let x = spawnX; x < spawnX + 3; x++) {
      map[y][x] = ".";
    }
  }

  map[spawnY + 1][spawnX + 1] = "P"; // Player spawn point

  // Ensure a reachable door placement
  let placed = false;
  while (!placed) {
    const x = Math.floor(Math.random() * (cols - 2)) + 1;
    const y = Math.floor(Math.random() * (rows - 5)) + 1;

    if (map[y][x] === "#" && map[y - 1][x] === ".") {
      map[y - 1][x] = "@"; // Place door
      placed = true;

      // Clear path to door
      for (let clearY = Math.max(0, y - 3); clearY <= y - 1; clearY++) {
        for (
          let clearX = Math.max(0, x - 2);
          clearX <= Math.min(cols - 1, x + 2);
          clearX++
        ) {
          if (map[clearY][clearX] !== "@") {
            map[clearY][clearX] = ".";
          }
        }
      }
    }
  }

  return map.map((row) => row.join("")).join("\n");
}

// Helper function to place random patterns like L-shaped or tall pieces
function placeRandomPattern(map, x, y) {
  const patternType = Math.floor(Math.random() * 3);
  switch (patternType) {
    case 0: // L-shape
      if (y + 2 < map.length && x + 1 < map[0].length) {
        map[y][x] = "#";
        map[y + 1][x] = "%";
        map[y + 2][x] = "%";
        map[y + 2][x + 1] = "#";
        map[y + 3][x + 1] = "%";
      }
      break;

    case 1: // Tall piece
      if (y + 3 < map.length) {
        map[y][x] = "#";
        map[y + 1][x] = "%";
        map[y + 2][x] = "%";
        map[y + 3][x] = "%";
      }
      break;

    case 2: // Floating small island
      if (y > 2 && x + 2 < map[0].length) {
        map[y][x] = "#";
        map[y][x + 1] = "#";
        map[y][x + 2] = "#";
        map[y + 1][x + 1] = "%";
      }
      break;
  }
}
