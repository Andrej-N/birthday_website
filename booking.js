// ============================================
// Zlatna Lopta - Booking Calculator
// ============================================

// EmailJS Configuration
const EMAILJS_PUBLIC_KEY = 'LWB7_LRvZ_EDm6VbI';
const EMAILJS_SERVICE_ID = 'service_j3c8sdt';
const EMAILJS_TEMPLATE_ID = 'template_ykc7ccp';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

const PRICES = {
  rentalPerHour: 10000, // RSD
  animatorSmall: 6000,  // RSD (<15 dece, 1 animator) - PROMO
  animatorLarge: 12000, // RSD (15-30 dece, 2 animatora) - PROMO
  olympicPackage: 26000, // RSD (includes animators)
  addons: {
    medals: 6000,     // RSD
    photo: 12000,     // RSD
    photovideo: 18000, // RSD
    disco: 6000,      // RSD
  }
};

const PROGRAM_LABELS = {
  none: 'Bez animacije',
  sports: 'Survivor / Fudbal / Košarka',
  olympic: 'Olimpijske Igre (Premium)',
  treasure: 'Potraga za Blagom'
};

const ADDON_LABELS = {
  medals: 'Medalje i Pehar',
  photo: 'Slikanje',
  photovideo: 'Slikanje i Snimanje',
  disco: 'Disco Party'
};

// State
let state = {
  hours: 2,
  program: 'none',    // none, sports, olympic, treasure
  animator: 'small',   // small, large (only for sports)
  addons: new Set(),
  foodInterest: false,
  cakeInterest: false
};

// DOM Elements
const hoursDisplay = document.getElementById('hours-display');
const hoursMinus = document.getElementById('hours-minus');
const hoursPlus = document.getElementById('hours-plus');
const animatorSection = document.getElementById('animator-section');
const olympicInfo = document.getElementById('olympic-info');
const treasureInfo = document.getElementById('treasure-info');
const priceBreakdown = document.getElementById('price-breakdown');
const totalPrice = document.getElementById('total-price');
const totalEur = document.getElementById('total-eur');
const inquiryNote = document.getElementById('inquiry-note');
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

// Program selection
document.querySelectorAll('input[name="program"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    state.program = e.target.value;
    updateUI();
  });
});

