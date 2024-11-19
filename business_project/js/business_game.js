const canvas_id = document.getElementById("canvas");
const ctx = canvas_id.getContext("2d");

// Set canvas size
canvas_id.width = 1280;
canvas_id.height = 720;
const Business_name = localStorage.getItem("playerName");

async function savePlayerData(name) {
  const playerData = { name };

  try {
    const response = await fetch("/.netlify/functions/dispatch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_payload: {
          data: playerData,
        },
      }),
    });

    console.log("Fetch response:", response); // Log fetch response

    if (!response.ok) {
      throw new Error(`Failed to save data: ${response.statusText}`);
    }

    console.log("Data successfully saved:", await response.json()); // Confirm data is sent
  } catch (error) {
    console.error("Error saving player data:", error); // Log errors
  }
}
