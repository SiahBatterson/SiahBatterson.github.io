const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  const filePath = path.resolve(__dirname, "../../data.json"); // Adjust as needed

  console.log("Resolved file path:", filePath);

  try {
    const updatedEntry = JSON.parse(event.body);
    console.log("Data to update:", updatedEntry);

    if (!fs.existsSync(filePath)) {
      console.error("File not found at path:", filePath);
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "data.json file not found." }),
      };
    }

    // Read existing data
    const currentData = fs.readFileSync(filePath, "utf-8");
    const leaderboard = JSON.parse(currentData);

    // Find and update the existing entry
    const existingIndex = leaderboard.findIndex(
      (entry) => entry.name.toLowerCase() === updatedEntry.name.toLowerCase()
    );

    if (existingIndex !== -1) {
      leaderboard[existingIndex] = updatedEntry; // Update the entry
      console.log(`Updated entry for ${updatedEntry.name}`);
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Entry not found to update." }),
      };
    }

    // Write updated data back to file
    fs.writeFileSync(filePath, JSON.stringify(leaderboard, null, 2));
    console.log("Data successfully updated in:", filePath);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Data updated successfully." }),
    };
  } catch (error) {
    console.error("Error during update operation:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to update data.",
        details: error.message,
      }),
    };
  }
};
