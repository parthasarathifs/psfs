/* ==========================================================================
   MUTUAL FUND DISTRIBUTOR (MFD) MODERN WEBSITE JAVASCRIPT LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Core Modules
  initPreloader();
  initCalculators();
  initQuizScorecard();
  initFlipCards();
  initTestimonialsManager();
  initModalHandlers();
  initFaqAccordion();
  initNavScroll();
  initMobileDrawer();
  initHeroPreviewChart();
  initScrollReveal();
  initCounterNumbers();
});

/* --------------------------------------------------------------------------
   0. ULTRA-MODERN WEALTH COMPOUNDING PRELOADER HANDLER (60 FPS OPTIMIZED)
   -------------------------------------------------------------------------- */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const bar = document.getElementById('preloader-bar');
  const ring = document.getElementById('preloader-ring');
  const pctText = document.getElementById('preloader-pct');
  const stepText = document.getElementById('preloader-step');

  if (!preloader) return;

  const circumference = 276.46; // 2 * PI * r (r=44)
  let currentProgress = 0;
  let targetProgress = 0;
  let animId = null;

  const updateProgress = (val) => {
    val = Math.min(Math.max(val, 0), 100);
    
    if (bar) bar.style.width = val + '%';
    if (pctText) pctText.textContent = Math.round(val) + '%';

    if (ring) {
      const offset = circumference - (val / 100) * circumference;
      ring.style.strokeDashoffset = offset;
    }

    if (stepText) {
      if (val < 30) {
        stepText.textContent = 'Initializing Wealth Engine...';
      } else if (val < 60) {
        stepText.textContent = 'Curating Multi-AMC Portfolios...';
      } else if (val < 85) {
        stepText.textContent = 'Calculating Compounding Yields...';
      } else {
        stepText.textContent = 'Unlocking Financial Freedom...';
      }
    }
  };

  function animate() {
    if (currentProgress < targetProgress) {
      currentProgress += (targetProgress - currentProgress) * 0.18 + 0.5;
      if (currentProgress >= targetProgress) {
        currentProgress = targetProgress;
      }
      updateProgress(currentProgress);
    }

    if (currentProgress < 100) {
      animId = requestAnimationFrame(animate);
    } else {
      updateProgress(100);
      dismissPreloader();
    }
  }

  // Smooth progress ticker
  const interval = setInterval(() => {
    targetProgress += Math.floor(Math.random() * 14) + 16;
    if (targetProgress >= 100) {
      targetProgress = 100;
      clearInterval(interval);
    }
  }, 120);

  animId = requestAnimationFrame(animate);

  function dismissPreloader() {
    if (animId) cancelAnimationFrame(animId);
    setTimeout(() => {
      preloader.classList.add('fade-out');
      setTimeout(() => {
        if (preloader.parentNode) {
          preloader.style.display = 'none';
          preloader.remove(); // Clean DOM removal so overlay never blocks interaction
        }
      }, 400);
    }, 200);
  }

  window.addEventListener('load', () => {
    targetProgress = 100;
    clearInterval(interval);
  });
}

/* --------------------------------------------------------------------------
   0.1 SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   0.2 ANIMATED COUNTER NUMBERS
   -------------------------------------------------------------------------- */
