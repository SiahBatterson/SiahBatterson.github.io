const fetch = require("node-fetch");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Set this in your Netlify environment
const REPO = "your-username/your-repo"; // Replace with your GitHub repository
const FILE_PATH = "data.json"; // Path to your data.json file in the repo
const BRANCH = "main"; // The branch to work with

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const updatedEntry = JSON.parse(event.body);

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

    // 2. Find and update the existing entry
    const existingIndex = currentContent.findIndex(
      (entry) => entry.name.toLowerCase() === updatedEntry.name.toLowerCase()
    );

    if (existingIndex !== -1) {
      // Update the existing entry
      currentContent[existingIndex] = updatedEntry;
      console.log(`Updated entry for ${updatedEntry.name}`);
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Entry not found to update." }),
      };
    }

    // 3. Commit the updated content back to GitHub
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
          message: "Updated existing leaderboard entry",
          content: updatedContent,
          sha: fileData.sha, // Ensure we're updating the correct file version
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
