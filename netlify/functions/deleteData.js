const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    // Parse the request body to get the name
    const { name } = JSON.parse(event.body);

    if (!name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing name parameter" }),
      };
    }

    // Path to the data.json file
    const dataFilePath = path.resolve(__dirname, "../../data.json");

    // Read the current data
    const data = JSON.parse(fs.readFileSync(dataFilePath, "utf-8"));

    // Filter out the entry with the given name
    const updatedData = data.filter((entry) => entry.name !== name);

    if (data.length === updatedData.length) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: "Entry with the specified name not found",
        }),
      };
    }

    // Write the updated data back to the file
    fs.writeFileSync(dataFilePath, JSON.stringify(updatedData, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Entry deleted successfully" }),
    };
  } catch (error) {
    console.error("Error deleting entry:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