function initCounterNumbers() {
  const counters = document.querySelectorAll('.counter-number');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        entry.target.classList.add('counted');
        animateSingleCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

function animateSingleCounter(counterEl) {
  const target = parseInt(counterEl.getAttribute('data-target'));
  const prefix = counterEl.getAttribute('data-prefix') || '';
  const suffix = counterEl.getAttribute('data-suffix') || '';
  let count = 0;
  const duration = 1500;
  const stepTime = Math.abs(Math.floor(duration / target));

  const timer = setInterval(() => {
    count += Math.ceil(target / 40);
    if (count >= target) {
      count = target;
      clearInterval(timer);
    }
    counterEl.textContent = `${prefix}${count}${suffix}`;
  }, stepTime || 30);
}



/* --------------------------------------------------------------------------
   2. FINANCIAL CALCULATORS ENGINE (SIP, LUMPSUM, GOAL PLANNER)
   -------------------------------------------------------------------------- */
let activeCalcMode = 'sip';
let sipChart = null;

function initCalculators() {
  const calcTabs = document.querySelectorAll('.calc-tab-btn');
  calcTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      calcTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCalcMode = tab.getAttribute('data-calc');
      updateCalculatorView();
    });
  });

  // Range Sliders & Inputs Event Listeners
  const sliders = ['calc-amount', 'calc-rate', 'calc-years', 'calc-stepup'];
  sliders.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', calculateFinancials);
    }
  });

  const inflationCheck = document.getElementById('calc-inflation');
  if (inflationCheck) {
    inflationCheck.addEventListener('change', calculateFinancials);
  }

  // Initial Calculation
  calculateFinancials();
}

function updateCalculatorView() {
  const labelAmount = document.getElementById('label-amount');
  const amountInput = document.getElementById('calc-amount');
  
  if (activeCalcMode === 'sip') {
    labelAmount.textContent = 'Monthly SIP Investment (₹)';
    amountInput.min = 500;
    amountInput.max = 100000;
    amountInput.step = 500;
    amountInput.value = 10000;
  } else if (activeCalcMode === 'lumpsum') {
    labelAmount.textContent = 'One-Time Lumpsum Amount (₹)';
    amountInput.min = 5000;
    amountInput.max = 2000000;
    amountInput.step = 5000;
    amountInput.value = 100000;
  } else if (activeCalcMode === 'goal') {
    labelAmount.textContent = 'Target Goal Wealth (₹)';
    amountInput.min = 100000;
    amountInput.max = 50000000;
    amountInput.step = 100000;
    amountInput.value = 5000000;
  }

  calculateFinancials();
}

