document.addEventListener("DOMContentLoaded", function () {
  setInterval(updateClock, 1000);
  updateClock();

  document.addEventListener("click", function (event) {
    const trigger = event.target.closest("[data-dropdown-toggle]");
    const dropdownId = trigger
      ? trigger.getAttribute("data-dropdown-toggle")
      : null;

    if (trigger && dropdownId) {
      toggleDropdown(dropdownId);
      return;
    }

    const insideDropdown = event.target.closest("[data-dropdown]");
    if (!insideDropdown) {
      closeAllDropdowns();
    }
  });
});

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

/**
 * @param {string} dropdownId
 */
function toggleDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) {
    return;
  }

  const shouldOpen = dropdown.classList.contains("hidden");
  closeAllDropdowns();

  if (shouldOpen) {
    dropdown.classList.remove("hidden");
  }
}

function closeAllDropdowns() {
  const dropdowns = document.querySelectorAll("[data-dropdown]");
  dropdowns.forEach((d) => {
    d.classList.add("hidden");
  });
}
