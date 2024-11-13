const fetch = require("node-fetch");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Ensure this is set in your Netlify environment
const REPO = "SiahBatterson/SiahBatterson.github.io"; // Replace with your repo
const FILE_PATH = "data.json"; // Path to the data.json file in your repo
const BRANCH = "main"; // Branch where data.json is located

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const newData = JSON.parse(event.body);

    // 1. Fetch the existing data.json from GitHub
    const fileResponse = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
        },
      }
    );

    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch data.json: ${fileResponse.statusText}`);
    }

    const fileData = await fileResponse.json();
    const currentContent = JSON.parse(
      Buffer.from(fileData.content, "base64").toString("utf8")
    );

    // 2. Modify the content
    currentContent.push(newData);

    // 3. Update the data.json on GitHub
    const updatedContent = Buffer.from(
      JSON.stringify(currentContent, null, 2)
    ).toString("base64");

    const commitResponse = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Add new entry to leaderboard",
          content: updatedContent,
          sha: fileData.sha, // Required to indicate you're updating the file
        }),
      }
    );

    if (!commitResponse.ok) {
      throw new Error(
        `Failed to update data.json: ${commitResponse.statusText}`
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Data saved successfully." }),
    };
  } catch (error) {
    console.error("Error:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to save data.",
        details: error.message,
      }),
    };
  }
};