// Animator selection
document.querySelectorAll('input[name="animator"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    state.animator = e.target.value;
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

// Food & Cake interest
document.getElementById('food-interest').addEventListener('change', (e) => {
  state.foodInterest = e.target.checked;
  updateUI();
});
document.getElementById('cake-interest').addEventListener('change', (e) => {
  state.cakeInterest = e.target.checked;
  updateUI();
});

// Format number with dots as thousands separator
function formatRSD(amount) {
  return amount.toLocaleString('sr-RS').replace(/,/g, '.') + ' RSD';
}

// Calculate and update UI
function updateUI() {
  // Update hours display
  hoursDisplay.textContent = state.hours;

  // Show/hide sections based on program
  animatorSection.classList.toggle('hidden', state.program !== 'sports');
  olympicInfo.classList.toggle('hidden', state.program !== 'olympic');
  treasureInfo.classList.toggle('hidden', state.program !== 'treasure');

  // Calculate prices (all in RSD)
  const rentalTotal = state.hours * PRICES.rentalPerHour;
  let total = rentalTotal;
  let hasInquiryItems = false;

  // Program cost
  if (state.program === 'sports') {
    total += state.animator === 'small' ? PRICES.animatorSmall : PRICES.animatorLarge;
  } else if (state.program === 'olympic') {
    total += PRICES.olympicPackage;
  } else if (state.program === 'treasure') {
    hasInquiryItems = true;
  }

  // Addons
  state.addons.forEach(addon => {
    total += PRICES.addons[addon] || 0;
  });

  // Food/cake inquiry
  if (state.foodInterest || state.cakeInterest) {
    hasInquiryItems = true;
  }

  // Build price breakdown HTML
  let breakdownHTML = `
    <div class="flex justify-between items-center text-sm">
      <span class="text-gray-600">Iznajmljivanje (${state.hours}h)</span>
      <span class="font-bold text-gray-900">${formatRSD(rentalTotal)}</span>
    </div>
  `;

  if (state.program === 'sports') {
    const animLabel = state.animator === 'small' ? '1 animator (<15 dece)' : '2 animatora (15-30 dece)';
    const animPrice = state.animator === 'small' ? PRICES.animatorSmall : PRICES.animatorLarge;
    breakdownHTML += `
      <div class="flex justify-between items-center text-sm">
        <span class="text-gray-600">${animLabel}</span>
        <span class="font-bold text-gray-900">${formatRSD(animPrice)}</span>
      </div>
      <div class="flex justify-between items-center text-sm">
        <span class="text-gray-600">Tema: Survivor/Fudbal/Košarka</span>
        <span class="font-bold text-pitch-600 text-xs">Uključeno</span>
      </div>
    `;
  } else if (state.program === 'olympic') {
    breakdownHTML += `
      <div class="flex justify-between items-center text-sm">
        <span class="text-gray-600">Olimpijske Igre (Premium)</span>
        <span class="font-bold text-amber-600">${formatRSD(PRICES.olympicPackage)}</span>
      </div>
      <div class="flex justify-between items-center text-sm">
        <span class="text-gray-500 text-xs">Animatori + nagrade + poklon</span>
        <span class="font-bold text-pitch-600 text-xs">Uključeno</span>
      </div>
    `;
  } else if (state.program === 'treasure') {
    breakdownHTML += `
      <div class="flex justify-between items-center text-sm">
        <span class="text-gray-600">Potraga za Blagom</span>
        <span class="font-bold text-purple-600 text-xs">Na upit</span>
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

  if (state.foodInterest) {
    breakdownHTML += `
      <div class="flex justify-between items-center text-sm">
        <span class="text-gray-600">Hrana (Pizza Fabrika)</span>
        <span class="font-bold text-red-500 text-xs">Na upit (10% popust)</span>
      </div>
    `;
  }

  if (state.cakeInterest) {
    breakdownHTML += `
      <div class="flex justify-between items-center text-sm">
        <span class="text-gray-600">Torta</span>
        <span class="font-bold text-red-500 text-xs">Na upit</span>
      </div>
    `;
  }

  priceBreakdown.innerHTML = breakdownHTML;

  // Update total
  totalPrice.textContent = formatRSD(total);
  totalEur.classList.add('hidden');
  inquiryNote.classList.toggle('hidden', !hasInquiryItems);
}

// Form submission
bookingForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById('submit-btn');
  const formData = new FormData(bookingForm);
  const parentName = formData.get('parentName');
  const phone = formData.get('phone');
  const email = formData.get('email');
  const date = formData.get('date');
  const message = formData.get('message');

  // Build summary
  const rentalTotal = state.hours * PRICES.rentalPerHour;
  let total = rentalTotal;
  let programText = 'Bez animacije';

  if (state.program === 'sports') {
    const animPrice = state.animator === 'small' ? PRICES.animatorSmall : PRICES.animatorLarge;
    const animLabel = state.animator === 'small' ? '1 animator (<15 dece)' : '2 animatora (15-30 dece)';
    programText = 'Survivor/Fudbal/Košarka - ' + animLabel + ' - ' + formatRSD(animPrice);
    total += animPrice;
  } else if (state.program === 'olympic') {
    programText = 'Olimpijske Igre (Premium) - ' + formatRSD(PRICES.olympicPackage) + ' (animatori + nagrade + poklon uključeni)';
    total += PRICES.olympicPackage;
  } else if (state.program === 'treasure') {
    programText = 'Potraga za Blagom - Cena na upit';
  }

  let addonsText = '';
  if (state.addons.size > 0) {
    const addonsList = [];
    state.addons.forEach(addon => {
      addonsList.push(ADDON_LABELS[addon] + ' (' + formatRSD(PRICES.addons[addon]) + ')');
      total += PRICES.addons[addon];
    });
    addonsText = 'Dodaci: ' + addonsList.join(', ');
  }

  let foodText = '';
  if (state.foodInterest) foodText += 'Zainteresovan za hranu (Pizza Fabrika, 10% popust)\n';
  if (state.cakeInterest) foodText += 'Zainteresovan za tortu (cena na upit)\n';

  // Build email body
  const totalLine = formatRSD(total);

  const emailBody =
    'REZERVACIJA ROĐENDANA - ZLATNA LOPTA\n' +
    '========================================\n\n' +
    'KONTAKT PODACI:\n' +
    'Ime: ' + parentName + '\n' +
    'Telefon: ' + phone + '\n' +
    'Email: ' + email + '\n' +
    'Željeni datum: ' + date + '\n\n' +
    'IZABRANI PAKET:\n' +
    'Iznajmljivanje: ' + state.hours + 'h x 10.000 RSD = ' + formatRSD(rentalTotal) + '\n' +
    'Program: ' + programText + '\n' +
    (addonsText ? addonsText + '\n' : '') +
    (foodText ? '\nHRANA / TORTA:\n' + foodText : '') +
    '\nUKUPNO: ' + totalLine + '\n\n' +
    (message ? 'PORUKA:\n' + message + '\n\n' : '') +
    '----------------------------------------\n' +
    'Poslato sa zlatnalopta.rs';

  // Disable button and show loading
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    Slanje...
  `;

  // Send via EmailJS
  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    subject: 'Rezervacija Rođendana - Zlatna Lopta',
    message: emailBody,
    from_name: parentName,
    from_email: email,
    phone: phone,
    date: date,
  })
  .then(() => {
    successModal.classList.remove('hidden');
    bookingForm.reset();
    state.hours = 2;
    state.program = 'none';
    state.animator = 'small';
    state.addons = new Set();
    state.foodInterest = false;
    state.cakeInterest = false;
    document.querySelector('input[name="program"][value="none"]').checked = true;
    document.querySelector('input[name="animator"][value="small"]').checked = true;
    document.getElementById('food-interest').checked = false;
    document.getElementById('cake-interest').checked = false;
    document.querySelectorAll('.addon-checkbox').forEach(cb => cb.checked = false);
    updateUI();
  })
  .catch((error) => {
    console.error('EmailJS error:', error);
    alert('Došlo je do greške pri slanju. Molimo pokušajte ponovo ili nas pozovite telefonom.');
  })
  .finally(() => {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
      Pošaljite Upit
    `;
  });
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

// Auto-select package from URL params (landing page links)
const urlParams = new URLSearchParams(window.location.search);
const paketParam = urlParams.get('paket');
if (paketParam === 'manja' || paketParam === 'veca') {
  // Select sports program
  const sportsRadio = document.querySelector('input[name="program"][value="sports"]');
  if (sportsRadio) {
    sportsRadio.checked = true;
    state.program = 'sports';
  }
  // Select animator size
  if (paketParam === 'veca') {
    const largeRadio = document.querySelector('input[name="animator"][value="large"]');
    if (largeRadio) {
      largeRadio.checked = true;
      state.animator = 'large';
    }
  } else {
    state.animator = 'small';
  }
}

// Initialize
updateUI();
