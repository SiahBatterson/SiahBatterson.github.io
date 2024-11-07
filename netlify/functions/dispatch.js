const fetch = require("node-fetch");

exports.handler = async (event) => {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO = "SiahBatterson/SiahBatterson.github.io";
  const FILE_PATH = "data.json";
  const BRANCH = "main";

  try {
    console.log("Received event:", event.body);

    const { data } = JSON.parse(event.body);

    // Step 1: Fetch current data.json
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

    content.push(data); // Append new data

    const updatedContent = Buffer.from(
      JSON.stringify(content, null, 2)
    ).toString("base64");

    // Step 3: Update data.json
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
          sha: fileData.sha,
        }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error(
        `Failed to update data.json: ${updateResponse.status} ${updateResponse.statusText}`
      );
    }

    console.log("Data successfully updated.");
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Data submitted successfully" }),
    };
  } catch (error) {
    console.error("Function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
