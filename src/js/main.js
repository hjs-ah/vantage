/* ─── Vantage Delta — main.js ─────────────────────────────────────────────── */

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

/* ── 5. Availability badge + hero images — fetches from /api/availability ── */
const availDot  = document.getElementById('availDot');
const availText = document.getElementById('availText');

async function loadAvailability() {
  try {
    console.log('[VD] Fetching /api/availability...');
    const res  = await fetch('/api/availability');
    const data = await res.json();
    console.log('[VD] Availability response:', JSON.stringify(data));
    setAvailability(data.available, data.hours);
    applyHeroImages(data);
  } catch (err) {
    console.warn('[VD] /api/availability failed, using fallback:', err);
    const saved      = localStorage.getItem('vd_available');
    const savedHours = localStorage.getItem('vd_hours');
    setAvailability(saved !== '0', parseInt(savedHours) || 24);
  }
}

function setAvailability(available, hours = 24) {
  if (available) {
    availDot.classList.remove('off');
    availText.innerHTML = `Coaching available within <strong>${hours}</strong> hours`;
  } else {
    availDot.classList.add('off');
    availText.textContent = 'No coaching available right now';
  }
}

function applyHeroImages(data) {
  const { heroFgImage1, heroFgImage2, heroFgImage3,
          heroBgImage, heroFadeSecs,
          heroBubble1, heroBubble2, heroBubble3 } = data;

  console.log('[VD] applyHeroImages', { heroFgImage1, heroFgImage2, heroFgImage3, heroBgImage, heroFadeSecs });

  // Background tile
  const bgLayer = document.getElementById('heroBgLayer');
  if (heroBgImage && bgLayer) {
    bgLayer.style.backgroundImage = `url('${heroBgImage}')`;
  }

  // Set bubble text — bubbles are always in the DOM, shown/hidden by class
  const bubbleData = [
    { id: 'heroBubble1', text: heroBubble1 },
    { id: 'heroBubble2', text: heroBubble2 },
    { id: 'heroBubble3', text: heroBubble3 },
  ];
  bubbleData.forEach(b => {
    const el = document.getElementById(b.id);
    if (!el) return;
    if (b.text) {
      el.textContent = b.text;
      el.classList.add('has-text');
    } else {
      el.classList.remove('has-text');
    }
  });

  // Build slots — only those with image URLs
  const slots = [
    { slideId: 'heroSlide1', imgId: 'heroImg1', bubbleId: 'heroBubble1', url: heroFgImage1 },
    { slideId: 'heroSlide2', imgId: 'heroImg2', bubbleId: 'heroBubble2', url: heroFgImage2 },
    { slideId: 'heroSlide3', imgId: 'heroImg3', bubbleId: 'heroBubble3', url: heroFgImage3 },
  ].filter(s => s.url);

  if (!slots.length) { console.log('[VD] No foreground images provided'); return; }

  const secs = Math.max(1, heroFadeSecs || 4);
  let current = 0;
  let loadedCount = 0;

  slots.forEach((slot, i) => {
    const img = document.getElementById(slot.imgId);
    if (!img) return;
    img.onload  = () => { loadedCount++; console.log(`[VD] Image ${i+1} loaded`); if (loadedCount === 1) startRotation(); };
    img.onerror = () => console.error(`[VD] Image ${i+1} failed:`, slot.url);
    img.src = slot.url;
  });

  function showSlot(idx) {
    const slide  = document.getElementById(slots[idx].slideId);
    const bubble = document.getElementById(slots[idx].bubbleId);
    slide?.classList.add('visible');
    // Bubble fades in slightly after the image (staggered for effect)
    if (bubble?.classList.contains('has-text')) {
      setTimeout(() => bubble.classList.add('visible'), 300);
    }
  }

  function hideSlot(idx) {
    const slide  = document.getElementById(slots[idx].slideId);
    const bubble = document.getElementById(slots[idx].bubbleId);
    slide?.classList.remove('visible');
    bubble?.classList.remove('visible');
  }

  function startRotation() {
    showSlot(0);
    if (slots.length === 1) return;

    setInterval(() => {
      const prev = current;
      current    = (current + 1) % slots.length;
      hideSlot(prev);
      showSlot(current);
    }, secs * 1000);
  }
}

loadAvailability();

/* ── 6. Quick Book card ──────────────────────────────────────────────────── */
const qbOverlay = document.getElementById('qbOverlay');
const qbCard    = document.getElementById('qbCard');

function openQB() {
  qbOverlay.classList.add('open');
  qbCard.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Initialize HubSpot form on first open
  if (typeof initHubSpotForm === 'function') initHubSpotForm();
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

/* ── Privacy modal ───────────────────────────────────────────────────────── */
const privacyOverlay = document.getElementById('privacyOverlay');
const privacyModal   = document.getElementById('privacyModal');

function openPrivacy() {
  privacyOverlay.classList.add('open');
  privacyModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closePrivacy() {
  privacyOverlay.classList.remove('open');
  privacyModal.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('privacyBtn')?.addEventListener('click', openPrivacy);
document.getElementById('privacyClose')?.addEventListener('click', closePrivacy);
privacyOverlay?.addEventListener('click', closePrivacy);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePrivacy(); });
