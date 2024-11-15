export function generateRandomMap(rows, cols, config = {}) {
  const {
    baseTileChance = 0.4, // Base chance for additional platforms every other row
    diminishingFactor = 0.03, // Reduced chance for each iteration
    maxConsecutivePlatforms = 6,
    minVerticalSpacing = 2,
  } = config;

  let map = Array.from({ length: rows }, () => Array(cols).fill("."));

  // Ensure ground line at the bottom
  for (let x = 0; x < cols; x++) {
    map[rows - 1][x] = "#";
    map[rows - 2][x] = "%"; // Ensure ground below top at the bottom
  }

  let previousRowHasTop = Array(cols).fill(false);

  // Generate platforms
  for (let y = minVerticalSpacing; y < rows - 3; y++) {
    let consecutivePlatforms = 0;
    let platformCount = 0;
    let tileChance = baseTileChance;

    // Every other row must have a minimum of 4 grid spaces
    if (y % 2 === 0) {
      while (
        platformCount < 4 ||
        (Math.random() < tileChance && platformCount < cols - 5)
      ) {
        let x = Math.floor(Math.random() * (cols - 4)) + 1;

        if (map[y][x] === "." && map[y + 1][x] === ".") {
          map[y][x] = "#"; // Top
          map[y + 1][x] = "%"; // Ground
          platformCount++;
        }
        tileChance -= diminishingFactor; // Decrease chance for the next platform
      }
    }

    for (let x = 1; x < cols - 4; x++) {
      let rnd_number = Math.random();

      if (consecutivePlatforms > maxConsecutivePlatforms && rnd_number > 0.5) {
        map[y][x] = ".";
        consecutivePlatforms = 0;
        continue;
      }

      // If there's an empty top tile, fill it with proper platform
      if (rnd_number < 0.12 && map[y][x] === ".") {
        map[y][x] = "#";
        map[y + 1][x] = "%"; // Ensure proper ground
        consecutivePlatforms++;
      }

      // Prevent stacking top tiles
      if (map[y][x] === "#" && map[y - 1]?.[x] === "#") {
        map[y][x] = ".";
      }

      // Ensure coins are placed on top tiles
      if (
        map[y][x] === "#" &&
        map[y - 1]?.[x] === "." &&
        Math.random() < 0.15
      ) {
        map[y - 1][x] = "C"; // Coin on top
      }

      if (rnd_number > 0.85) {
        x += Math.floor(Math.random() * 2) + 1; // Skip 1-2 tiles for gaps
        consecutivePlatforms = 0;
      }

      previousRowHasTop[x] = map[y][x] === "#";
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

  map[spawnY + 1][spawnX + 1] = "P"; // Player spawn

  // Ensure door placement
  placeDoor(map, cols, rows);

  return map.map((row) => row.join("")).join("\n");
}

function placeDoor(map, cols, rows) {
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
}
