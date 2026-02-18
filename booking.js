// ============================================
// Zlatna Lopta - Booking Calculator
// ============================================

const PRICES = {
  rentalPerHour: 10000, // RSD
  animationSmall: 8500, // RSD
  animationLarge: 15500, // RSD
  addons: {
    trophies: 2500,  // RSD
    mascot: 2500,    // RSD
    pinata: 2500,    // RSD
    toys: 2500,      // RSD
  }
};

const THEME_LABELS = {
  disco: 'Disko (Laseri, Karaoke)',
  sports: 'Tematska (Survivor, Košarka, Fudbal)',
  treasure: 'Potraga za Blagom'
};

const ADDON_LABELS = {
  trophies: 'Pehari / Trofeji',
  mascot: 'Maskota',
  pinata: 'Pinjata',
  toys: 'Dodatne Igračke'
};

// State
let state = {
  hours: 2,
  animation: 'none',
  theme: 'sports',
  addons: new Set()
};

// DOM Elements
const hoursDisplay = document.getElementById('hours-display');
const hoursMinus = document.getElementById('hours-minus');
const hoursPlus = document.getElementById('hours-plus');
const themeSection = document.getElementById('theme-section');
const priceBreakdown = document.getElementById('price-breakdown');
const priceHours = document.getElementById('price-hours');
const priceRental = document.getElementById('price-rental');
const totalRsd = document.getElementById('total-rsd');
const bookingForm = document.getElementById('booking-form');
const successModal = document.getElementById('success-modal');
const closeModal = document.getElementById('close-modal');

// Mobile menu
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
  });
}

// Hours control
hoursMinus.addEventListener('click', () => {
  if (state.hours > 2) {
    state.hours--;
    updateUI();
  }
});

hoursPlus.addEventListener('click', () => {
  if (state.hours < 8) {
    state.hours++;
    updateUI();
  }
});

// Animation selection
document.querySelectorAll('input[name="animation"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    state.animation = e.target.value;
    updateUI();
  });
});

// Theme selection
document.querySelectorAll('input[name="theme"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    state.theme = e.target.value;
    updateUI();
  });
});

// Add-ons
document.querySelectorAll('.addon-checkbox').forEach(checkbox => {
  checkbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      state.addons.add(e.target.value);
    } else {
      state.addons.delete(e.target.value);
    }
    updateUI();
  });
});

// Format number with dots as thousands separator
function formatRSD(amount) {
  return amount.toLocaleString('sr-RS').replace(/,/g, '.') + ' RSD';
}

// Calculate and update UI
function updateUI() {
  // Update hours display
  hoursDisplay.textContent = state.hours;

  // Show/hide theme section
  if (state.animation !== 'none') {
    themeSection.classList.remove('hidden');
  } else {
    themeSection.classList.add('hidden');
  }

  // Calculate prices (all in RSD)
  const rentalTotal = state.hours * PRICES.rentalPerHour;
  let total = rentalTotal;

  if (state.animation === 'small') {
    total += PRICES.animationSmall;
  } else if (state.animation === 'large') {
    total += PRICES.animationLarge;
  }

  state.addons.forEach(addon => {
    total += PRICES.addons[addon] || 0;
  });

  // Build price breakdown HTML
  let breakdownHTML = `
    <div class="flex justify-between items-center text-sm">
      <span class="text-gray-600">Iznajmljivanje (${state.hours}h)</span>
      <span class="font-bold text-gray-900">${formatRSD(rentalTotal)}</span>
    </div>
  `;

  if (state.animation === 'small') {
    breakdownHTML += `
      <div class="flex justify-between items-center text-sm">
        <span class="text-gray-600">Animacija (&lt;15 dece)</span>
        <span class="font-bold text-gray-900">${formatRSD(PRICES.animationSmall)}</span>
      </div>
    `;
  } else if (state.animation === 'large') {
    breakdownHTML += `
      <div class="flex justify-between items-center text-sm">
        <span class="text-gray-600">Animacija (15-30 dece)</span>
        <span class="font-bold text-gray-900">${formatRSD(PRICES.animationLarge)}</span>
      </div>
    `;
  }

  if (state.animation !== 'none') {
    breakdownHTML += `
      <div class="flex justify-between items-center text-sm">
        <span class="text-gray-600">Tema: ${THEME_LABELS[state.theme]}</span>
        <span class="font-bold text-pitch-600 text-xs">Uključeno</span>
      </div>
    `;
  }

  state.addons.forEach(addon => {
    breakdownHTML += `
      <div class="flex justify-between items-center text-sm">
        <span class="text-gray-600">${ADDON_LABELS[addon]}</span>
        <span class="font-bold text-gray-900">${formatRSD(PRICES.addons[addon])}</span>
      </div>
    `;
  });

  priceBreakdown.innerHTML = breakdownHTML;
  totalRsd.textContent = formatRSD(total);
}

