async function savePlayerData(name, score, coins, levels) {
  const playerData = { name, score, coins, levels };

  try {
    const response = await fetch("./data.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(playerData), // Send new player data
    });

    if (!response.ok) {
      throw new Error("Failed to save player data");
    }

    console.log("Player data saved successfully.");
  } catch (error) {
    console.error("Error saving player data:", error);
  }
}
