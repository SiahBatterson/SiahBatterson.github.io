export function generateRandomMap(rows, cols, config = {}) {
  const {
    baseTileChance = 0.5,
    diminishingFactor = 0.05,
    maxConsecutivePlatforms = 5,
    minVerticalSpacing = 2,
  } = config;

  let map = Array.from({ length: rows }, () => Array(cols).fill("."));

  // Ensure ground line at the bottom of the map
  for (let x = 0; x < cols; x++) {
    map[rows - 1][x] = "#";
    map[rows - 2][x] = "%"; // Ensure ground below top
  }

  let previousRowHasTop = Array(cols).fill(false);

  // Generate platforms
  for (let y = minVerticalSpacing; y < rows - 3; y++) {
    let consecutivePlatforms = 0;
    let platformCount = 0;
    let tileChance = baseTileChance;

    // Minimum tiles with controlled randomization
    if (y % 2 === 0) {
      while (
        platformCount < 4 ||
        (Math.random() < tileChance && platformCount < cols - 5)
      ) {
        let x = Math.floor(Math.random() * (cols - 4)) + 1;
        let platformLength = determinePlatformLength();

        // Place platform if empty
        for (let i = 0; i < platformLength; i++) {
          if (
            x + i < cols - 2 &&
            map[y][x + i] === "." &&
            map[y + 1][x + i] === "."
          ) {
            map[y][x + i] = "#"; // Top
            map[y + 1][x + i] = "%"; // Ground
            consecutivePlatforms++;
            platformCount++;
          }
        }
        x += platformLength; // Move forward
        tileChance -= diminishingFactor; // Decrease next platform chance
      }
    }

    for (let y = minVerticalSpacing; y < rows - 3; y++) {
      // Your platform generation logic...

      // Check and convert nested platforms
      checkNestedPlatforms(map, y, cols);
    }

    for (let x = 1; x < cols - 4; x++) {
      let rnd_number = Math.random();

      if (consecutivePlatforms > maxConsecutivePlatforms && rnd_number > 0.5) {
        map[y][x] = ".";
        consecutivePlatforms = 0;
        continue;
      }

      // Add random coins
      if (
        map[y][x] === "#" &&
        map[y - 1]?.[x] === "." &&
        Math.random() < 0.15
      ) {
        map[y - 1][x] = "C";
      }

      if (rnd_number > 0.85) {
        x += Math.floor(Math.random() * 2) + 1;
        consecutivePlatforms = 0;
      }

      previousRowHasTop[x] = map[y][x] === "#";
    }

    // Check and convert nested platforms
    checkNestedPlatforms(map, y, cols);
  }

  // Guarantee spawn area
  clearSpawnArea(map, rows, cols);

  // Ensure door placement
  placeDoor(map, cols, rows);

  return map.map((row) => row.join("")).join("\n");
}

// Determine platform length with diminishing probability
function determinePlatformLength() {
  const baseLength = 3; // Preferred length
  const platformChances = {
    3: 0.8,
    2: 0.6,
    4: 0.6,
    1: 0.4,
    5: 0.4,
  };

  const randomValue = Math.random();
  for (const [length, chance] of Object.entries(platformChances)) {
    if (randomValue < chance) {
      return parseInt(length, 10);
    }
  }
  return baseLength;
}

// Replace stacked grass tiles with ground
function checkNestedPlatforms(map, y, cols) {
  for (let x = 1; x < cols - 1; x++) {
    if (map[y][x] === "#" && map[y + 1][x] === "#" && map[y + 2]?.[x] === "%") {
      map[y + 1][x] = "%"; // Convert inner top to ground
    }
  }
}

// Clear spawn area
function clearSpawnArea(map, rows, cols) {
  const spawnX = 2;
  const spawnY = rows - 5;
  for (let y = spawnY; y < spawnY + 3; y++) {
    for (let x = spawnX; x < spawnX + 3; x++) {
      map[y][x] = ".";
    }
  }
  map[spawnY + 1][spawnX + 1] = "P"; // Player spawn point
}

// Place door with clear access
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

// Replace nested grass tiles with ground if surrounded by ground
function checkNestedPlatforms(map, y, cols) {
  for (let x = 1; x < cols - 1; x++) {
    if (
      map[y][x] === "#" &&
      map[y + 1][x] === "#" &&
      map[y + 2]?.[x] === "%" // Ground below
    ) {
      map[y + 1][x] = "%"; // Convert inner top to ground
    }

    // Specifically handle sandwich cases: top, ground, top, ground
    if (
      map[y][x] === "#" &&
      map[y + 1]?.[x] === "%" &&
      map[y + 2]?.[x] === "#" &&
      map[y + 3]?.[x] === "%"
    ) {
      map[y + 2][x] = "%"; // Convert nested top to ground
    }
  }
}
