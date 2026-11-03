/* ==========================================================================
   Parthasarathi Financial Services — site scripts
   ========================================================================== */

const WA_NUMBER = '917609952853';

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initFundHouses();
  initNav();
  initCalculator();
  initCompare();
  initWaiting();
  initLearn();
  initGlossary();
  initQuiz();
  initBookingForm();
  initReveal();
  initCounters();
  initScrollUi();
  initSpotlight();
  initTilt();
  document.getElementById('year').textContent = new Date().getFullYear();
});

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Helpers ---------- */
const $ = (id) => document.getElementById(id);

function inr(num) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(num));
}

// Short form for big numbers: ₹25.2 L, ₹1.4 Cr
function inrShort(num) {
  if (num >= 1e7) return '₹' + (num / 1e7).toFixed(2).replace(/\.?0+$/, '') + ' Cr';
  if (num >= 1e5) return '₹' + (num / 1e5).toFixed(1).replace(/\.0$/, '') + ' L';
  return inr(num);
}

// Future value of a monthly SIP paid at the start of each month
function sipFV(monthly, annualRate, years) {
  const r = annualRate / 12 / 100;
  const n = years * 12;
  if (r === 0) return monthly * n;
  return monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
}

function waLink(text) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

/* ---------- Loading screen ---------- */
// Shown for at least the ring animation (~0.9s), at most 2.5s, then fades out
function initPreloader() {
  const root = document.documentElement;
  if (!root.classList.contains('preload')) return;
  const start = performance.now();
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    setTimeout(() => root.classList.add('loaded'), Math.max(0, 900 - (performance.now() - start)));
    try { sessionStorage.setItem('psfs-seen', '1'); } catch (e) {}
  };
  if (document.readyState === 'complete') finish();
  else window.addEventListener('load', finish);
  setTimeout(finish, 2500);
}

/* ---------- Fund house marquee ---------- */
// The marquee scrolls by -50%, so each row needs one hidden copy of its tiles
function initFundHouses() {
  document.querySelectorAll('.amc-track').forEach(track => {
    [...track.children].forEach(li => {
      const copy = li.cloneNode(true);
      copy.classList.add('clone');
      copy.setAttribute('aria-hidden', 'true');
      track.appendChild(copy);
    });
  });
}

/* ---------- Navigation ---------- */
function initNav() {
  const nav = $('nav');
  const menuBtn = $('menu-btn');
  const menu = $('mobile-menu');

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const setMenu = (open) => {
    menu.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.innerHTML = open ? '<i class="bi bi-x-lg"></i>' : '<i class="bi bi-list"></i>';
  };
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // Highlight the current section in the desktop nav
  const links = [...document.querySelectorAll('.nav-links a')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => observer.observe(s));
  observer.observe($('top')); // clears the highlight when back at the hero
}

/* ---------- Calculator ---------- */
const CALC_MODES = {
  sip:        { label: 'Monthly SIP amount',            min: 500,    max: 100000,   step: 500,    value: 10000 },
  lumpsum:    { label: 'One-time investment',           min: 5000,   max: 2000000,  step: 5000,   value: 100000 },
  goal:       { label: 'Goal amount you need',          min: 100000, max: 50000000, step: 100000, value: 5000000 },
  retirement: { label: 'Current monthly expenses',      min: 10000,  max: 500000,   step: 5000,   value: 40000 },
  education:  { label: "Today's cost of the course",    min: 200000, max: 10000000, step: 100000, value: 1500000 }
};
let calcMode = 'sip';

function initCalculator() {
  document.querySelectorAll('.calc-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.calc-tab').forEach(t => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', String(t === tab));
      });
      calcMode = tab.dataset.calc;
      const cfg = CALC_MODES[calcMode];
      const amount = $('calc-amount');
      $('label-amount').textContent = cfg.label;
      amount.min = cfg.min; amount.max = cfg.max; amount.step = cfg.step; amount.value = cfg.value;
      if (calcMode === 'retirement' || calcMode === 'education') $('calc-years').value = Math.max($('calc-years').value, 10);
      calculate();
    });
  });

  ['calc-amount', 'calc-rate', 'calc-years', 'calc-stepup'].forEach(id => $(id).addEventListener('input', calculate));
  $('calc-inflation').addEventListener('change', calculate);
  calculate();
}

function paintRange(input) {
  const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
  input.style.setProperty('--fill', pct + '%');
}

