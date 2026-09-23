// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', links.classList.contains('open'));
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }

  // Mark active nav link
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a[href]').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
});

// Scroll-triggered reveal animation (elements with class "reveal")
document.addEventListener('DOMContentLoaded', () => {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => observer.observe(el));
});

// ---------------- HR Health Check ----------------
const HC_QUESTIONS = [
  { pillar: 'Structure', title: 'Roles and reporting lines', sub: 'Every position has a clear, documented job description and reporting relationship.' },
  { pillar: 'Structure', title: 'Organizational design', sub: 'Your organogram reflects how the business actually operates today.' },
  { pillar: 'Talent', title: 'Hiring process', sub: 'New roles are filled through a consistent sourcing, screening and interview process.' },
  { pillar: 'Talent', title: 'Succession readiness', sub: 'Critical roles have an identified internal successor or development plan.' },
  { pillar: 'Performance', title: 'Performance reviews', sub: 'Employees are evaluated against defined KPIs on a regular cycle.' },
  { pillar: 'Performance', title: 'Goal alignment', sub: 'Team and individual goals are visibly linked to company objectives.' },
  { pillar: 'Operations', title: 'HR policy manual', sub: 'Policies and procedures are documented, current and accessible to staff.' },
  { pillar: 'Operations', title: 'Payroll and compliance', sub: 'Payroll, tax deductions and labor law compliance run without manual firefighting.' },
  { pillar: 'Culture', title: 'Defined values', sub: 'Company values are written down and visibly shape day-to-day decisions.' },
  { pillar: 'Culture', title: 'Employee engagement', sub: 'You have a way of measuring how engaged and satisfied your people are.' },
];

function initHealthCheck() {
  const form = document.getElementById('hc-form');
  if (!form) return;

  const answers = new Array(HC_QUESTIONS.length).fill(null);
  const listEl = document.getElementById('hc-questions');

  HC_QUESTIONS.forEach((q, i) => {
    const card = document.createElement('div');
    card.className = 'hc-question';
    card.innerHTML = `
      <span class="hc-pillar">${q.pillar}</span>
      <div class="hc-q-title">${q.title}</div>
      <div class="hc-q-sub">${q.sub}</div>
      <div class="hc-scale" data-i="${i}">
        ${['Not in place', 'Informal only', 'Partly documented', 'Solid, consistent'].map((label, v) =>
          `<button type="button" data-v="${v + 1}">${label}</button>`).join('')}
      </div>`;
    listEl.appendChild(card);

    card.querySelectorAll('.hc-scale button').forEach(btn => {
      btn.addEventListener('click', () => {
        answers[i] = parseInt(btn.dataset.v, 10);
        card.querySelectorAll('.hc-scale button').forEach(b => b.classList.remove('sel'));
        btn.classList.add('sel');
        card.classList.add('answered');
        updateProgress();
      });
    });
  });

  const progressEl = document.getElementById('hc-progress');
  const submitBtn = document.getElementById('hc-submit');

  function updateProgress() {
    const done = answers.filter(a => a !== null).length;
    progressEl.textContent = `${done} of ${HC_QUESTIONS.length} answered`;
    submitBtn.disabled = done < HC_QUESTIONS.length;
    submitBtn.style.opacity = done < HC_QUESTIONS.length ? '.5' : '1';
  }
  updateProgress();

  submitBtn.addEventListener('click', () => {
    const total = answers.reduce((a, b) => a + b, 0);
    const pct = Math.round((total / (HC_QUESTIONS.length * 4)) * 100);

    document.getElementById('hc-intro').style.display = 'none';
    const result = document.getElementById('hc-result');
    result.classList.add('show');

    document.getElementById('hc-score-num').textContent = pct + '%';
    const circumference = 2 * Math.PI * 58;
    const ring = document.getElementById('hc-ring-fill');
    ring.style.strokeDasharray = `${circumference}`;
    ring.style.strokeDashoffset = `${circumference * (1 - pct / 100)}`;

    let verdict, msg;
    if (pct >= 80) {
      verdict = 'Strong foundation';
      msg = 'Your core HR systems are largely in place. The opportunity now is refinement: tightening KPIs, succession pipelines and culture measurement.';
    } else if (pct >= 50) {
      verdict = 'Building momentum';
      msg = 'You have real building blocks in place, but several are informal or inconsistent. A structured system gap analysis will show exactly where to focus first.';
    } else {
      verdict = 'Early stage';
      msg = 'Most core HR systems are missing or undocumented. This is common for growing SMEs, and it is very fixable with the right structure in place.';
    }
    document.getElementById('hc-verdict').textContent = verdict;
    document.getElementById('hc-verdict-msg').textContent = msg;

    // Pillar breakdown
    const pillars = {};
    HC_QUESTIONS.forEach((q, i) => {
      pillars[q.pillar] = pillars[q.pillar] || [];
      pillars[q.pillar].push(answers[i]);
    });
    const breakdown = document.getElementById('hc-breakdown');
    breakdown.innerHTML = '';
    Object.entries(pillars).forEach(([name, vals]) => {
      const p = Math.round((vals.reduce((a, b) => a + b, 0) / (vals.length * 4)) * 100);
      const row = document.createElement('div');
      row.style.marginBottom = '18px';
      row.innerHTML = `
        <div style="display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:8px;">
          <span>${name}</span><span style="color:rgba(255,255,255,.6)">${p}%</span>
        </div>
        <div class="hc-band-track"><div class="hc-band-fill" style="width:${p}%"></div></div>`;
      breakdown.appendChild(row);
    });

    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
document.addEventListener('DOMContentLoaded', initHealthCheck);
