const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $$ = (sel) => document.querySelectorAll(sel);

// ---------- Stagger delays ----------
const stagger = (sel, step, base = 0) =>
  $$(sel).forEach((el, i) => el.style.setProperty('--d', `${(base + i * step).toFixed(2)}s`));

stagger('.stat', 0.1);
stagger('.about-photo .mi', 0.06, 0.4);
stagger('.about-text .folder-list li', 0.1, 0.3);
stagger('.about-text .chip', 0.05, 0.5);
stagger('.folder', 0.12, 0.35);
stagger('.sticker', 0.15, 0.8);
stagger('.win', 0.12);
stagger('.toc-item', 0.12);
stagger('.together .bk', 0.12, 0.15);
$$('.dock .app').forEach((el, i) => el.style.setProperty('--i', i));

// hero letters: index, offset from centre, alternating up/down
const chars = $$('.big-word .ch');
const mid = (chars.length - 1) / 2;
chars.forEach((el, i) => {
  el.style.setProperty('--i', i);
  el.style.setProperty('--o', i - mid);
  el.style.setProperty('--alt', i % 2 ? 1 : -1);
});

// contact extras fade up one after another
['.c-note', '.seg', '.c-line', '.toc .center'].forEach((sel, i) => {
  const el = document.querySelector(sel);
  if (el) { el.classList.add('reveal'); el.style.setProperty('--d', `${0.1 + i * 0.08}s`); }
});

// ---------- Scroll reveal ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
$$('.reveal, .io').forEach((el) => io.observe(el));

// ---------- Count-up stats ----------
const runCount = (el) => {
  const to = +el.dataset.to;
  const dur = 1200;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = String(Math.round(to * eased)).padStart(2, '0');
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const cio = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); }
  });
}, { threshold: 0.5 });
$$('.count').forEach((c) => cio.observe(c));

// ---------- Scroll-linked motion ----------
const bar = document.querySelector('.scroll-progress');
const hero = document.querySelector('.desktop');
const speedEls = [...$$('[data-speed]')];
const slideEls = [...$$('[data-slide]')];
let ticking = false;

const update = () => {
  ticking = false;
  const y = scrollY;
  const vh = innerHeight;
  const max = document.documentElement.scrollHeight - vh;
  bar.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
  if (reduceMotion) return;

  // hero progress 0 → 1
  const hp = Math.min(Math.max(y / (hero.offsetHeight * 0.9), 0), 1);
  hero.style.setProperty('--hp', hp.toFixed(4));

  // vertical parallax (measured on parent so our own translate doesn't feed back)
  speedEls.forEach((el) => {
    const r = el.parentElement.getBoundingClientRect();
    if (r.bottom < -200 || r.top > vh + 200) return;
    const d = r.top + r.height / 2 - vh / 2;
    el.style.translate = `0 ${(-d * el.dataset.speed).toFixed(1)}px`;
  });

  // big headings drift sideways while passing through the viewport
  const amp = 160 * Math.min(1, innerWidth / 1000);
  slideEls.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.bottom < -100 || r.top > vh + 100) return;
    const d = (r.top + r.height / 2 - vh / 2) / vh;
    el.style.transform = `translateX(${(d * el.dataset.slide * amp).toFixed(1)}px)`;
  });
};

addEventListener('scroll', () => {
  if (!ticking) { ticking = true; requestAnimationFrame(update); }
}, { passive: true });
addEventListener('resize', update);
update();
