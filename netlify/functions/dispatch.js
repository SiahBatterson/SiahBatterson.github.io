const fetch = require("node-fetch");

exports.handler = async (event) => {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO = "<YOUR-USERNAME>/<REPO>";
  const FILE_PATH = "data.json"; // Path to your JSON file in the repo
  const BRANCH = "main"; // Or whichever branch you're using

  try {
    const { data } = JSON.parse(event.body);

    // 1. Fetch the existing JSON file from GitHub
    const fileResponse = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
        },
      }
    );

    if (!fileResponse.ok) {
      throw new Error("Failed to fetch the existing JSON file.");
    }

    const fileData = await fileResponse.json();
    const content = JSON.parse(
      Buffer.from(fileData.content, "base64").toString("utf-8")
    );

    // 2. Append new data
    content.push(data);

    // 3. Update the JSON file
    const updatedContent = Buffer.from(
      JSON.stringify(content, null, 2)
    ).toString("base64");

    const updateResponse = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Update data.json via Netlify Function",
          content: updatedContent,
          sha: fileData.sha, // Use the existing file's SHA to avoid conflicts
          branch: BRANCH,
        }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error("Failed to update the JSON file.");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Success" }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
