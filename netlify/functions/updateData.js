const fetch = require("node-fetch");
const { GITHUB_TOKEN, REPO, FILE_PATH, BRANCH } = process.env;

exports.handler = async (event) => {
  try {
    const updatedData = JSON.parse(event.body);

    // Fetch current data.json from GitHub
    const fileResponse = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
        },
      }
    );

    if (!fileResponse.ok) {
      throw new Error("Failed to fetch file from GitHub.");
    }

    const fileData = await fileResponse.json();

    // Update file content
    const updatedContent = Buffer.from(
      JSON.stringify(updatedData, null, 2)
    ).toString("base64");

    // Commit changes to GitHub
    const commitResponse = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Update leaderboard data",
          content: updatedContent,
          sha: fileData.sha,
        }),
      }
    );

    if (!commitResponse.ok) {
      throw new Error(
        `Failed to update file on GitHub. Status: ${commitResponse.status}`
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Leaderboard updated successfully." }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