function calculate() {
  const amount = +$('calc-amount').value;
  const rate = +$('calc-rate').value;
  const years = +$('calc-years').value;
  const stepUp = +$('calc-stepup').value;
  const inflationOn = $('calc-inflation').checked;

  ['calc-amount', 'calc-rate', 'calc-years', 'calc-stepup'].forEach(id => paintRange($(id)));
  $('badge-amount').textContent = inr(amount);
  $('badge-rate').textContent = rate + '%';
  $('badge-years').textContent = years + (years === 1 ? ' year' : ' years');
  $('badge-stepup').textContent = stepUp + '%';

  $('stepup-group').hidden = calcMode !== 'sip';
  $('inflation-group').hidden = !(calcMode === 'sip' || calcMode === 'lumpsum');

  let note = '';
  let labels = { total: 'Estimated value', invested: 'Amount invested', gain: 'Estimated gain' };
  let plan, headline;

  if (calcMode === 'sip') {
    plan = growthSeries({ monthly: amount, stepUp, rate, years });
    if (stepUp > 0) note = `A ${stepUp}% yearly step-up adds about ${inrShort(plan.total - sipFV(amount, rate, years))}.`;
  } else if (calcMode === 'lumpsum') {
    plan = growthSeries({ lumpsum: amount, rate, years });
  } else {
    let target;
    if (calcMode === 'goal') {
      target = amount;
      note = `To reach ${inrShort(amount)} in ${years} years.`;
    } else if (calcMode === 'retirement') {
      const futureExpense = amount * Math.pow(1.06, years);
      target = futureExpense * 12 * 25; // rule of thumb: 25 years of expenses
      note = `For a corpus of about ${inrShort(target)}. Your expenses may grow to ${inr(futureExpense)}/month at 6% inflation.`;
    } else {
      target = amount * Math.pow(1.08, years); // education inflation ~8%
      note = `The course may cost about ${inrShort(target)} in ${years} years (8% education inflation).`;
    }
    const monthly = target / sipFV(1, rate, years);
    plan = growthSeries({ monthly, rate, years });
    labels.total = 'Monthly SIP needed';
    headline = monthly;
  }

  if (headline === undefined) {
    headline = plan.total;
    if (inflationOn) {
      headline = plan.total / Math.pow(1.06, years);
      labels.total = "Estimated value in today's money";
    }
  }
  showResult(headline, plan, note, labels, years);
}

// Year-by-year invested amount and value of a SIP (with optional step-up) or a lumpsum
function growthSeries({ monthly = 0, stepUp = 0, lumpsum = 0, rate, years }) {
  const r = rate / 12 / 100;
  let value = lumpsum, invested = lumpsum, sip = monthly;
  const investedByYear = [invested], valueByYear = [value];
  for (let m = 1; m <= years * 12; m++) {
    value = (value + sip) * (1 + r); // SIP paid at the start of each month
    invested += sip;
    if (m % 12 === 0) {
      investedByYear.push(invested);
      valueByYear.push(value);
      sip *= 1 + stepUp / 100;
    }
  }
  return { invested, total: value, investedByYear, valueByYear };
}

function showResult(headline, plan, note, labels, years) {
  const gain = Math.max(plan.total - plan.invested, 0);
  $('metric-total-label').textContent = labels.total;
  tweenNumber($('metric-total-val'), headline, inr);
  $('metric-note').textContent = note;
  $('metric-invested-label').textContent = labels.invested;
  $('metric-invested-val').textContent = inr(plan.invested);
  $('metric-returns-label').textContent = labels.gain;
  $('metric-returns-val').textContent = inr(gain);
  const investedPct = plan.total > 0 ? Math.min(plan.invested / plan.total, 1) * 100 : 100;
  $('bar-invested').style.width = investedPct + '%';
  $('bar-gain').style.width = (100 - investedPct) + '%';
  $('axis-end').textContent = 'Year ' + years;
  drawChart(plan.investedByYear, plan.valueByYear);
}

/* ---------- Animated number ---------- */
const tweens = new WeakMap();
function tweenNumber(el, to, format, duration = 450) {
  const from = tweens.get(el)?.value ?? to;
  cancelAnimationFrame(tweens.get(el)?.raf);
  if (REDUCED_MOTION || from === to) {
    tweens.set(el, { value: to });
    el.textContent = format(to);
    return;
  }
  const start = performance.now();
  const state = { value: from };
  const step = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    state.value = from + (to - from) * eased;
    el.textContent = format(state.value);
    if (t < 1) state.raf = requestAnimationFrame(step);
  };
  state.raf = requestAnimationFrame(step);
  tweens.set(el, state);
}

