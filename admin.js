// ============================================================
// Zlatna Lopta - Admin Panel
// ============================================================

// *** POPUNITE OVE VREDNOSTI SA VAŠEG SUPABASE PROJEKTA ***
// Settings > API > Project URL i anon public key
const SUPABASE_URL = 'https://gcwghdkauccoysvjbtoi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjd2doZGthdWNjb3lzdmpidG9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NzkwNzEsImV4cCI6MjA4NzE1NTA3MX0.ejulEoU4Xg4J-PLW3Tsp0skv4Mq07abiHBzz7U1KnLE';

// ============================================================

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CAL_HOUR_START = 9;
const CAL_HOUR_END = 24;

const DAY_NAMES_SR = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'];
const DAY_NAMES_FULL_SR = ['Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota', 'Nedelja'];
const MONTH_NAMES_SR = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec'];
const MONTH_NAMES_FULL_SR = [
  'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
  'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
];

// State
let adminWeekStart = getMonday(new Date());
let adminBookedSlots = new Set(); // Set of "YYYY-MM-DD-H"

// DOM
const loginSection = document.getElementById('login-section');
const adminSection = document.getElementById('admin-section');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginError = document.getElementById('login-error');
const loginErrorText = document.getElementById('login-error-text');
const adminCalLoading = document.getElementById('admin-cal-loading');
const adminCalGrid = document.getElementById('admin-cal-grid');
const adminWeekLabel = document.getElementById('admin-cal-week-label');
const adminStatus = document.getElementById('admin-status');
const adminBookedList = document.getElementById('admin-booked-list');

// ============================================================
// Auth
// ============================================================

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function showStatus(msg, type = 'success') {
  adminStatus.textContent = msg;
  adminStatus.className = `mb-4 px-4 py-3 rounded-xl text-sm font-semibold text-center ${
    type === 'success'
      ? 'bg-pitch-50 border border-pitch-200 text-pitch-800'
      : 'bg-red-50 border border-red-200 text-red-700'
  }`;
  adminStatus.classList.remove('hidden');
  setTimeout(() => adminStatus.classList.add('hidden'), 3000);
}