function calculateFinancials() {
  const amount = parseFloat(document.getElementById('calc-amount').value);
  const rate = parseFloat(document.getElementById('calc-rate').value);
  const years = parseFloat(document.getElementById('calc-years').value);
  const stepUpEl = document.getElementById('calc-stepup');
  const stepUpRate = stepUpEl ? parseFloat(stepUpEl.value) : 0;
  const isInflation = document.getElementById('calc-inflation')?.checked || false;

  const badgeStepUp = document.getElementById('badge-stepup');
  if (badgeStepUp) badgeStepUp.textContent = stepUpRate + '% p.a.';

  document.getElementById('badge-amount').textContent = formatCurrency(amount);
  document.getElementById('badge-rate').textContent = rate + '%';
  document.getElementById('badge-years').textContent = years + (years === 1 ? ' Year' : ' Years');

  const stepUpGroup = document.getElementById('stepup-group');
  if (stepUpGroup) {
    stepUpGroup.style.display = activeCalcMode === 'sip' ? 'block' : 'none';
  }

  let investedTotal = 0;
  let totalFutureValue = 0;
  let estimatedReturns = 0;
  let stepUpDiff = 0;

  if (activeCalcMode === 'sip') {
    const monthlyRate = rate / 12 / 100;
    const months = years * 12;

    const normalInvested = amount * months;
    const normalFV = amount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);

    if (stepUpRate > 0) {
      let currentMonthly = amount;
      let cumulativeFV = 0;
      let cumulativeInvested = 0;

      for (let y = 0; y < years; y++) {
        for (let m = 0; m < 12; m++) {
          const monthsRemaining = months - (y * 12 + m);
          cumulativeFV += currentMonthly * Math.pow(1 + monthlyRate, monthsRemaining);
          cumulativeInvested += currentMonthly;
        }
        currentMonthly = currentMonthly * (1 + stepUpRate / 100);
      }

      investedTotal = cumulativeInvested;
      totalFutureValue = cumulativeFV;
      stepUpDiff = totalFutureValue - normalFV;
    } else {
      investedTotal = normalInvested;
      totalFutureValue = normalFV;
    }

    estimatedReturns = totalFutureValue - investedTotal;
  } else if (activeCalcMode === 'lumpsum') {
    investedTotal = amount;
    totalFutureValue = amount * Math.pow(1 + (rate / 100), years);
    estimatedReturns = totalFutureValue - investedTotal;
  } else if (activeCalcMode === 'goal') {
    const targetGoal = amount;
    const monthlyRate = rate / 12 / 100;
    const months = years * 12;
    const requiredMonthly = targetGoal / (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
    investedTotal = requiredMonthly * months;
    totalFutureValue = targetGoal;
    estimatedReturns = totalFutureValue - investedTotal;

    document.getElementById('metric-invested-label').textContent = 'Required Monthly SIP';
    document.getElementById('metric-invested-val').textContent = formatCurrency(Math.round(requiredMonthly));
    document.getElementById('metric-returns-val').textContent = formatCurrency(Math.round(estimatedReturns));
    document.getElementById('metric-total-val').textContent = formatCurrency(Math.round(totalFutureValue));
    
    const diffEl = document.getElementById('metric-stepup-diff');
    if (diffEl) diffEl.style.display = 'none';

    renderCalcChart(investedTotal, estimatedReturns);
    return;
  }

  // Adjust for inflation if checked (6% p.a.)
  let displayFV = totalFutureValue;
  if (isInflation) {
    displayFV = totalFutureValue / Math.pow(1 + 0.06, years);
    document.getElementById('metric-total-label').textContent = 'Purchasing Power (Inflation Adjusted @ 6%)';
  } else {
    document.getElementById('metric-total-label').textContent = 'Expected Future Corpus Value';
  }

  document.getElementById('metric-invested-label').textContent = 'Total Invested Amount';
  document.getElementById('metric-invested-val').textContent = formatCurrency(Math.round(investedTotal));
  document.getElementById('metric-returns-val').textContent = formatCurrency(Math.round(estimatedReturns));
  document.getElementById('metric-total-val').textContent = formatCurrency(Math.round(displayFV));

  const diffEl = document.getElementById('metric-stepup-diff');
  if (diffEl) {
    if (activeCalcMode === 'sip' && stepUpRate > 0) {
      diffEl.style.display = 'block';
      diffEl.innerHTML = `<i class="bi bi-lightning-fill"></i> ${stepUpRate}% Step-Up adds +${formatCurrency(Math.round(stepUpDiff))} Extra Wealth!`;
    } else {
      diffEl.style.display = 'none';
    }
  }

  renderCalcChart(investedTotal, estimatedReturns);
}

function renderCalcChart(invested, returns) {
  const ctx = document.getElementById('calcChart');
  if (!ctx) return;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const borderColor = isDark ? '#0f1424' : '#ffffff';

  if (sipChart) {
    sipChart.data.datasets[0].data = [Math.round(invested), Math.round(returns)];
    sipChart.update();
    return;
  }

  sipChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Invested Principal', 'Estimated Gain'],
      datasets: [{
        data: [Math.round(invested), Math.round(returns)],
        backgroundColor: ['#a855f7', '#10b981'],
        borderColor: borderColor,
        borderWidth: 3,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: isDark ? '#a1a1aa' : '#334155',
            font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.label + ': ' + formatCurrency(context.raw);
            }
          }
        }
      },
      cutout: '72%'
    }
  });
}

function initHeroPreviewChart() {
  const ctx = document.getElementById('heroChart');
  if (!ctx) return;

  window.heroChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['2020', '2021', '2022', '2023', '2024', '2025', '2026'],
      datasets: [
        {
          label: 'SIP Portfolio Growth',
          data: [100000, 240000, 420000, 680000, 1050000, 1520000, 2180000],
          borderColor: '#10b981',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          pointBackgroundColor: '#10b981',
          pointRadius: 4
        },
        {
          label: 'Traditional Bank Savings',
          data: [100000, 105000, 111000, 117000, 123000, 130000, 137000],
          borderColor: '#71717a',
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.1,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#71717a' } },
        y: { display: false }
      }
    }
  });
}

