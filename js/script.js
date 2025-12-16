document.addEventListener("DOMContentLoaded", function () {
  // Clock
  setInterval(updateClock, 1000);
  updateClock();

  // Dropdown (punyamu)
  document.addEventListener("click", function (event) {
    const trigger = event.target.closest("[data-dropdown-toggle]");
    const dropdownId = trigger ? trigger.getAttribute("data-dropdown-toggle") : null;

    if (trigger && dropdownId) {
      toggleDropdown(dropdownId);
      return;
    }

    const insideDropdown = event.target.closest("[data-dropdown]");
    if (!insideDropdown) {
      closeAllDropdowns();
    }
  });

  // Inventory features (baru)
  initInventoryListPage();
  initAddMedicinePage();

  // Global header search: press Enter in header search or click the magnifying glass to go to search page
  function performHeaderSearch(q) {
    const query = (q || '').toString().trim();
    if (!query) return;
    // absolute path to search page (works when served from local dev server)
    window.location.href = '/search.html?q=' + encodeURIComponent(query);
  }

  // Attach Enter handler to header search inputs
  const headerSearchInputs = document.querySelectorAll('input[placeholder^="Search for anything here"], input[placeholder*="Search for anything"]');
  headerSearchInputs.forEach((input) => {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        performHeaderSearch(input.value);
      }
    });
  });

  // Click handler on magnifier icons near those inputs
  document.addEventListener('click', function (e) {
    const el = e.target.closest('.fa-magnifying-glass');
    if (!el) return;
    // find nearest input sibling
    const parent = el.closest('header') || el.parentElement;
    const input = parent ? parent.querySelector('input[placeholder^="Search for anything here"], input[placeholder*="Search for anything"]') : null;
    if (input) {
      performHeaderSearch(input.value);
    }
  });

  // Ensure sidebar links navigate even if other handlers intercept clicks
  document.addEventListener(
    "click",
    function (e) {
      const anchor = e.target.closest("aside nav a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return; // ignore placeholder links

      // Force navigation (run in capture phase to beat other listeners)
      e.preventDefault();
      window.location.href = href;
    },
    true
  );
});

/* =======================
   CLOCK + DROPDOWN (lama)
   ======================= */
function updateClock() {
  const now = new Date();
  const options = {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  const clockElement = document.getElementById("liveClock");
  if (clockElement) {
    clockElement.textContent = now
      .toLocaleDateString("en-GB", options)
      .replace(",", " •");
  }
}

function toggleDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;

  const shouldOpen = dropdown.classList.contains("hidden");
  closeAllDropdowns();

  if (shouldOpen) dropdown.classList.remove("hidden");
}

function closeAllDropdowns() {
  const dropdowns = document.querySelectorAll("[data-dropdown]");
  dropdowns.forEach((d) => d.classList.add("hidden"));
}

/* =======================
   INVENTORY (baru)
   ======================= */
const STORAGE_KEY = "pharma_medicines_v1";

function seedMedicinesIfEmpty() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return;

  const seed = [
    { name: "Augmentin 625 Duo Tablet", id: "D06ID232435454", group: "Generic Medicine", qty: 350, howToUse: "", sideEffects: "" },
    { name: "Azithral 500 Tablet", id: "D06ID232435451", group: "Generic Medicine", qty: 20, howToUse: "", sideEffects: "" },
    { name: "Ascoril LS Syrup", id: "D06ID232435452", group: "Diabetes", qty: 85, howToUse: "", sideEffects: "" },
    { name: "Azee 500 Tablet", id: "D06ID232435450", group: "Generic Medicine", qty: 75, howToUse: "", sideEffects: "" },
    { name: "Allegra 120mg Tablet", id: "D06ID232435455", group: "Diabetes", qty: 44, howToUse: "", sideEffects: "" },
    { name: "Alex Syrup", id: "D06ID232435456", group: "Generic Medicine", qty: 65, howToUse: "", sideEffects: "" },
    { name: "Amoxyclav 625 Tablet", id: "D06ID232435457", group: "Generic Medicine", qty: 150, howToUse: "", sideEffects: "" },
    { name: "Avil 25 Tablet", id: "D06ID232435458", group: "Generic Medicine", qty: 270, howToUse: "", sideEffects: "" },
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
}

