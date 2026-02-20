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
    'Željeni datum: ' + date + '\n' +
    (calSelectedSlots.length > 0 ? 'Željeni termini: ' + calSelectedSlots.map(s => String(s.hour).padStart(2, '0') + ':00').join(', ') + ' (' + calSelectedSlots.length + 'h, ' + String(calSelectedSlots[0].hour).padStart(2, '0') + ':00-' + String(calSelectedSlots[calSelectedSlots.length - 1].hour + 1).padStart(2, '0') + ':00)' + '\n' : '') + '\n' +
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
  const timeSlotText = calSelectedSlots.length > 0
    ? String(calSelectedSlots[0].hour).padStart(2, '0') + ':00-' + String(calSelectedSlots[calSelectedSlots.length - 1].hour + 1).padStart(2, '0') + ':00 (' + calSelectedSlots.length + 'h)'
    : '';

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    subject: 'Rezervacija Rođendana - Zlatna Lopta',
    message: emailBody,
    from_name: parentName,
    from_email: email,
    phone: phone,
    date: date,
    time: timeSlotText,
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
    calSelectedSlots = [];
    calSelectedDiv.classList.add('hidden');
    updateUI();
    renderWeeklyCalendar();
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

// ============================================
// Weekly Calendar - Custom Supabase Backend
// ============================================

// *** POPUNITE SA VAŠEG SUPABASE PROJEKTA (Settings > API) ***
const SUPABASE_URL = 'https://gcwghdkauccoysvjbtoi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjd2doZGthdWNjb3lzdmpidG9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NzkwNzEsImV4cCI6MjA4NzE1NTA3MX0.ejulEoU4Xg4J-PLW3Tsp0skv4Mq07abiHBzz7U1KnLE';

const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Kalendar prikazuje sate od 9:00 do 24:00
const CAL_HOUR_START = 9;
const CAL_HOUR_END = 24;

const calWeekly = document.getElementById('cal-weekly');
const calWeekLabel = document.getElementById('cal-week-label');
const calPrev = document.getElementById('cal-prev');
const calNext = document.getElementById('cal-next');
const calLoading = document.getElementById('cal-loading');
const calError = document.getElementById('cal-error');
const calSelectedDiv = document.getElementById('cal-selected');
const calSelectedText = document.getElementById('cal-selected-text');

const DAY_NAMES_SR = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'];
const DAY_NAMES_FULL_SR = ['Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota', 'Nedelja'];
const MONTH_NAMES_SR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun',
  'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec'
];
const MONTH_NAMES_FULL_SR = [
  'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
  'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
];

// Get Monday of the current week
function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

let calWeekStart = getMonday(new Date());
let calBookedSlots = new Set(); // Set of "YYYY-MM-DD-HH" strings
let calSelectedSlots = []; // Array of { date: "YYYY-MM-DD", hour: 14 }

// Fetch booked slots from Supabase for a given week
async function fetchBookedSlots(weekStart) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const dateFrom = formatDateStr(weekStart);
  const dateTo = formatDateStr(weekEnd);

  try {
    calLoading.classList.remove('hidden');
    calError.classList.add('hidden');

    const { data, error } = await _supabase
      .from('booked_slots')
      .select('date, hour')
      .gte('date', dateFrom)
      .lte('date', dateTo);

    if (error) throw error;

    const booked = new Set();
    (data || []).forEach(row => {
      booked.add(`${row.date}-${row.hour}`);
    });
    return booked;
  } catch (err) {
    console.error('Supabase fetch error:', err);
    calError.classList.remove('hidden');
    return new Set();
  } finally {
    calLoading.classList.add('hidden');
  }
}