/* --------------------------------------------------------------------------
   2.1 FINANCIAL HEALTH SCORECARD & AMC ECOSYSTEM HANDLERS
   -------------------------------------------------------------------------- */
function initQuizScorecard() {
  const btn = document.getElementById('get-quiz-result-btn');
  const resultBox = document.getElementById('quiz-result-box');
  if (!btn || !resultBox) return;

  btn.addEventListener('click', () => {
    const goal = document.querySelector('input[name="goal"]:checked')?.value || 'wealth';
    const emergency = document.querySelector('input[name="emergency"]:checked')?.value || 'high';
    const insurance = document.querySelector('input[name="insurance"]:checked')?.value || 'full';
    const horizon = document.querySelector('input[name="horizon"]:checked')?.value || 'long';

    let score = 0;
    score += 15; // Goal defined
    if (emergency === 'high') score += 30;
    else if (emergency === 'med') score += 15;
    else score += 5;

    if (insurance === 'full') score += 30;
    else if (insurance === 'partial') score += 15;
    else score += 5;

    if (horizon === 'long') score += 25;
    else if (horizon === 'medium') score += 15;
    else score += 10;

    if (score > 100) score = 100;

    const scoreNum = document.getElementById('score-num');
    const scoreBadge = document.getElementById('score-badge');
    const ringFill = document.getElementById('score-ring-fill');
    const titleEl = document.getElementById('quiz-result-title');
    const descEl = document.getElementById('quiz-result-desc');
    const waBtn = document.getElementById('quiz-wa-btn');

    if (scoreNum) scoreNum.textContent = score;

    if (ringFill) {
      const offset = 264 - (264 * score / 100);
      ringFill.style.strokeDashoffset = offset;
    }

    let eqPct = 70, flexPct = 20, debtPct = 10;
    let categoryTitle = 'Aggressive Growth Portfolio';
    let statusText = 'Excellent Financial Health! You have strong emergency reserves and risk protection. Ready to build long-term equity wealth.';
    let badgeText = 'Financial Health: Excellent 🚀';
    let badgeBg = 'rgba(16, 185, 129, 0.2)';
    let badgeColor = 'var(--secondary)';

    if (score < 55) {
      eqPct = 40; flexPct = 20; debtPct = 40;
      categoryTitle = 'Capital Protection & Balanced Growth';
      statusText = 'Needs Safety Shield! We recommend strengthening your Emergency Liquid Reserve & Basic Term Insurance before expanding aggressive equity.';
      badgeText = 'Financial Health: Needs Shield 🛡️';
      badgeBg = 'rgba(244, 63, 94, 0.2)';
      badgeColor = 'var(--accent-rose)';
    } else if (score < 80) {
      eqPct = 60; flexPct = 25; debtPct = 15;
      categoryTitle = 'Balanced Wealth Compounding Portfolio';
      statusText = 'Solid Foundation! You have moderate savings and emergency buffers. Ideal for balanced equity and ELSS wealth building.';
      badgeText = 'Financial Health: Good ⚖️';
      badgeBg = 'rgba(251, 191, 36, 0.2)';
      badgeColor = 'var(--accent-amber)';
    }

    if (scoreBadge) {
      scoreBadge.textContent = badgeText;
      scoreBadge.style.background = badgeBg;
      scoreBadge.style.color = badgeColor;
    }
    if (titleEl) titleEl.textContent = `Recommended Strategy: ${categoryTitle}`;
    if (descEl) descEl.textContent = statusText;

    const eqVal = document.getElementById('quiz-eq-val');
    const eqBar = document.getElementById('quiz-eq-bar');
    const flexVal = document.getElementById('quiz-flex-val');
    const flexBar = document.getElementById('quiz-flex-bar');
    const debtVal = document.getElementById('quiz-debt-val');
    const debtBar = document.getElementById('quiz-debt-bar');

    if (eqVal) eqVal.textContent = eqPct + '%';
    if (eqBar) eqBar.style.width = eqPct + '%';
    if (flexVal) flexVal.textContent = flexPct + '%';
    if (flexBar) flexBar.style.width = flexPct + '%';
    if (debtVal) debtVal.textContent = debtPct + '%';
    if (debtBar) debtBar.style.width = debtPct + '%';

    if (waBtn) {
      const waMsg = `Hi Parthasarathi, I completed the Financial Health Scorecard on your website!\nScore: ${score}/100\nCategory: ${categoryTitle}\nI would like to discuss my custom Mutual Fund strategy.`;
      waBtn.href = `https://wa.me/917609952853?text=${encodeURIComponent(waMsg)}`;
    }

    resultBox.style.display = 'block';
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}



function initFlipCards() {
  const flipCards = document.querySelectorAll('.flip-card');
  flipCards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });
  });
}

