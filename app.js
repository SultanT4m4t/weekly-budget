const form = document.getElementById("entry-form");
const dateInput = document.getElementById("date");
const amountInput = document.getElementById("amount");
const errorDiv = document.getElementById("error-message");

const weeklyContainer = document.getElementById("weekly-data");
const entriesContainer = document.getElementById("entries-list");

// --- Fetch and render entries ---
async function loadEntries() {
    const res = await fetch("/api/get-entries");
    const data = await res.json();

    if (!data.length) {
        entriesContainer.innerHTML = "No entries yet";
        return;
    }

    entriesContainer.innerHTML = data
        .map(
            (entry) => `
      <div>
        <span>${entry.date}</span>
        <span>${parseFloat(entry.amount).toFixed(2)}</span>
      </div>
    `
        )
        .join("");
}

// --- Fetch and render weekly summary ---
async function loadWeeklySummary() {
    const res = await fetch("/api/get-weekly-summary");
    const data = await res.json();

    if (!data.length) {
        weeklyContainer.innerHTML = "No data yet";
        return;
    }

    weeklyContainer.innerHTML = data
        .map(
            (week) => `
      <div>
        <span>Week of ${week.week_start}</span>
        <span>${week.total.toFixed(2)}</span>
      </div>
    `
        )
        .join("");
}

// --- Handle form submission ---
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorDiv.textContent = "";

    const date = dateInput.value;
    const amount = amountInput.value;

    try {
        const res = await fetch("/api/add-entry", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ date, amount }),
        });

        const result = await res.json();

        if (!res.ok) {
            errorDiv.textContent = result.error || "Something went wrong";
            return;
        }

        // Reset form
        amountInput.value = "";
        amountInput.focus();

        // Refresh data
        await loadEntries();
        await loadWeeklySummary();

    } catch (err) {
        errorDiv.textContent = "Network error";
    }
});

// --- Initial load ---
loadEntries();
loadWeeklySummary();