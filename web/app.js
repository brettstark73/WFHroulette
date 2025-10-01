import { pickWFHDay, pickReason, formatDay } from "../src/util.js";

let seedInput, employeeIdInput, dateInput, resultEl, button;

const FALLBACK_REASONS = [
  "The espresso machine unionized again and refuses to froth without a formal escalation.",
  "Facilities installed a new open office concept, which is just the parking lot with Wi-Fi.",
  "IT insists my laptop needs a firmware update that only runs during full moons.",
  "The office cat union filed a grievance about me typing too loudly.",
  "Someone replaced the motivational posters with actual mirrors that reflect our life choices."
];

let reasons = FALLBACK_REASONS;

async function loadReasons() {
  try {
    const response = await fetch("../reasons.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load reasons: ${response.status}`);
    }
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      reasons = data;
    }
  } catch (error) {
    console.warn("Using fallback reasons:", error);
  }
}

function currentDateISO() {
  const today = new Date();
  const iso = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
    .toISOString()
    .slice(0, 10);
  return iso;
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderResult(seed, baseDate, employeeId = null) {
  try {
    const normalizedSeed = seed.trim() || "default";
    const normalizedEmployeeId = employeeId && employeeId.trim() ? employeeId.trim() : null;
    const result = pickWFHDay(normalizedSeed, baseDate);
    const reason = pickReason(normalizedSeed, result, reasons, normalizedEmployeeId);
    const formatted = formatDay(result.date);

    // Clear and build DOM safely
    resultEl.innerHTML = '';

    const dateStrong = document.createElement('strong');
    dateStrong.textContent = formatted;

    const reasonSpan = document.createElement('span');
    reasonSpan.textContent = `Excuse: ${reason}`;

    resultEl.appendChild(dateStrong);
    resultEl.appendChild(reasonSpan);

    // Add highlight animation
    resultEl.classList.add('highlight');
    setTimeout(() => resultEl.classList.remove('highlight'), 500);
  } catch (error) {
    resultEl.innerHTML = '';

    const errorStrong = document.createElement('strong');
    errorStrong.textContent = 'Something went sideways.';

    const errorSpan = document.createElement('span');
    errorSpan.textContent = error.message;

    resultEl.appendChild(errorStrong);
    resultEl.appendChild(errorSpan);

    // Add highlight animation for errors too
    resultEl.classList.add('highlight');
    setTimeout(() => resultEl.classList.remove('highlight'), 500);
  }
}


function init() {
  seedInput = document.getElementById("seed");
  employeeIdInput = document.getElementById("employee-id");
  dateInput = document.getElementById("date");
  resultEl = document.getElementById("result");
  button = document.getElementById("pick");

  dateInput.value = currentDateISO();
  renderResult("default", new Date(`${dateInput.value}T00:00:00Z`));
  loadReasons();

  button.addEventListener("click", () => {
    // Add loading state
    button.disabled = true;
    button.style.opacity = '0.7';

    const seed = seedInput.value;
    const employeeId = employeeIdInput.value;
    const dateValue = dateInput.value;
    const baseDate = dateValue ? new Date(`${dateValue}T00:00:00Z`) : new Date();

    if (Number.isNaN(baseDate.getTime())) {
      resultEl.innerHTML = '';
      const errorStrong = document.createElement('strong');
      errorStrong.textContent = 'That date looked weird.';
      const errorSpan = document.createElement('span');
      errorSpan.textContent = 'Please use YYYY-MM-DD format.';
      resultEl.appendChild(errorStrong);
      resultEl.appendChild(errorSpan);

      button.disabled = false;
      button.style.opacity = '1';
      return;
    }

    // Simulate brief loading for better UX
    setTimeout(() => {
      renderResult(seed, baseDate, employeeId);
      button.disabled = false;
      button.style.opacity = '1';
    }, 150);
  });
}

init();