// Form submission
bookingForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(bookingForm);
  const parentName = formData.get('parentName');
  const phone = formData.get('phone');
  const email = formData.get('email');
  const date = formData.get('date');
  const message = formData.get('message');

  // Build summary
  const rentalTotal = state.hours * PRICES.rentalPerHour;
  let total = rentalTotal;
  let animationText = 'Bez animacije';

  if (state.animation === 'small') {
    animationText = 'Manja grupa (<15 dece) - 1 animator - ' + formatRSD(PRICES.animationSmall);
    total += PRICES.animationSmall;
  } else if (state.animation === 'large') {
    animationText = 'Ve\u0107a grupa (15-30 dece) - 2 animatora - ' + formatRSD(PRICES.animationLarge);
    total += PRICES.animationLarge;
  }

  let themeText = '';
  if (state.animation !== 'none') {
    themeText = '\nTema: ' + THEME_LABELS[state.theme];
  }

  let addonsText = '';
  if (state.addons.size > 0) {
    const addonsList = [];
    state.addons.forEach(addon => {
      addonsList.push(ADDON_LABELS[addon] + ' (' + formatRSD(PRICES.addons[addon]) + ')');
      total += PRICES.addons[addon];
    });
    addonsText = '\nDodaci: ' + addonsList.join(', ');
  }

  const subject = encodeURIComponent('Rezervacija Ro\u0111endana - Zlatna Lopta');
  const body = encodeURIComponent(
    'REZERVACIJA RO\u0110ENDANA - ZLATNA LOPTA\n' +
    '========================================\n\n' +
    'KONTAKT PODACI:\n' +
    'Ime: ' + parentName + '\n' +
    'Telefon: ' + phone + '\n' +
    'Email: ' + email + '\n' +
    'Željeni datum: ' + date + '\n\n' +
    'IZABRANI PAKET:\n' +
    'Iznajmljivanje: ' + state.hours + 'h x 10.000 RSD = ' + formatRSD(rentalTotal) + '\n' +
    'Animacija: ' + animationText + '\n' +
    themeText +
    addonsText + '\n\n' +
    'UKUPNO: ' + formatRSD(total) + '\n\n' +
    (message ? 'PORUKA:\n' + message + '\n\n' : '') +
    '----------------------------------------\n' +
    'Poslato sa zlatnalopta.rs'
  );

  // Open mailto link
  window.location.href = 'mailto:andrej.nedeljkovic5@gmail.com?subject=' + subject + '&body=' + body;

  // Show success modal
  setTimeout(() => {
    successModal.classList.remove('hidden');
  }, 500);
});

// Close modal
if (closeModal) {
  closeModal.addEventListener('click', () => {
    successModal.classList.add('hidden');
  });
}

if (successModal) {
  successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
      successModal.classList.add('hidden');
    }
  });
}

// Set min date to today
const dateInput = document.getElementById('date');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
}

// Initialize
updateUI();