// Format date as "YYYY-MM-DD"
function formatDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Render the weekly calendar
async function renderWeeklyCalendar() {
  const weekEnd = new Date(calWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  // Week label
  const startLabel = `${calWeekStart.getDate()}. ${MONTH_NAMES_SR[calWeekStart.getMonth()]}`;
  const endLabel = `${weekEnd.getDate()}. ${MONTH_NAMES_SR[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;
  calWeekLabel.textContent = `${startLabel} - ${endLabel}`;

  // Fetch booked slots
  calBookedSlots = await fetchBookedSlots(calWeekStart);

  const now = new Date();
  const todayStr = formatDateStr(now);
  const currentHour = now.getHours();

  // Build table
  // 8 columns: 1 time column + 7 day columns
  let html = '<div class="border border-gray-200 rounded-xl overflow-hidden">';

  // Header row with day names and dates
  html += '<div class="grid grid-cols-8 bg-gray-50 border-b border-gray-200">';
  html += '<div class="p-2 text-center text-xs font-semibold text-gray-400 border-r border-gray-200">Sat</div>';

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(calWeekStart);
    dayDate.setDate(dayDate.getDate() + i);
    const dateStr = formatDateStr(dayDate);
    const isToday = dateStr === todayStr;
    const isWeekend = i >= 5;

    html += `<div class="p-2 text-center ${i < 6 ? 'border-r border-gray-200' : ''} ${isToday ? 'bg-blue-50' : ''}">
      <div class="text-xs font-bold ${isWeekend ? 'text-blue-500' : 'text-gray-700'}">${DAY_NAMES_SR[i]}</div>
      <div class="text-xs ${isToday ? 'text-blue-600 font-bold' : 'text-gray-400'}">${dayDate.getDate()}.${String(dayDate.getMonth() + 1).padStart(2, '0')}</div>
    </div>`;
  }
  html += '</div>';

  // Hour rows
  for (let h = CAL_HOUR_START; h < CAL_HOUR_END; h++) {
    html += '<div class="grid grid-cols-8 border-b border-gray-100 last:border-b-0">';

    // Time label
    html += `<div class="p-1.5 text-center text-xs font-mono font-semibold text-gray-400 border-r border-gray-200 flex items-center justify-center">${String(h).padStart(2, '0')}:00</div>`;

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(calWeekStart);
      dayDate.setDate(dayDate.getDate() + i);
      const dateStr = formatDateStr(dayDate);
      const slotKey = `${dateStr}-${h}`;
      const isBooked = calBookedSlots.has(slotKey);
      const isPast = dateStr < todayStr || (dateStr === todayStr && h <= currentHour);
      const isSelected = calSelectedSlots.some(s => s.date === dateStr && s.hour === h);

      let cellClass = 'p-1 text-center transition-all ';
      if (i < 6) cellClass += 'border-r border-gray-100 ';

      let innerClass = 'rounded-md text-xs font-semibold py-1.5 px-1 ';

      if (isSelected) {
        innerClass += 'bg-gold-400 text-white shadow-sm';
      } else if (isPast) {
        innerClass += 'text-gray-200';
      } else if (isBooked) {
        innerClass += 'bg-red-100 text-red-400 line-through';
      } else {
        innerClass += 'bg-pitch-50 text-pitch-600 hover:bg-pitch-200 cursor-pointer';
      }

      const clickable = !isPast && !isBooked;

      html += `<div class="${cellClass}">
        <button type="button" class="${innerClass} w-full" ${clickable ? `data-date="${dateStr}" data-hour="${h}"` : 'disabled'} ${isBooked ? 'title="Zauzeto"' : ''}>
          ${isPast ? '' : isBooked ? 'X' : isSelected ? h + ':00' : ''}
        </button>
      </div>`;
    }

    html += '</div>';
  }

  html += '</div>';
  calWeekly.innerHTML = html;

  // Click handlers - multi-select hours (same day only)
  calWeekly.querySelectorAll('button[data-date]').forEach(btn => {
    btn.addEventListener('click', () => {
      const date = btn.dataset.date;
      const hour = parseInt(btn.dataset.hour);

      const existingIdx = calSelectedSlots.findIndex(s => s.date === date && s.hour === hour);

      if (existingIdx !== -1) {
        // Deselect this slot
        calSelectedSlots.splice(existingIdx, 1);
      } else {
        // If selecting a different day, clear previous selection
        if (calSelectedSlots.length > 0 && calSelectedSlots[0].date !== date) {
          calSelectedSlots = [];
        }
        calSelectedSlots.push({ date, hour });
        // Sort by hour
        calSelectedSlots.sort((a, b) => a.hour - b.hour);
      }

      // Sync with form date input
      const dateInput = document.getElementById('date');
      if (calSelectedSlots.length > 0) {
        const selDate = calSelectedSlots[0].date;
        if (dateInput) dateInput.value = selDate;

        // Build display text
        const d = new Date(selDate);
        const dayIdx = (d.getDay() + 6) % 7;
        const hours = calSelectedSlots.map(s => String(s.hour).padStart(2, '0') + ':00');
        const firstH = calSelectedSlots[0].hour;
        const lastH = calSelectedSlots[calSelectedSlots.length - 1].hour + 1;
        const rangeText = `${String(firstH).padStart(2, '0')}:00 - ${String(lastH).padStart(2, '0')}:00 (${calSelectedSlots.length}h)`;

        calSelectedText.textContent = `${DAY_NAMES_FULL_SR[dayIdx]}, ${d.getDate()}. ${MONTH_NAMES_FULL_SR[d.getMonth()]} ${d.getFullYear()}. | ${rangeText}`;
        calSelectedDiv.classList.remove('hidden');
      } else {
        if (dateInput) dateInput.value = '';
        calSelectedDiv.classList.add('hidden');
      }

      // Re-render
      renderWeeklyCalendar();
    });
  });
}

// ============================================
// Month "Zoom Out" View
// ============================================

const calViewWeekBtn = document.getElementById('cal-view-week');
const calViewMonthBtn = document.getElementById('cal-view-month');
const calWeekNav = document.getElementById('cal-week-nav');
const calMonthNav = document.getElementById('cal-month-nav');
const calMonthGrid = document.getElementById('cal-month-grid');
const calMonthLabel = document.getElementById('cal-month-label');
const calMonthPrev = document.getElementById('cal-month-prev');
const calMonthNext = document.getElementById('cal-month-next');

let calCurrentView = 'week'; // 'week' or 'month'
let calMonthViewMonth = new Date().getMonth();
let calMonthViewYear = new Date().getFullYear();

function switchView(view) {
  calCurrentView = view;
  const isWeek = view === 'week';

  // Toggle buttons
  calViewWeekBtn.classList.toggle('bg-white', isWeek);
  calViewWeekBtn.classList.toggle('text-gray-900', isWeek);
  calViewWeekBtn.classList.toggle('shadow-sm', isWeek);
  calViewWeekBtn.classList.toggle('text-gray-500', !isWeek);

  calViewMonthBtn.classList.toggle('bg-white', !isWeek);
  calViewMonthBtn.classList.toggle('text-gray-900', !isWeek);
  calViewMonthBtn.classList.toggle('shadow-sm', !isWeek);
  calViewMonthBtn.classList.toggle('text-gray-500', isWeek);

  // Toggle sections
  calWeekNav.classList.toggle('hidden', !isWeek);
  calWeekly.classList.toggle('hidden', !isWeek);
  calMonthNav.classList.toggle('hidden', isWeek);
  calMonthGrid.classList.toggle('hidden', isWeek);

  // Also hide/show the scroll wrapper
  calWeekly.closest('.overflow-x-auto').classList.toggle('hidden', !isWeek);

  if (!isWeek) renderMonthView();
}

function renderMonthView() {
  calMonthLabel.textContent = `${MONTH_NAMES_FULL_SR[calMonthViewMonth]} ${calMonthViewYear}`;

  const firstDay = new Date(calMonthViewYear, calMonthViewMonth, 1);
  const lastDay = new Date(calMonthViewYear, calMonthViewMonth + 1, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  let html = '<div class="grid grid-cols-7 gap-1 mb-2">';
  DAY_NAMES_SR.forEach((name, i) => {
    html += `<div class="text-center text-xs font-semibold ${i >= 5 ? 'text-blue-500' : 'text-gray-400'} py-2">${name}</div>`;
  });
  html += '</div><div class="grid grid-cols-7 gap-1">';

  for (let i = 0; i < startDow; i++) {
    html += '<div></div>';
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dateObj = new Date(calMonthViewYear, calMonthViewMonth, day);
    const dateStr = formatDateStr(dateObj);
    const isPast = dateObj < today;
    const isSelectedWeek = calWeekStart && dateObj >= calWeekStart && dateObj < new Date(calWeekStart.getTime() + 7 * 86400000);

    let classes = 'w-full aspect-square rounded-lg flex items-center justify-center text-sm font-semibold transition-all ';

    if (isPast) {
      classes += 'text-gray-300 cursor-not-allowed';
    } else if (isSelectedWeek) {
      classes += 'bg-blue-100 text-blue-700 ring-2 ring-blue-300 cursor-pointer hover:bg-blue-200';
    } else {
      classes += 'bg-gray-50 text-gray-700 hover:bg-pitch-100 cursor-pointer hover:shadow-sm';
    }

    if (dateStr === formatDateStr(today)) {
      classes += ' ring-2 ring-gold-400';
    }

    html += `<button type="button" class="${classes}" ${!isPast ? `data-week-date="${dateStr}"` : 'disabled'}>${day}</button>`;
  }

  html += '</div>';
  calMonthGrid.innerHTML = html;

  // Click on a day -> jump to that week in week view
  calMonthGrid.querySelectorAll('button[data-week-date]').forEach(btn => {
    btn.addEventListener('click', () => {
      const d = new Date(btn.dataset.weekDate);
      calWeekStart = getMonday(d);
      switchView('week');
      renderWeeklyCalendar();
    });
  });
}

// View toggle buttons
calViewWeekBtn.addEventListener('click', () => switchView('week'));
calViewMonthBtn.addEventListener('click', () => switchView('month'));

// Week navigation
calPrev.addEventListener('click', () => {
  const now = getMonday(new Date());
  if (calWeekStart <= now) return;
  calWeekStart.setDate(calWeekStart.getDate() - 7);
  renderWeeklyCalendar();
});

calNext.addEventListener('click', () => {
  calWeekStart.setDate(calWeekStart.getDate() + 7);
  renderWeeklyCalendar();
});

// Month navigation
calMonthPrev.addEventListener('click', () => {
  const now = new Date();
  if (calMonthViewYear === now.getFullYear() && calMonthViewMonth <= now.getMonth()) return;
  calMonthViewMonth--;
  if (calMonthViewMonth < 0) { calMonthViewMonth = 11; calMonthViewYear--; }
  renderMonthView();
});

calMonthNext.addEventListener('click', () => {
  calMonthViewMonth++;
  if (calMonthViewMonth > 11) { calMonthViewMonth = 0; calMonthViewYear++; }
  renderMonthView();
});

// Initialize calendar
renderWeeklyCalendar();

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
