// script.js

// Reference page elements
const titleOfPage = document.getElementById("title");
const inputDataField = document.getElementById("data-input");
const dataForm = document.getElementById("dataForm");
const dataDisplay = document.getElementById("dataDisplay");

// Event listener for form submission
dataForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const name = document.getElementById("nameInput").value;
  const score = document.getElementById("scoreInput").value;

  const data = { name, score };

  try {
    const response = await fetch(
      "https://brilliant-fox-2f7955.netlify.app/.netlify/functions/dispatch",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_type: "update-json", // Custom event for GitHub Actions
          client_payload: { data },
        }),
      }
    );

    if (response.ok) {
      alert("Data submitted successfully!");
      fetchData(); // Refresh the data display after successful submission
    } else {
      console.error("Error:", response.statusText);
      alert("Failed to submit data.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while submitting data.");
  }
});

// Function to fetch and display data
async function fetchData() {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/SiahBatterson/SiahBatterson.github.io/main/data.json"
    );

    if (!response.ok) throw new Error("Failed to fetch data.");

    const data = await response.json();

    dataDisplay.innerHTML = data
      .map((entry) => `<p>${entry.name}: ${entry.score}</p>`)
      .join("");
  } catch (error) {
    console.error("Error fetching data:", error);
    dataDisplay.innerHTML = "<p>Failed to load data.</p>";
  }
}

// Fetch and display data when the page loads
document.addEventListener("DOMContentLoaded", fetchData);
