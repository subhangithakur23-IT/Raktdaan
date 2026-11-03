const STORAGE_KEYS = { requests: "raktdaan_demo_requests", donors: "raktdaan_demo_donors" };

const sampleRequests = [
  { id: "sample-1", name: "Aarav (demo)", group: "O+", units: "2", city: "Delhi", hospital: "City Care Hospital (sample)", phone: "0000000000", urgency: "As soon as possible", status: "Open", sample: true },
  { id: "sample-2", name: "Meera (demo)", group: "B-", units: "1", city: "Noida", hospital: "Community Medical Centre (sample)", phone: "0000000000", urgency: "Within 24 hours", status: "Open", sample: true },
  { id: "sample-3", name: "Kabir (demo)", group: "AB+", units: "3", city: "Delhi", hospital: "Metro Health Centre (sample)", phone: "0000000000", urgency: "Within 2–3 days", status: "Open", sample: true }
];

function readStore(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}
function saveStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}
function getRequests() {
  return readStore(STORAGE_KEYS.requests, sampleRequests);
}
function renderRequests() {
  const group = document.getElementById("filterGroup").value;
  const city = document.getElementById("filterCity").value.trim().toLowerCase();
  const filtered = getRequests().filter(item =>
    (!group || item.group === group) && (!city || item.city.toLowerCase().includes(city))
  );
  const list = document.getElementById("requestList");
  document.getElementById("emptyState").hidden = filtered.length > 0;
  list.innerHTML = filtered.map(item => `
    <article class="request-card">
      <div class="request-card-top"><span class="blood-badge">${escapeHTML(item.group)}</span><span class="status">${escapeHTML(item.status || "Open")}</span></div>
      <h3>${escapeHTML(item.hospital)}</h3>
      <p>Contact: ${escapeHTML(item.name)}</p>
      <p>📍 ${escapeHTML(item.city)} &nbsp; · &nbsp; ${escapeHTML(item.units)} unit(s)</p>
      <p>⏱ ${escapeHTML(item.urgency || "As soon as possible")}</p>
      <p class="card-meta">${item.sample ? "Fictional sample listing — do not contact." : "User-submitted demo listing — verify independently."}</p>
    </article>
  `).join("");
}

document.getElementById("requestForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  const requests = getRequests();
  requests.unshift({ ...data, id: `request-${Date.now()}`, status: "Open", sample: false });
  saveStore(STORAGE_KEYS.requests, requests);
  form.reset();
  document.getElementById("requestMessage").textContent = "Request added to this browser's demo board. It has NOT been sent to a hospital or blood bank.";
  renderRequests();
});

document.getElementById("donorForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  const donors = readStore(STORAGE_KEYS.donors, []);
  donors.push({ ...data, id: `donor-${Date.now()}`, createdAt: new Date().toISOString() });
  saveStore(STORAGE_KEYS.donors, donors);
  form.reset();
  document.getElementById("donorMessage").textContent = "Interest saved in this browser only. No blood bank or patient has been notified.";
});

document.getElementById("filterGroup").addEventListener("change", renderRequests);
document.getElementById("filterCity").addEventListener("input", renderRequests);
document.getElementById("resetFilters").addEventListener("click", () => {
  document.getElementById("filterGroup").value = "";
  document.getElementById("filterCity").value = "";
  renderRequests();
});
document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("mainNav").classList.toggle("open");
});
document.querySelectorAll("#mainNav a").forEach(link => link.addEventListener("click", () => {
  document.getElementById("mainNav").classList.remove("open");
}));

// Seed clearly fictional sample data only on first launch.
if (!localStorage.getItem(STORAGE_KEYS.requests)) {
  saveStore(STORAGE_KEYS.requests, sampleRequests);
}
renderRequests();
