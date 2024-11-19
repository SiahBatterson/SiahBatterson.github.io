exports.handler = async (event) => {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO = "SiahBatterson/SiahBatterson.github.io";
  const FILE_PATH = "data.json";
  const BRANCH = "main";

  try {
    // Log the event body
    console.log("Event body received:", event.body);

    // Parse the incoming event body
    if (!event.body) {
      throw new Error("Request body is empty.");
    }

    const parsedBody = JSON.parse(event.body);

    // Validate client_payload structure
    if (!parsedBody.client_payload || !parsedBody.client_payload.data) {
      throw new Error("Invalid payload structure. Data not found.");
    }

    const { data } = parsedBody.client_payload;

    // Fetch and update the data.json file as before
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

    // Append the new player data
    content.push(data);

    const updatedContent = Buffer.from(
      JSON.stringify(content, null, 2)
    ).toString("base64");

    // Commit the updated data.json back to GitHub
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

    console.log("Data successfully updated on GitHub.");
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

export function saveData(fileName, data) {
  fetch(fileName)
    .then((response) => response.json())
    .then((existingData) => {
      existingData.push(data);
      const blob = new Blob([JSON.stringify(existingData, null, 2)], {
        type: "application/json",
      });

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      a.click();
    })
    .catch(() => {
      // If file doesn't exist, start a new array
      const blob = new Blob([JSON.stringify([data], null, 2)], {
        type: "application/json",
      });

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      a.click();
    });
}
