async function savePlayerData(name, coins, levels) {
  const playerData = { name, coins, levels };

  try {
    const response = await fetch("/.netlify/functions/saveData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(playerData),
    });

    if (!response.ok) {
      throw new Error(`Failed to save data: ${response.statusText}`);
    }

    console.log("Player data saved:", playerData);
  } catch (error) {
    console.error("Error saving player data:", error);
  }
}