function getMedicines() {
  seedMedicinesIfEmpty();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveMedicines(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ---- Inventory List Page (inventory_list.html) ---- */
function initInventoryListPage() {
  const tbody = document.getElementById("medicineTbody");
  if (!tbody) return; // bukan halaman inventory_list

  const searchInput = document.getElementById("searchMedicineInput");
  const groupFilter = document.getElementById("groupFilter");
  const totalEl = document.getElementById("totalMedicinesCount");

  let all = getMedicines();

  function render(list) {
    tbody.innerHTML = list
      .map((m) => {
        const safeName = escapeHtml(m.name);
        const safeId = escapeHtml(m.id);
        const safeGroup = escapeHtml(m.group);
        const qty = Number(m.qty ?? 0);

        // link ke halaman detail (pakai query param id supaya bisa buka item spesifik)
        const detailHref = `medicine_details.html?id=${encodeURIComponent(m.id)}`;

        return `
          <tr class="bg-white border-b border-gray-100 hover:bg-gray-50">
            <td class="px-6 py-4 font-medium text-gray-900">${safeName}</td>
            <td class="px-6 py-4">${safeId}</td>
            <td class="px-6 py-4">${safeGroup}</td>
            <td class="px-6 py-4">${qty}</td>
            <td class="px-6 py-4">
              <a href="${detailHref}"
                class="text-gray-600 hover:text-teal-600 font-medium text-xs flex items-center gap-1">
                View Full Detail <i class="fa-solid fa-angles-right"></i>
              </a>
            </td>
          </tr>
        `;
      })
      .join("");

    if (totalEl) totalEl.textContent = String(list.length);
  }

  function applyFilters() {
    const q = (searchInput?.value || "").trim().toLowerCase();
    const g = (groupFilter?.value || "").trim();

    const filtered = all.filter((m) => {
      const matchQ =
        !q ||
        String(m.name).toLowerCase().includes(q) ||
        String(m.id).toLowerCase().includes(q) ||
        String(m.group).toLowerCase().includes(q);

      const matchG = !g || g === "- Select Group -" || String(m.group) === g;
      return matchQ && matchG;
    });

    render(filtered);
  }

  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (groupFilter) groupFilter.addEventListener("change", applyFilters);

  // 'Add New Item' toolbar button - navigate to add form
  const btnAdd = document.getElementById("btnAddNewItem");
  if (btnAdd) {
    btnAdd.addEventListener("click", () => {
      // page is in the same directory: inventory/inventory_list/
      window.location.href = "add_new_medicine.html";
    });
  }

  applyFilters();
}

/* ---- Add Medicine Page (add_new_medicine.html) ---- */
function initAddMedicinePage() {
  const form = document.getElementById("addMedicineForm");
  if (!form) return; // bukan halaman add

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("medName")?.value.trim();
    const id = document.getElementById("medId")?.value.trim();
    const group = document.getElementById("medGroup")?.value.trim();
    const qtyRaw = document.getElementById("medQty")?.value;
    const howToUse = document.getElementById("medHowToUse")?.value.trim() || "";
    const sideEffects = document.getElementById("medSideEffects")?.value.trim() || "";

    const qty = Number(qtyRaw);

    if (!name || !id || !group || group === "- Select Group -" || !Number.isFinite(qty)) {
      alert("Please fill: Medicine Name, Medicine ID, Medicine Group, Quantity.");
      return;
    }

    const meds = getMedicines();

    if (meds.some((m) => String(m.id).toLowerCase() === id.toLowerCase())) {
      alert("Medicine ID already exists. Please use a unique ID.");
      return;
    }

    meds.push({ name, id, group, qty, howToUse, sideEffects });
    saveMedicines(meds);

    // balik ke list (pastikan path sesuai punyamu)
    window.location.href = "inventory_list.html";
  });
}