/* ---------- Growth chart (SVG) ---------- */
let chartState = null;
function drawChart(invested, value) {
  const W = 400, H = 150, PAD = 8;
  const target = { invested, value };
  const from = chartState && chartState.value.length === value.length ? chartState : target;
  const start = performance.now();

  const render = (inv, val) => {
    const max = Math.max(...val, ...inv) || 1;
    const x = (i) => (i / (val.length - 1)) * W;
    const y = (v) => H - PAD - (v / max) * (H - PAD * 2);
    const line = (arr) => arr.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
    const valueLine = line(val);
    $('chart-value-line').setAttribute('d', valueLine);
    $('chart-value-area').setAttribute('d', `${valueLine} L${W} ${H} L0 ${H} Z`);
    $('chart-invested-line').setAttribute('d', line(inv));
  };

  const step = (now) => {
    const t = REDUCED_MOTION ? 1 : Math.min((now - start) / 450, 1);
    const e = 1 - Math.pow(1 - t, 3);
    const mix = (a, b) => b.map((v, i) => a[i] + (v - a[i]) * e);
    render(mix(from.invested, invested), mix(from.value, value));
    if (t < 1) chartState.raf = requestAnimationFrame(step);
  };
  if (chartState) cancelAnimationFrame(chartState.raf);
  chartState = { invested, value };
  chartState.raf = requestAnimationFrame(step);
}

/* ---------- Saving vs investing illustration ---------- */
function initCompare() {
  document.querySelectorAll('[data-compare-rate]').forEach(el => {
    el.textContent = inrShort(sipFV(10000, +el.dataset.compareRate, 10));
  });
}

/* ---------- Cost of waiting ---------- */
function initWaiting() {
  const RATE = 12;
  const ids = ['wait-amount', 'wait-years', 'wait-delay'];
  const update = () => {
    const amount = +$('wait-amount').value;
    const years = +$('wait-years').value;
    const delay = +$('wait-delay').value;
    ids.forEach(id => paintRange($(id)));
    $('wait-badge-amount').textContent = inr(amount);
    $('wait-badge-years').textContent = years + ' years';
    $('wait-badge-delay').textContent = delay + (delay === 1 ? ' year' : ' years');

    const now = sipFV(amount, RATE, years);
    const later = sipFV(amount, RATE, years - delay);
    const catchUp = now / sipFV(1, RATE, years - delay);

    $('wait-later-label').textContent = `Start in ${delay} ${delay === 1 ? 'year' : 'years'}`;
    tweenNumber($('wait-now'), now, inrShort);
    tweenNumber($('wait-later'), later, inrShort);
    tweenNumber($('wait-loss'), now - later, inrShort);
    $('wait-fill-now').style.width = '100%';
    $('wait-fill-later').style.width = (later / now) * 100 + '%';
    $('wait-catchup').textContent = `To catch up, you would need about ${inr(catchUp)} a month instead of ${inr(amount)}.`;
  };
  ids.forEach(id => $(id).addEventListener('input', update));
  update();
}

/* ---------- Learn corner tabs ---------- */
function initLearn() {
  const tabs = [...document.querySelectorAll('.learn-tab')];
  const select = (tab) => {
    tabs.forEach(t => {
      const on = t === tab;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      $(t.getAttribute('aria-controls')).hidden = !on;
    });
    // On phones the topics scroll sideways; keep the chosen one in view
    const row = tab.parentElement;
    if (row.scrollWidth > row.clientWidth) row.scrollTo({ left: tab.offsetLeft - row.offsetLeft - 16, behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      const dir = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      const next = tabs[(i + dir + tabs.length) % tabs.length];
      select(next);
      next.focus();
    });
  });
  select(tabs[0]);
}

/* ---------- Glossary search ---------- */
function initGlossary() {
  const items = [...document.querySelectorAll('#glossary-list > div')];
  $('glossary-search').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    let shown = 0;
    items.forEach(item => {
      const match = !q || item.textContent.toLowerCase().includes(q);
      item.hidden = !match;
      if (match) shown++;
    });
    $('glossary-empty').hidden = shown > 0;
  });
}

