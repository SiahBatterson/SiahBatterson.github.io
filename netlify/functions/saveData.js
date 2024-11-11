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

  try {
    const newData = JSON.parse(event.body);
    const data = fs.readFileSync(filePath, "utf-8");
    const leaderboard = JSON.parse(data);

    leaderboard.push(newData);

    fs.writeFileSync(filePath, JSON.stringify(leaderboard, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Data saved successfully." }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to save data." }),
    };
  }
};
