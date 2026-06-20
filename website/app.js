/* ============================================================
   Do Young — marketing site behaviour
   theme · phone mockup · PWA install · platform tabs ·
   interactive demo · scroll reveal
   ============================================================ */

/* Point CTAs at the deployed app. Update once it's live on Vercel,
   e.g. 'https://do-young.vercel.app/shelf'. */
const APP_URL = '/shelf';

const $ = (sel) => document.querySelector(sel);

/* ---- App-link CTAs ---- */
['openAppBtn', 'footerOpen'].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.setAttribute('href', APP_URL);
});

/* ---- Year ---- */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ============================================================
   Theme toggle — shares the `dy:theme` key with the app
   ============================================================ */
const themeToggle = document.getElementById('themeToggle');
themeToggle?.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('dy:theme', next); } catch (e) {}
});

/* ============================================================
   Phone mockup — fill the mini shelf with themed gradient covers
   ============================================================ */
const COVER_GRADIENTS = [
  ['#1a1a3e', '#2d2d6b'], ['#3e1a2a', '#6b2d4a'], ['#1a3e2a', '#2d6b48'],
  ['#3e2a1a', '#6b482d'], ['#2a1a3e', '#482d6b'], ['#1a3e3e', '#2d6b6b'],
  ['#3e1a1a', '#6b2d2d'], ['#2a2a1a', '#55552d'], ['#1a2a3e', '#2d486b'],
];
const RATINGS = ['9.1', '8.4', '7.8', '9.6', '8.0', '7.2', '8.8', '9.3', '6.9'];
const psGrid = document.getElementById('psGrid');
if (psGrid) {
  COVER_GRADIENTS.forEach((g, i) => {
    const cover = document.createElement('div');
    cover.className = 'ps-cover';
    cover.style.background = `linear-gradient(135deg, ${g[0]}, ${g[1]})`;
    cover.innerHTML = `<span class="rate">★ ${RATINGS[i]}</span>`;
    psGrid.appendChild(cover);
  });
}

/* ============================================================
   Platform detection
   ============================================================ */
const ua = navigator.userAgent || '';
const isIOS = /iphone|ipad|ipod/i.test(ua) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isAndroid = /android/i.test(ua);
const isStandalone =
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

/* default the install tab to the visitor's platform (Android otherwise) */
function activateTab(name) {
  document.querySelectorAll('.tab').forEach((t) =>
    t.classList.toggle('active', t.dataset.tab === name));
  document.querySelectorAll('.tab-panel').forEach((p) =>
    p.classList.toggle('active', p.dataset.panel === name));
}
document.querySelectorAll('.tab').forEach((tab) =>
  tab.addEventListener('click', () => activateTab(tab.dataset.tab)));
activateTab(isIOS ? 'ios' : 'android');

/* ============================================================
   PWA install — beforeinstallprompt (Chrome / Edge / Android)
   ============================================================ */
const installBtn = document.getElementById('installBtn');
const installNote = document.getElementById('installNote');
let deferredPrompt = null;

if (isStandalone) {
  if (installNote) {
    installNote.textContent = '✓ Already installed — you’re running Do Young as an app.';
    installNote.classList.add('ok');
  }
} else if (isIOS) {
  if (installNote) installNote.textContent = 'On iPhone & iPad, follow the Safari steps on the right to add it to your home screen.';
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBtn) installBtn.hidden = false;
  if (installNote) installNote.textContent = 'Your browser can install Do Young — tap “Install now”.';
});

installBtn?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.hidden = true;
  if (installNote) {
    installNote.textContent = outcome === 'accepted'
      ? '✓ Installing… check your home screen.'
      : 'No problem — you can install any time from the browser menu.';
    if (outcome === 'accepted') installNote.classList.add('ok');
  }
});

window.addEventListener('appinstalled', () => {
  if (installBtn) installBtn.hidden = true;
  if (installNote) {
    installNote.textContent = '✓ Installed! Find Do Young on your home screen.';
    installNote.classList.add('ok');
  }
});

/* ============================================================
   Interactive demo — click-through walkthrough of the app
   ============================================================ */
const DEMO = [
  {
    tab: null,
    title: 'Search & add anything',
    desc: 'Tap the gold + and search IMDb. Pick a movie, series or anime — the poster, title and year fill in for you.',
  },
  {
    tab: null,
    title: 'Rate it 1 to 10',
    desc: 'Give it a score, set when you watched it and on what platform. Add notes too — it all saves to your shelf.',
  },
  {
    tab: 'shelf',
    title: 'Your watched shelf',
    desc: 'Every title lands here in one grid. Search, filter by type or year, and sort by rating, date or A–Z.',
  },
  {
    tab: 'stats',
    title: 'Watch your stats grow',
    desc: 'Milestones, streaks, a 90-day heatmap and your average rating — your viewing habit, brought to life.',
  },
  {
    tab: null,
    title: 'Unlock collectible badges',
    desc: 'Complete franchise sagas and hit milestones to earn badges across four rarities. Flex your favourite next to your name.',
  },
];
const DEMO_MAX = DEMO.length;

