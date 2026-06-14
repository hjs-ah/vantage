/* ─── Vantage Labs — main.js ─────────────────────────────────────────────── */

/* ── 1. Hero console typewriter ─────────────────────────────────────────── */
const phrases = [
  'built for driven employees',
  'built for people influencers & coaches',
  'built for visionaries'
];
const consoleEl = document.getElementById('consoleText');
let pIdx = 0, cIdx = 0, deleting = false;

function tick() {
  const phrase = phrases[pIdx];
  if (!deleting) {
    cIdx++;
    consoleEl.textContent = phrase.slice(0, cIdx);
    if (cIdx === phrase.length) { deleting = true; setTimeout(tick, 1500); return; }
  } else {
    cIdx--;
    consoleEl.textContent = phrase.slice(0, cIdx);
    if (cIdx === 0) { deleting = false; pIdx = (pIdx + 1) % phrases.length; }
  }
  setTimeout(tick, deleting ? 32 : 52);
}
tick();

/* ── 2. Tab system ───────────────────────────────────────────────────────── */
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
    tabPanels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    document.querySelector(`.tab-panel[data-panel="${target}"]`).classList.add('active');
  });
});

/* ── 3. Case study carousel (slide) ──────────────────────────────────────── */
const track = document.getElementById('carouselTrack');
const slides = track ? track.querySelectorAll('.case-slide') : [];
let slideIdx = 0;

function goToSlide(i) {
  slideIdx = (i + slides.length) % slides.length;
  track.style.transform = `translateX(-${slideIdx * 100}%)`;
}

document.getElementById('prevCase')?.addEventListener('click', () => goToSlide(slideIdx - 1));
document.getElementById('nextCase')?.addEventListener('click', () => goToSlide(slideIdx + 1));

/* Auto-advance every 6 seconds */
let autoSlide = setInterval(() => goToSlide(slideIdx + 1), 6000);
track?.addEventListener('mouseenter', () => clearInterval(autoSlide));
track?.addEventListener('mouseleave', () => { autoSlide = setInterval(() => goToSlide(slideIdx + 1), 6000); });

/* ── 4. FAQ — exclusive open (only one at a time) ────────────────────────── */
/* Native <details name="vl-faq"> handles this in modern browsers.           */
/* The JS below adds the +/× toggle label update for older browsers.         */
document.querySelectorAll('.faq-item').forEach(item => {
  item.addEventListener('toggle', () => {
    const toggle = item.querySelector('.faq-toggle');
    if (!toggle) return;
    toggle.textContent = item.open ? '×' : '+';
  });
});

/* ── 5. Availability badge — driven by admin toggle ─────────────────────── */
const availToggle = document.getElementById('availToggle');
const availDot    = document.getElementById('availDot');
const availText   = document.getElementById('availText');
const adminSub    = document.getElementById('adminSub');

function setAvailability(available) {
  if (available) {
    availDot.classList.remove('off');
    availText.textContent = 'Coaches available today';
    if (adminSub) adminSub.textContent = 'green — clients can quick-book same-day';
  } else {
    availDot.classList.add('off');
    availText.textContent = 'No coaches available today';
    if (adminSub) adminSub.textContent = 'red — same-day booking hidden from clients';
  }
}

availToggle?.addEventListener('change', () => setAvailability(availToggle.checked));
setAvailability(true); // default

/* ── 6. Quick Book card ──────────────────────────────────────────────────── */
const qbOverlay = document.getElementById('qbOverlay');
const qbCard    = document.getElementById('qbCard');
const qbForm    = document.getElementById('qbForm');
const qbConfirm = document.getElementById('qbConfirm');

function openQB() {
  qbOverlay.classList.add('open');
  qbCard.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeQB() {
  qbOverlay.classList.remove('open');
  qbCard.classList.remove('open');
  document.body.style.overflow = '';
}

['qbOpenBtn', 'heroBookBtn', 'ctaBookBtn'].forEach(id => {
  document.getElementById(id)?.addEventListener('click', openQB);
});
document.getElementById('qbClose')?.addEventListener('click', closeQB);
document.getElementById('qbCancel')?.addEventListener('click', closeQB);
qbOverlay?.addEventListener('click', closeQB);

qbForm?.addEventListener('submit', e => {
  e.preventDefault();

  /* ── Wire to HubSpot form embed here when ready ──────────────────────── */
  /* 
     Example HubSpot fetch call:
     const data = Object.fromEntries(new FormData(qbForm));
     fetch('https://api.hsforms.com/submissions/v3/integration/submit/YOUR_PORTAL/YOUR_FORM_GUID', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         fields: [
           { name: 'firstname', value: data.name },
           { name: 'email',     value: data.email },
           { name: 'message',   value: data.track + ' — ' + data.message }
         ]
       })
     });
  */

  qbConfirm.classList.add('show');
  qbForm.reset();
});

/* ── 7. Notion case study integration ───────────────────────────────────── */
/*
  Steps to activate:
  1. Create a Notion database under the Frontend page with properties:
       Name (title), Quote (text), Person (text), Org (text), Initials (text), Published (checkbox)
  2. Create a /api/cases.js serverless function (Vercel) that queries the DB
     via the Notion API and returns JSON. Keep the secret server-side.
  3. Uncomment the block below and replace the fetch URL.

  async function loadCases() {
    try {
      const res = await fetch('/api/cases');
      const cases = await res.json();
      if (!cases.length) return; // fall back to HTML placeholders

      track.innerHTML = cases.map(c => `
        <div class="case-slide">
          <div class="case-avatar">${c.initials}</div>
          <p class="case-quote">"${c.quote}"</p>
          <p class="case-meta">${c.person} — <span class="org">${c.org}</span></p>
        </div>
      `).join('');
    } catch (err) {
      console.warn('Notion case fetch failed — using placeholders', err);
    }
  }
  loadCases();
*/

/* ── 8. Client login placeholder ─────────────────────────────────────────── */
document.getElementById('clientLoginBtn')?.addEventListener('click', () => {
  /* Replace with redirect to /login or auth provider when ready */
  alert('Client portal coming soon.');
});