// Login
loginBtn.addEventListener('click', async () => {
  const email = document.getElementById('admin-email').value.trim();
  const password = document.getElementById('admin-password').value;

  if (!email || !password) {
    loginErrorText.textContent = 'Unesite email i lozinku.';
    loginError.classList.remove('hidden');
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = 'Prijavljivanje...';

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    loginErrorText.textContent = 'Pogrešan email ili lozinka.';
    loginError.classList.remove('hidden');
    loginBtn.disabled = false;
    loginBtn.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
      </svg>
      Prijavite se`;
  }
  // onAuthStateChange će prikazati admin panel ako uspe
});

// Enter za login
document.getElementById('admin-password').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') loginBtn.click();
});

// Logout
logoutBtn.addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
});

// Auth state listener
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (session) {
    loginSection.classList.add('hidden');
    adminSection.classList.remove('hidden');
    renderAdminCalendar();
  } else {
    loginSection.classList.remove('hidden');
    adminSection.classList.add('hidden');
  }
});

// ============================================================
// Fetch zauzeti termini iz Supabase
// ============================================================

async function fetchAdminBookedSlots(weekStart) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const dateFrom = formatDateStr(weekStart);
  const dateTo = formatDateStr(weekEnd);

  const { data, error } = await supabaseClient
    .from('booked_slots')
    .select('date, hour')
    .gte('date', dateFrom)
    .lte('date', dateTo);

  if (error) {
    console.error('Supabase fetch error:', error);
    showStatus('Greška pri učitavanju termina.', 'error');
    return new Set();
  }

  const booked = new Set();
  (data || []).forEach(row => {
    booked.add(`${row.date}-${row.hour}`);
  });
  return booked;
}

// ============================================================
// Toggle termin (zauzet ↔ slobodan)
// ============================================================

async function toggleSlot(dateStr, hour) {
  const key = `${dateStr}-${hour}`;
  const isBooked = adminBookedSlots.has(key);

  if (isBooked) {
    // Brisi iz baze
    const { error } = await supabaseClient
      .from('booked_slots')
      .delete()
      .eq('date', dateStr)
      .eq('hour', hour);

    if (error) {
      showStatus('Greška pri oslobađanju termina.', 'error');
      return;
    }
    adminBookedSlots.delete(key);
    showStatus(`${String(hour).padStart(2, '0')}:00 — termin oslobođen`);
  } else {
    // Dodaj u bazu
    const { error } = await supabaseClient
      .from('booked_slots')
      .insert({ date: dateStr, hour, label: 'Zauzeto' });

    if (error) {
      showStatus('Greška pri čuvanju termina.', 'error');
      return;
    }
    adminBookedSlots.add(key);
    showStatus(`${String(hour).padStart(2, '0')}:00 — označeno kao zauzeto`);
  }

  renderGrid();
  renderBookedList();
}

// ============================================================
// Render kalendar grid
// ============================================================

function renderGrid() {
  const now = new Date();
  const todayStr = formatDateStr(now);

  let html = '<div class="border-b border-gray-100">';

  // Header
  html += '<div class="grid border-b border-gray-200" style="grid-template-columns: 56px repeat(7, 1fr)">';
  html += '<div class="p-2 text-center text-xs font-semibold text-gray-400 border-r border-gray-200 bg-gray-50">Sat</div>';

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(adminWeekStart);
    dayDate.setDate(dayDate.getDate() + i);
    const dateStr = formatDateStr(dayDate);
    const isToday = dateStr === todayStr;
    const isWeekend = i >= 5;

    html += `<div class="p-2 text-center bg-gray-50 ${i < 6 ? 'border-r border-gray-200' : ''} ${isToday ? '!bg-blue-50' : ''}">
      <div class="text-xs font-bold ${isWeekend ? 'text-blue-500' : 'text-gray-700'}">${DAY_NAMES_SR[i]}</div>
      <div class="text-xs ${isToday ? 'text-blue-600 font-bold' : 'text-gray-400'}">${dayDate.getDate()}.${String(dayDate.getMonth() + 1).padStart(2, '0')}</div>
    </div>`;
  }
  html += '</div>';

  // Hour rows
  for (let h = CAL_HOUR_START; h < CAL_HOUR_END; h++) {
    html += '<div class="grid border-b border-gray-100 last:border-b-0" style="grid-template-columns: 56px repeat(7, 1fr)">';

    html += `<div class="p-1.5 text-center text-xs font-mono font-semibold text-gray-400 border-r border-gray-200 flex items-center justify-center bg-gray-50">${String(h).padStart(2, '0')}:00</div>`;

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(adminWeekStart);
      dayDate.setDate(dayDate.getDate() + i);
      const dateStr = formatDateStr(dayDate);
      const key = `${dateStr}-${h}`;
      const isBooked = adminBookedSlots.has(key);
      const isPast = dateStr < todayStr || (dateStr === todayStr && h <= now.getHours());

      let cellBg = '';
      let label = '';
      let cursor = '';
      let title = '';

      if (isPast) {
        cellBg = 'bg-gray-50';
        label = '';
        cursor = 'cursor-not-allowed';
      } else if (isBooked) {
        cellBg = 'bg-red-500 hover:bg-red-600';
        label = '<span class="text-white text-xs font-bold">X</span>';
        cursor = 'cursor-pointer';
        title = 'Kliknite da oslobodite termin';
      } else {
        cellBg = 'bg-pitch-50 hover:bg-pitch-100 border border-pitch-200';
        label = '';
        cursor = 'cursor-pointer';
        title = 'Kliknite da markirate kao zauzeto';
      }

      const clickAttr = (!isPast) ? `data-date="${dateStr}" data-hour="${h}" title="${title}"` : '';

      html += `<div class="p-1 ${i < 6 ? 'border-r border-gray-100' : ''}">
        <button type="button" class="w-full rounded-md py-2 transition-all ${cellBg} ${cursor} flex items-center justify-center" ${clickAttr} ${isPast ? 'disabled' : ''}>
          ${label}
        </button>
      </div>`;
    }

    html += '</div>';
  }

  html += '</div>';
  adminCalGrid.innerHTML = html;

  // Dodaj click handlere
  adminCalGrid.querySelectorAll('button[data-date]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dateStr = btn.dataset.date;
      const hour = parseInt(btn.dataset.hour);
      toggleSlot(dateStr, hour);
    });
  });
}

// ============================================================
// Render lista zauzetih termina (sidebar)
// ============================================================

function renderBookedList() {
  const weekEnd = new Date(adminWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  // Grupiši po danima
  const byDay = {};
  adminBookedSlots.forEach(key => {
    const [year, month, day, hour] = key.split('-');
    const dateStr = `${year}-${month}-${day}`;
    if (!byDay[dateStr]) byDay[dateStr] = [];
    byDay[dateStr].push(parseInt(hour));
  });

  const dates = Object.keys(byDay).sort();
  if (dates.length === 0) {
    adminBookedList.innerHTML = '<p class="text-gray-400 text-sm italic">Nema zauzetih termina ove nedelje.</p>';
    return;
  }

  let html = '<div class="space-y-2">';
  dates.forEach(dateStr => {
    const d = new Date(dateStr);
    const dayIdx = (d.getDay() + 6) % 7;
    const hours = byDay[dateStr].sort((a, b) => a - b);
    const hoursText = hours.map(h => `${String(h).padStart(2, '0')}:00`).join(', ');
    html += `<div class="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-4 py-2">
      <div>
        <span class="font-semibold text-gray-900 text-sm">${DAY_NAMES_FULL_SR[dayIdx]}, ${d.getDate()}. ${MONTH_NAMES_FULL_SR[d.getMonth()]}</span>
        <p class="text-red-600 text-xs font-mono mt-0.5">${hoursText}</p>
      </div>
      <span class="text-red-500 font-bold text-sm">${hours.length}h</span>
    </div>`;
  });
  html += '</div>';
  adminBookedList.innerHTML = html;
}

// ============================================================
// Render ceo kalendar (fetch + grid)
// ============================================================

async function renderAdminCalendar() {
  const weekEnd = new Date(adminWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const startLabel = `${adminWeekStart.getDate()}. ${MONTH_NAMES_SR[adminWeekStart.getMonth()]}`;
  const endLabel = `${weekEnd.getDate()}. ${MONTH_NAMES_SR[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;
  adminWeekLabel.textContent = `${startLabel} — ${endLabel}`;

  adminCalLoading.classList.remove('hidden');
  adminCalGrid.innerHTML = '';

  adminBookedSlots = await fetchAdminBookedSlots(adminWeekStart);

  adminCalLoading.classList.add('hidden');
  renderGrid();
  renderBookedList();
}

// ============================================================
// Navigacija nedeljama
// ============================================================

document.getElementById('admin-cal-prev').addEventListener('click', () => {
  const prevWeek = new Date(adminWeekStart);
  prevWeek.setDate(prevWeek.getDate() - 7);
  // Dozvoliti i prošle nedelje (admin treba da vidi istoriju)
  adminWeekStart = prevWeek;
  renderAdminCalendar();
});

document.getElementById('admin-cal-next').addEventListener('click', () => {
  adminWeekStart.setDate(adminWeekStart.getDate() + 7);
  renderAdminCalendar();
});

// ============================================================
// Init — proveri da li je već ulogovan
// ============================================================

(async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    loginSection.classList.add('hidden');
    adminSection.classList.remove('hidden');
    renderAdminCalendar();
  }
})();