const demoRoot = document.querySelector('.demo');
if (demoRoot) {
  const screens = Array.from(demoRoot.querySelectorAll('.screen'));
  const navDots = Array.from(demoRoot.querySelectorAll('.d-nav .ndot'));
  const numEl = document.getElementById('demoNum');
  const dotsEl = document.getElementById('demoDots');
  const titleEl = document.getElementById('demoTitle');
  const descEl = document.getElementById('demoDesc');
  const backBtn = document.getElementById('demoBack');
  const nextBtn = document.getElementById('demoNext');
  const ctaBtn = document.getElementById('demoCta');

  /* progress dots */
  DEMO.forEach(() => dotsEl.appendChild(document.createElement('span')));
  const dots = Array.from(dotsEl.children);

  /* phone shelf grid (screen 3) — first cover is the freshly-added one */
  const shelfGrid = document.getElementById('dShelfGrid');
  if (shelfGrid) {
    const covers = [
      ['#3e2a1a', '#6b482d', '9.0'], // the new Dune: Part Two
      ['#1a1a3e', '#2d2d6b', '8.4'], ['#3e1a2a', '#6b2d4a', '7.8'],
      ['#1a3e2a', '#2d6b48', '9.6'], ['#2a1a3e', '#482d6b', '8.0'],
      ['#1a3e3e', '#2d6b6b', '7.2'], ['#3e1a1a', '#6b2d2d', '8.8'],
      ['#2a2a1a', '#55552d', '9.3'], ['#1a2a3e', '#2d486b', '6.9'],
    ];
    covers.forEach((c, i) => {
      const cover = document.createElement('div');
      cover.className = 'ps-cover' + (i === 0 ? ' new' : '');
      cover.style.background = `linear-gradient(135deg, ${c[0]}, ${c[1]})`;
      cover.innerHTML = `<span class="rate">★ ${c[2]}</span>`;
      shelfGrid.appendChild(cover);
    });
  }

  /* rating squares (screen 2) — square 9 is the hotspot */
  const ratingEl = document.getElementById('dRating');
  if (ratingEl) {
    for (let n = 1; n <= 10; n++) {
      const sq = document.createElement('button');
      sq.type = 'button';
      sq.className = 'd-sq' + (n === 9 ? ' hotspot' : '');
      sq.dataset.val = String(n);
      sq.textContent = String(n);
      if (n === 9) {
        sq.setAttribute('data-advance', '');
        sq.innerHTML = '9<span class="pulse"></span>';
      }
      ratingEl.appendChild(sq);
    }
    // tapping any square fills 1..n; the 9 also advances (handled below)
    ratingEl.addEventListener('click', (e) => {
      const sq = e.target.closest('.d-sq');
      if (!sq) return;
      const val = +sq.dataset.val;
      Array.from(ratingEl.children).forEach((c, i) => c.classList.toggle('fill', i < val));
    });
  }

  /* faux heatmap (screen 4) */
  const heatEl = document.getElementById('dHeat');
  if (heatEl) {
    for (let i = 0; i < 60; i++) {
      const cell = document.createElement('span');
      const r = Math.random();
      cell.className = 'cell' + (r > 0.82 ? ' l3' : r > 0.6 ? ' l2' : r > 0.35 ? ' l1' : '');
      heatEl.appendChild(cell);
    }
  }

  const prefersReducedDemo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let demoStep = 1;

  function renderDemo() {
    const data = DEMO[demoStep - 1];
    screens.forEach((s) => s.classList.toggle('active', +s.dataset.screen === demoStep));

    // when re-entering the rating screen, reset the fill so the demo replays
    if (ratingEl) {
      const filled = demoStep >= 2;
      Array.from(ratingEl.children).forEach((c, i) => c.classList.toggle('fill', filled && i < 9));
    }

    navDots.forEach((d) => d.classList.toggle('on', d.dataset.tab === data.tab));
    numEl.textContent = String(demoStep);
    titleEl.textContent = data.title;
    descEl.textContent = data.desc;
    dots.forEach((d, i) => {
      d.classList.toggle('on', i < demoStep);
      d.classList.toggle('cur', i === demoStep - 1);
    });
    backBtn.disabled = demoStep === 1;
    nextBtn.firstChild.textContent = demoStep === DEMO_MAX ? 'Start over ' : 'Next ';
    ctaBtn.hidden = demoStep !== DEMO_MAX;
  }

  function goTo(step) {
    demoStep = step < 1 ? 1 : step > DEMO_MAX ? 1 : step; // Next past the end loops back
    renderDemo();
  }
  const next = () => goTo(demoStep + 1);
  const prev = () => goTo(demoStep - 1);

  nextBtn.addEventListener('click', next);
  backBtn.addEventListener('click', prev);

  // in-screen hotspots advance the walkthrough (a brief beat for tap feedback)
  demoRoot.addEventListener('click', (e) => {
    if (!e.target.closest('[data-advance]')) return;
    setTimeout(next, prefersReducedDemo ? 0 : 280);
  });

  // arrow keys when the demo is on screen
  let demoInView = false;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((ents) => {
      demoInView = ents[0].isIntersecting;
    }, { threshold: 0.4 }).observe(demoRoot);
  }
  document.addEventListener('keydown', (e) => {
    if (!demoInView) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  });

  renderDemo();
}

/* "Try the interactive demo" hero button → scroll to the demo */
document.getElementById('tourBtn')?.addEventListener('click', () => {
  document.getElementById('tour')?.scrollIntoView({ behavior: 'smooth' });
});

/* ============================================================
   Scroll reveal
   ============================================================ */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealEls = document.querySelectorAll('.reveal');

if (prefersReduced || !('IntersectionObserver' in window)) {
  revealEls.forEach((el) => el.classList.add('in'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach((el) => io.observe(el));
}
