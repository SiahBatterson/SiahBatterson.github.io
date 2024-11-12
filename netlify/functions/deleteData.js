const fetch = require("node-fetch");

exports.handler = async (event) => {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO = "SiahBatterson/SiahBatterson.github.io";
  const FILE_PATH = "data.json";
  const BRANCH = "main";

  try {
    console.log("Event body received:", event.body);

    if (!event.body) {
      throw new Error("Request body is empty.");
    }

    const parsedBody = JSON.parse(event.body);

    if (!parsedBody.name) {
      throw new Error("Missing 'name' parameter in request body.");
    }

    const nameToDelete = parsedBody.name;

    // Fetch the current data.json file from GitHub
    const fileResponse = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
        },
      }
    );

    if (!fileResponse.ok) {
      throw new Error(
        `Failed to fetch data.json: ${fileResponse.status} ${fileResponse.statusText}`
      );
    }

    const fileData = await fileResponse.json();
    const content = JSON.parse(
      Buffer.from(fileData.content, "base64").toString("utf-8")
    );

    // Filter out the entry with the given name
    const updatedContent = content.filter(
      (entry) => entry.name !== nameToDelete
    );

    if (content.length === updatedContent.length) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Entry not found" }),
      };
    }

    // Convert updated data to base64 for GitHub API
    const newContentBase64 = Buffer.from(
      JSON.stringify(updatedContent, null, 2)
    ).toString("base64");

    // Commit the updated data back to GitHub
    const updateResponse = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Delete entry from data.json via Netlify Function",
          content: newContentBase64,
          sha: fileData.sha, // Use the SHA from the current file
        }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error(
        `Failed to update data.json: ${updateResponse.status} ${updateResponse.statusText}`
      );
    }

    console.log("Entry successfully deleted from GitHub.");
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Entry deleted successfully" }),
    };
  } catch (error) {
    console.error("Function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