/* --------------------------------------------------------------------------
   3. CLIENT TESTIMONIALS & WRITE-A-REVIEW SYSTEM
   -------------------------------------------------------------------------- */
const defaultReviews = [
  {
    name: 'Rajesh Sharma',
    goal: 'Retirement Wealth & Freedom',
    rating: 5,
    text: 'Parthasarathi guided me to start a disciplined monthly SIP 6 years ago. My portfolio has grown beyond my expectations. Honest, transparent, and always accessible!'
  },
  {
    name: 'Ananya Roy',
    goal: "Child's Higher Education Fund",
    rating: 5,
    text: 'Extremely knowledgeable Mutual Fund Distributor. He mapped out an ELSS & Equity SIP plan that fits my monthly budget perfectly. Highly recommended!'
  },
  {
    name: 'Vikram & Meera Patel',
    goal: 'Dream Home Purchase Fund',
    rating: 5,
    text: 'The portfolio review service was an eye-opener. He helped me consolidate fragmented holdings into high-performing funds. Great personalized guidance.'
  }
];

async function initTestimonialsManager() {
  await renderReviews();

  // Review Form Rating Star Selector
  let selectedRating = 5;
  const stars = document.querySelectorAll('#star-selector i');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.getAttribute('data-star'));
      stars.forEach((s, idx) => {
        if (idx < selectedRating) {
          s.classList.add('selected');
        } else {
          s.classList.remove('selected');
        }
      });
    });
  });

  // Handle Review Submission
  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('review-name').value.trim();
      const goal = document.getElementById('review-goal').value.trim();
      const text = document.getElementById('review-text').value.trim();

      if (!name || !text) return;

      const newReview = { name, goal: goal || 'Wealth Creation', rating: selectedRating, text };
      await saveUserReview(newReview);
      await renderReviews();
      closeModal('review-modal');
      reviewForm.reset();
      alert('Thank you! Your review has been published permanently on the website.');
    });
  }
}

async function getStoredReviews() {
  try {
    const res = await fetch('/api/reviews');
    if (res.ok) {
      const serverData = await res.json();
      if (Array.isArray(serverData) && serverData.length > 0) {
        localStorage.setItem('mfd_client_reviews', JSON.stringify(serverData));
        return serverData;
      }
    }
  } catch (e) {
    console.log('Server review fetch fallback');
  }

  const localData = localStorage.getItem('mfd_client_reviews');
  if (!localData) return defaultReviews;
  try {
    return JSON.parse(localData);
  } catch (e) {
    return defaultReviews;
  }
}

async function saveUserReview(review) {
  // Update local cache immediately
  const localData = localStorage.getItem('mfd_client_reviews');
  let reviews = [];
  try {
    reviews = localData ? JSON.parse(localData) : [...defaultReviews];
  } catch(e) {
    reviews = [...defaultReviews];
  }
  reviews.unshift(review);
  localStorage.setItem('mfd_client_reviews', JSON.stringify(reviews));

  // Sync to backend file reviews.json
  try {
    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    });
  } catch(e) {
    console.log('Server review sync fallback');
  }
}

