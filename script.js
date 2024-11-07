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
          event_type: "update-json", // GitHub Actions event
          client_payload: { data },
        }),
      }
    );

    // Log response details for debugging
    const responseText = await response.text();
    console.log("Response Status:", response.status);
    console.log("Response Text:", responseText);

    if (response.ok) {
      alert("Data submitted successfully!");
      fetchData(); // Refresh data display after successful submission
    } else {
      alert("Failed to submit data: " + response.statusText);
    }
  } catch (error) {
    console.error("Error submitting data:", error);
    alert("Error submitting data: " + error.message);
  }
});

async function fetchData() {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/SiahBatterson/SiahBatterson.github.io/main/data.json"
    );

    if (!response.ok)
      throw new Error(`Failed to fetch data. Status: ${response.status}`);

    const data = await response.json();

    // Log the data fetched for debugging
    console.log("Fetched data:", data);

    dataDisplay.innerHTML = data
      .map((entry) => `<p>${entry.name}: ${entry.score}</p>`)
      .join("");
  } catch (error) {
    console.error("Error fetching data:", error);
    dataDisplay.innerHTML =
      "<p>Failed to load data. Check the console for more details.</p>";
  }
}

// Fetch and display data when the page loads
document.addEventListener("DOMContentLoaded", fetchData);