/* ---------- Readiness check ---------- */
function initQuiz() {
  const btn = $('quiz-btn');
  const box = $('quiz-result');
  const goalNames = { wealth: 'long-term wealth', tax: 'tax saving (ELSS)', child: "my child's education", retirement: 'retirement income' };

  btn.addEventListener('click', () => {
    const val = (name) => document.querySelector(`input[name="${name}"]:checked`).value;
    const goal = val('goal'), emergency = val('emergency'), insurance = val('insurance'), horizon = val('horizon');

    let score = 15;
    score += { high: 30, med: 15, low: 5 }[emergency];
    score += { full: 30, partial: 15, none: 5 }[insurance];
    score += { long: 25, medium: 15, short: 10 }[horizon];

    let level, badge, title, desc;
    if (score >= 80) {
      level = 'good'; badge = 'Strong foundation';
      title = 'You are ready to invest for the long term';
      desc = 'You have an emergency fund and insurance in place. A goal-based SIP plan is a sensible next step.';
    } else if (score >= 55) {
      level = 'ok'; badge = 'Good start';
      title = 'A few gaps to close as you invest';
      desc = 'You can start investing, but it is worth building a full 6-month emergency fund and checking your insurance cover alongside.';
    } else {
      level = 'low'; badge = 'Build the base first';
      title = 'Start with safety, then grow';
      desc = 'Before investing in equity, focus on an emergency fund (liquid funds can help) and basic term and health insurance.';
    }
    if (horizon === 'short') desc += ' With a 1–3 year time frame, lower-risk debt or hybrid funds are usually more suitable than pure equity.';

    $('score-num').textContent = score;
    $('score-ring').style.strokeDashoffset = 264 - (264 * score) / 100;
    const badgeEl = $('score-badge');
    badgeEl.textContent = badge;
    badgeEl.className = 'badge ' + level;
    $('quiz-title').textContent = title;
    $('quiz-desc').textContent = desc;
    $('quiz-wa').href = waLink(`Hi Parthasarathi, I took the readiness check on your website.\nScore: ${score}/100\nGoal: ${goalNames[goal]}\nI'd like to discuss a plan.`);

    box.hidden = false;
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

/* ---------- Booking form → WhatsApp ---------- */
function initBookingForm() {
  const form = $('booking-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('book-name').value.trim();
    const phone = $('book-phone').value.trim();
    if (!name || !phone) return;
    const msg = `Hello Parthasarathi,\n\nI'd like to book a free call.\n\nName: ${name}\nPhone: ${phone}\nInterested in: ${$('book-service').value}\nBest time: ${$('book-time').value}`;
    window.open(waLink(msg), '_blank', 'noopener');
    form.reset();
  });
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const targets = document.querySelectorAll('.section-head, .card, .steps, .steps li, .about-photo, .about-copy, .faq details, .contact-copy, .learn-tabs, .glossary, .safety, .link-card');
  if (!('IntersectionObserver' in window)) return;
  // Stagger items that sit side by side in a grid
  targets.forEach(el => {
    const siblings = [...el.parentElement.children].filter(c => c.matches('.card, li, details, .link-card'));
    const i = siblings.indexOf(el);
    if (i > 0) el.style.transitionDelay = (i % 6) * 70 + 'ms';
  });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -40px 0px', threshold: 0.08 });
  targets.forEach(el => { el.classList.add('reveal'); observer.observe(el); });
}

/* ---------- Count-up stats ---------- */
function initCounters() {
  const items = document.querySelectorAll('[data-count]');
  if (REDUCED_MOTION || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const { count, prefix = '', suffix = '' } = el.dataset;
      tweens.set(el, { value: 0 });
      tweenNumber(el, +count, v => prefix + Math.round(v) + suffix, 1600);
      observer.unobserve(el);
    });
  }, { threshold: 0.6 });
  items.forEach(el => observer.observe(el));
}

/* ---------- Scroll progress bar & back-to-top ---------- */
function initScrollUi() {
  const bar = $('scroll-progress');
  const toTop = $('to-top');
  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    toTop.classList.toggle('show', scrollY > innerHeight);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}

/* ---------- Spotlight that follows the mouse on cards ---------- */
function initSpotlight() {
  if (!matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll('.card').forEach(card => {
    card.classList.add('spot');
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', e.clientX - r.left + 'px');
      card.style.setProperty('--my', e.clientY - r.top + 'px');
    });
    card.addEventListener('pointerleave', () => card.style.setProperty('--my', '-100%'));
  });
}

/* ---------- 3D tilt on the hero photo card ---------- */
function initTilt() {
  const card = $('hero-card');
  if (REDUCED_MOTION || !matchMedia('(hover: hover) and (min-width: 861px)').matches) return;
  const hero = $('top');
  hero.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth;
    const dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
    card.style.transform = `perspective(900px) rotateY(${dx * 10}deg) rotateX(${-dy * 10}deg)`;
  });
  hero.addEventListener('pointerleave', () => { card.style.transform = ''; });
}
