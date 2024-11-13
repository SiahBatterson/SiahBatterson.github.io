const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  const filePath = path.resolve(__dirname, "../../data.json"); // Relative path to where data.json is stored

  console.log("Resolved file path:", filePath);

  try {
    const newData = JSON.parse(event.body);
    console.log("Received data to save:", newData);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.error("File not found at path:", filePath);
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "data.json file not found." }),
      };
    }

    // Read existing data from the file
    const currentData = fs.readFileSync(filePath, "utf-8");
    const leaderboard = JSON.parse(currentData);

    leaderboard.push(newData); // Add the new data

    // Write updated data back to file
    fs.writeFileSync(filePath, JSON.stringify(leaderboard, null, 2));
    console.log("Data successfully written to:", filePath);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Data saved successfully." }),
    };
  } catch (error) {
    console.error("Error during save operation:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to save data.",
        details: error.message,
      }),
    };
  }
};
