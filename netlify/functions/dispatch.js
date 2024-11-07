const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    console.log("Event body:", event.body);

    const { data } = JSON.parse(event.body);

    const response = await fetch(
      "https://api.github.com/repos/SiahBatterson/SiahBatterson.github.io/contents/data.json",
      {
        method: "GET",
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      }
    );

    if (!response.ok)
      throw new Error(`Failed to fetch data.json. Status: ${response.status}`);

    const fileData = await response.json();
    const content = JSON.parse(
      Buffer.from(fileData.content, "base64").toString("utf-8")
    );

    content.push(data); // Add new data

    const updatedContent = Buffer.from(
      JSON.stringify(content, null, 2)
    ).toString("base64");

    const updateResponse = await fetch(
      "https://api.github.com/repos/SiahBatterson/SiahBatterson.github.io/contents/data.json",
      {
        method: "PUT",
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Update data.json via Netlify Function",
          content: updatedContent,
          sha: fileData.sha, // Ensure correct SHA
        }),
      }
    );

    if (!updateResponse.ok)
      throw new Error(
        `Failed to update data.json. Status: ${updateResponse.status}`
      );

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
