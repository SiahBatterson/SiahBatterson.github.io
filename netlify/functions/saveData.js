const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  const filePath = path.resolve(__dirname, "../../data.json");

  console.log("Attempting to save data to:", filePath); // Log file path

  try {
    const newData = JSON.parse(event.body);
    console.log("Received data:", newData); // Log incoming data

    const data = fs.readFileSync(filePath, "utf-8");
    const leaderboard = JSON.parse(data);

    leaderboard.push(newData);

    fs.writeFileSync(filePath, JSON.stringify(leaderboard, null, 2));
    console.log("Data successfully written to file."); // Log success

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Data saved successfully." }),
    };
  } catch (error) {
    console.error("Error:", error.message); // Log specific error
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to save data." }),
    };
  }
};