async function renderReviews() {
  const container = document.getElementById('testimonials-container');
  if (!container) return;

  const reviews = await getStoredReviews();
  container.innerHTML = reviews.map(r => `
    <div class="glass-card testimonial-card">
      <div>
        <div class="rating-stars" style="margin-bottom: 12px;">
          ${'<i class="bi bi-star-fill"></i>'.repeat(r.rating || 5)}
        </div>
        <p class="review-text">"${escapeHtml(r.text)}"</p>
      </div>
      <div class="client-profile">
        <div class="client-avatar">${escapeHtml((r.name || 'C').charAt(0).toUpperCase())}</div>
        <div class="client-info">
          <h4>${escapeHtml(r.name || 'Valued Client')}</h4>
          <p><i class="bi bi-bullseye" style="color: var(--secondary);"></i> ${escapeHtml(r.goal || 'Wealth Creation')}</p>
        </div>
      </div>
    </div>
  `).join('');
}

/* --------------------------------------------------------------------------
   4. MODAL DIALOG HANDLERS (APPOINTMENT & REVIEW)
   -------------------------------------------------------------------------- */
function initModalHandlers() {
  // Open Review Modal
  const openReviewBtn = document.getElementById('open-review-modal-btn');
  if (openReviewBtn) {
    openReviewBtn.addEventListener('click', () => openModal('review-modal'));
  }

  // Open Appointment Booking Modal
  const bookingBtns = document.querySelectorAll('.open-booking-modal-btn');
  bookingBtns.forEach(btn => {
    btn.addEventListener('click', () => openModal('booking-modal'));
  });

  // Close Buttons
  const closeBtns = document.querySelectorAll('.modal-close-btn');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) closeModal(modal.id);
    });
  });

  // Close on Backdrop Click
  const modals = document.querySelectorAll('.modal-overlay');
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal.id);
    });
  });

  // Handle Appointment Booking Submit
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('book-name').value.trim();
      const phone = document.getElementById('book-phone').value.trim();
      const service = document.getElementById('book-service').value;

      if (!name || !phone) return;

      // Pre-fill WhatsApp message
      const msg = `Hello Parthasarathi, I would like to book a consultation.\nName: ${name}\nPhone: ${phone}\nInterested Service: ${service}`;
      const waUrl = `https://wa.me/917609952853?text=${encodeURIComponent(msg)}`;
      
      closeModal('booking-modal');
      bookingForm.reset();
      window.open(waUrl, '_blank');
    });
  }
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

/* --------------------------------------------------------------------------
   5. FAQ ACCORDION HANDLER
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const isActive = item.classList.contains('active');
      
      document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));
      
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   6. SCROLL & NAVIGATION HIGHLIGHT
   -------------------------------------------------------------------------- */
function initNavScroll() {
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 100;
      const sectionId = current.getAttribute('id');
      
      const navLink = document.querySelector(`.nav-link[href*="${sectionId}"]`);
      const mobileNavItem = document.querySelector(`.mobile-nav-item[href*="${sectionId}"]`);
      
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        if (navLink) navLink.classList.add('active');
        if (mobileNavItem) mobileNavItem.classList.add('active');
      } else {
        if (navLink) navLink.classList.remove('active');
        if (mobileNavItem) mobileNavItem.classList.remove('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   6.1 MOBILE SLIDE-IN NAVIGATION DRAWER HANDLER
   -------------------------------------------------------------------------- */
function initMobileDrawer() {
  const openBtn = document.getElementById('hamburger-menu-btn');
  const overlay = document.getElementById('mobile-drawer-overlay');
  const closeBtn = document.getElementById('mobile-drawer-close');
  const drawerLinks = document.querySelectorAll('.drawer-link');
  const drawerModalBtns = document.querySelectorAll('.mobile-drawer-content .open-booking-modal-btn');

  if (!openBtn || !overlay) return;

  function openDrawer() {
    overlay.classList.add('active');
    openBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    overlay.classList.remove('active');
    openBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  openBtn.addEventListener('click', openDrawer);

  if (closeBtn) {
    closeBtn.addEventListener('click', closeDrawer);
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeDrawer();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeDrawer();
    }
  });

  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  drawerModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      closeDrawer();
    });
  });
}

/* Helper Utilities */
function formatCurrency(num) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
