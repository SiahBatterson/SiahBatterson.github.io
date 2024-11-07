const titleOfPage = document.getElementById("title");
const inputDataField = document.getElementById("data-input");

document
  .getElementById("dataForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("nameInput").value;
    const score = document.getElementById("scoreInput").value;

    const data = { name, score };

    // Send data to GitHub API via GitHub Actions
    await fetch(
      "https://api.github.com/repos/<YOUR-USERNAME>/<REPO>/dispatches",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_type: "update-json", // Custom event
          client_payload: { data },
        }),
      }
    );

    alert("Data submitted!");
  });
