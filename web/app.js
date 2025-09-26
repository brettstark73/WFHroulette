import { pickWFHDay, pickReason, formatDay } from "../src/util.js";

let seedInput, dateInput, resultEl, button;

const FALLBACK_REASONS = [
  "The espresso machine unionized again and refuses to froth without a formal escalation.",
  "Facilities installed a new open office concept, which is just the parking lot with Wi-Fi.",
  "IT insists my laptop needs a firmware update that only runs during full moons.",
  "Someone booked the only quiet room for a 6-hour meeting about booking quiet rooms.",
  "The corporate VPN now requires a drop of dragon blood and a faxed OTP.",
  "HR launched a mindfulness gong that rings every 45 seconds near my desk.",
  "The badge readers are being recalibrated to detect insufficient synergy.",
  "Security confiscated my keyboard because it wasn’t aligned with the brand guidelines.",
  "The office coffee is now just a suggestion written on a whiteboard.",
  "My ergonomic chair was reassigned to a visiting consultant’s emotional support cactus.",
  "The air conditioning is stuck on ‘arctic tundra’ pending a root-cause retro.",
  "Desktop Support can only fix my monitor if I bring it to the 17th floor at sunrise.",
  "Legal needs me remote to avoid conflicting with their mandatory hallway trust fall.",
  "The elevator is in use for a live-fire corporate jargon training exercise.",
  "My desk became the pilot site for experimental standing beanbag chairs.",
  "Finance scheduled a budget review on my floor and the spreadsheets emit fumes.",
  "All meeting rooms are booked for a workshop on how to book meeting rooms.",
  "The office cat union filed a grievance about me typing too loudly.",
  "Facilities replaced the windows with inspirational posters about resilience.",
  "My access card now requires three-factor authentication and a manager’s interpretive dance."
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

function renderResult(seed, baseDate) {
  try {
    const normalizedSeed = seed.trim() || "default";
    const result = pickWFHDay(normalizedSeed, baseDate);
    const reason = pickReason(normalizedSeed, result, reasons);
    const formatted = formatDay(result.date);

    // Clear and build DOM safely
    resultEl.innerHTML = '';

    const dateStrong = document.createElement('strong');
    dateStrong.textContent = formatted;

    const reasonSpan = document.createElement('span');
    reasonSpan.textContent = `Excuse: ${reason}`;

    const metaSmall = document.createElement('small');
    metaSmall.innerHTML = `Seed: <code>${escapeHtml(normalizedSeed)}</code> · ISO week ${result.isoYear}-W${String(result.isoWeek).padStart(2, "0")}`;

    resultEl.appendChild(dateStrong);
    resultEl.appendChild(reasonSpan);
    resultEl.appendChild(metaSmall);
  } catch (error) {
    resultEl.innerHTML = '';

    const errorStrong = document.createElement('strong');
    errorStrong.textContent = 'Something went sideways.';

    const errorSpan = document.createElement('span');
    errorSpan.textContent = error.message;

    resultEl.appendChild(errorStrong);
    resultEl.appendChild(errorSpan);
  }
}


function init() {
  seedInput = document.getElementById("seed");
  dateInput = document.getElementById("date");
  resultEl = document.getElementById("result");
  button = document.getElementById("pick");

  dateInput.value = currentDateISO();
  renderResult("default", new Date(`${dateInput.value}T00:00:00Z`));
  loadReasons();

  button.addEventListener("click", () => {
    const seed = seedInput.value;
    const dateValue = dateInput.value;
    const baseDate = dateValue ? new Date(`${dateValue}T00:00:00Z`) : new Date();
    if (Number.isNaN(baseDate.getTime())) {
      resultEl.innerHTML = `
        <strong>That date looked weird.</strong>
        <span>Please use YYYY-MM-DD format.</span>
      `;
      return;
    }
    renderResult(seed, baseDate);
  });
}

init();
