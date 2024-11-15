export function generateRandomMap(rows, cols) {
  let map = Array.from({ length: rows }, () => Array(cols).fill("."));

  // Ensure ground line at the bottom of the map
  for (let x = 0; x < cols; x++) {
    map[rows - 1][x] = "%"; // Bottom-most row as ground
    map[rows - 2][x] = "#"; // Grass on top
  }

  // Generate platforms
  for (let y = 2; y < rows - 2; y++) {
    let consecutivePlatforms = 0;

    for (let x = 1; x < cols - 4; x++) {
      let rnd_number = Math.random();

      // Ensure platforms are reachable by breaking long flat sections
      if (consecutivePlatforms > 6 && Math.random() > 0.5) {
        map[y][x] = ".";
        consecutivePlatforms = 0; // Reset counter after breaking
        continue;
      }

      // Create platform sections
      if (rnd_number < 0.12) {
        const groundLength = Math.floor(Math.random() * 4) + 2; // Shorter sections (2-5 tiles)
        for (let i = 0; i < groundLength; i++) {
          if (x + i < cols - 2) {
            map[y + 1][x + i] = "%"; // Ground
            map[y][x + i] = "#"; // Grass
            consecutivePlatforms++;
          }
        }
        x += groundLength - 1; // Skip processed ground
      } else if (rnd_number >= 0.12 && rnd_number < 0.18) {
        // Add some isolated or elevated platforms
        const platformType = Math.floor(Math.random() * 3);
        switch (platformType) {
          case 0: // 2x1 platform
            map[y][x] = "#";
            map[y + 1][x] = "%";
            map[y][x + 1] = "#";
            map[y + 1][x + 1] = "%";
            consecutivePlatforms += 2;
            break;
          case 1: // Elevated 3x1 platform
            if (y > 1) {
              map[y][x] = "#";
              map[y + 1][x] = "%";
              map[y][x + 1] = "#";
              map[y + 1][x + 1] = "%";
              map[y][x + 2] = "#";
              map[y + 1][x + 2] = "%";
            }
            break;
          case 2: // 2x2 small island
            if (y < rows - 3) {
              map[y][x] = "#";
              map[y + 1][x] = "%";
              map[y][x + 1] = "#";
              map[y + 1][x + 1] = "%";
              consecutivePlatforms += 2;
            }
            break;
        }
      }

      // Add occasional collectible
      if (rnd_number > 0.2 && rnd_number < 0.22) {
        map[y][x] = "C"; // Place a collectible
      }

      // Ensure small gaps in flat levels
      if (rnd_number > 0.85) {
        x += Math.floor(Math.random() * 2) + 1; // Break platform gaps
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

  map[spawnY + 1][spawnX + 1] = "P"; // Set spawn point

  // Ensure a reachable door placement at the top of a ground block
  let placed = false;
  while (!placed) {
    const x = Math.floor(Math.random() * (cols - 2)) + 1;
    const y = Math.floor(Math.random() * (rows - 5)) + 1;
    if (map[y][x] === "#" && map[y + 1][x] === "%") {
      map[y - 1][x] = "@"; // Place door above ground
      placed = true;
    }
  }

  return map.map((row) => row.join("")).join("\n");
}
