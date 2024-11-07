const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    const { data } = JSON.parse(event.body);

    const response = await fetch(
      "https://api.github.com/repos/<YOUR-USERNAME>/<REPO>/dispatches",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `token ${process.env.GITHUB_TOKEN}`, // Secure token via env variables
        },
        body: JSON.stringify({
          event_type: "update-json",
          client_payload: { data },
        }),
      }
    );

    if (response.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Success" }),
      };
    } else {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: response.statusText }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
