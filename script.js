// Reference page elements
const dataForm = document.getElementById("dataForm");
const dataDisplay = document.getElementById("dataDisplay");

// Event listener for form submission
dataForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const name = document.getElementById("nameInput").value;
  const score = Number(document.getElementById("scoreInput").value); // Ensure score is a number

  if (!name || isNaN(score)) {
    alert("Please provide valid name and score.");
    return;
  }

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

    if (response.ok) {
      alert("Data submitted successfully!");
      fetchData(); // Refresh top scores after submission
    } else {
      alert("Failed to submit data: " + response.statusText);
    }
  } catch (error) {
    console.error("Error submitting data:", error);
    alert("Error submitting data: " + error.message);
  }
});

// Function to fetch and display top 3 scores
async function fetchData() {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/SiahBatterson/SiahBatterson.github.io/main/data.json"
    );

    if (!response.ok)
      throw new Error(`Failed to fetch data. Status: ${response.status}`);

    const data = await response.json();

    // Filter valid entries and ensure scores are numbers
    const validData = data
      .filter((entry) => entry && entry.name && !isNaN(entry.score)) // Validates entries
      .map((entry) => ({ ...entry, score: Number(entry.score) })); // Converts score to number

    // Sort by score in descending order and take the top 3
    const topScores = validData
      .sort((a, b) => b.score - a.score) // Numeric descending order
      .slice(0, 3); // Get top 3 scores

    console.log("Top 3 Scores:", topScores);

    dataDisplay.innerHTML = topScores
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
