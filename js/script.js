document.addEventListener('DOMContentLoaded', function() {
    setInterval(updateClock, 1000);
    updateClock(); 

    window.onclick = function(event) {
        if (!event.target.closest('button')) {
            closeAllDropdowns();
        }
    };
});


function updateClock() {
    const now = new Date();
    const options = { 
        day: 'numeric', month: 'long', year: 'numeric', 
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
    };
    
    const clockElement = document.getElementById('liveClock');
    if (clockElement) {
        
        clockElement.textContent = now.toLocaleDateString('en-GB', options).replace(',', ' •');
    }
}

/**
 * @param {string} dropdownId 
 */
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    
    const allDropdowns = document.querySelectorAll('[id$="Dropdown"]');
    allDropdowns.forEach(d => {
        if (d.id !== dropdownId) {
            d.classList.add('hidden');
        }
    });

    if (dropdown) {
        if (dropdown.classList.contains('hidden')) {
            dropdown.classList.remove('hidden');
        } else {
            dropdown.classList.add('hidden');
        }
    }
}

function closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('[id$="Dropdown"]');
    dropdowns.forEach(d => {
        d.classList.add('hidden');
    });
}