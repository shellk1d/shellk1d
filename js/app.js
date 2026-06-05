// ── DATA LOADER ──
let DATA = null;

async function loadData() {
  if (DATA) return DATA;
  if (typeof PORTFOLIO_DATA !== 'undefined') {
    DATA = PORTFOLIO_DATA;
    return DATA;
  }
  try {
    const r = await fetch('js/content.json');
    DATA = await r.json();
    return DATA;
  } catch (e) {
    console.error("Error al cargar content.json (esto es normal si abres el archivo usando el protocolo file:// sin servidor local). Usando fallback de seguridad.", e);
    return {
      profile: { alias: "shellk1d", tagline: "", stats: { machines_pwned: 0, writeups: 0, tools_published: 0 } },
      writeups: [],
      blog: [],
      tools: []
    };
  }
}

// ── UTILS ──
function formatDate(str) {
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function difficultyTag(diff) {
  const cls = diff.toLowerCase();
  return `<span class="tag tag-${cls}">${diff}</span>`;
}

function platformTag(p) {
  if (p === 'HackTheBox') return `<span class="tag tag-htb">HackTheBox</span>`;
  if (p === 'TryHackMe') return `<span class="tag tag-thm">TryHackMe</span>`;
  if (p === 'Lakera') return `<span class="tag tag-lk">Lakera</span>`;
  if (p === 'DockerLabs') return `<span class="tag tag-dl">DockerLabs</span>`;
  return `<span class="tag">${p}</span>`;
}

function renderTags(tags) {
  return tags.map(t => `<span class="tag">${t}</span>`).join('');
}

function setActivePage(name) {
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === name);
  });
}

// ── NAVBAR TOGGLE ──
function initNavbar() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }
}

// ── FILTER ENGINE ──
function initFilters(containerId, filterGroupId, searchId, itemSelector, filterAttr) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let activeFilter = 'all';
  let searchTerm = '';

  function applyFilters() {
    const items = container.querySelectorAll(itemSelector);
    let visible = 0;
    items.forEach(item => {
      const filterVal = item.dataset[filterAttr] || '';
      const searchVal = item.dataset.search || '';
      const matchFilter = activeFilter === 'all' || filterVal.includes(activeFilter);
      const matchSearch = !searchTerm || searchVal.includes(searchTerm.toLowerCase());
      item.style.display = matchFilter && matchSearch ? '' : 'none';
      if (matchFilter && matchSearch) visible++;
    });
    const noResults = document.getElementById('noResults');
    if (noResults) noResults.style.display = visible === 0 ? '' : 'none';
  }

  const filterGroup = document.getElementById(filterGroupId);
  if (filterGroup) {
    filterGroup.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        applyFilters();
      });
    });
  }

  const searchInput = document.getElementById(searchId);
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      searchTerm = e.target.value;
      applyFilters();
    });
  }
}

// ── RENDER WRITEUPS ──
async function renderWriteups(containerId, limit = null) {
  const data = await loadData();
  const container = document.getElementById(containerId);
  if (!container) return;

  let items = data.writeups;
  if (limit) items = items.slice(0, limit);

  container.innerHTML = items.map(w => `
    <a href="${w.url}" class="card writeup-card"
       data-difficulty="${w.difficulty.toLowerCase()}"
       data-platform="${{ 'HackTheBox': 'htb', 'TryHackMe': 'thm', 'DockerLabs': 'dl', 'Lakera' : 'lk'}[w.platform] || 'unknown'}"
       data-os="${w.os.toLowerCase()}"
       data-search="${(w.title + ' ' + w.tags.join(' ') + ' ' + w.os + ' ' + w.platform).toLowerCase()}">
      <div class="writeup-platform">
        ${platformTag(w.platform)}
        <span class="tag tag-os">${w.os}</span>
        ${difficultyTag(w.difficulty)}
      </div>
      <div class="writeup-title">${w.title}</div>
      <div class="writeup-desc">${w.description}</div>
      <div class="writeup-footer">
        <div class="writeup-tags">${renderTags(w.tags)}</div>
        <div class="writeup-date">${formatDate(w.date)}</div>
      </div>
    </a>
  `).join('');
}

// ── RENDER BLOG ──
async function renderBlog(containerId, limit = null) {
  const data = await loadData();
  const container = document.getElementById(containerId);
  if (!container) return;

  let items = data.blog;
  if (limit) items = items.slice(0, limit);

  container.innerHTML = items.map(b => `
    <a href="${b.url}" class="card"
       data-category="${b.category.toLowerCase()}"
       data-search="${(b.title + ' ' + b.tags.join(' ')).toLowerCase()}">
      <div class="blog-category">${b.category}</div>
      <div class="blog-title">${b.title}</div>
      <div class="blog-excerpt">${b.excerpt}</div>
      <div class="blog-meta">
        <span>${formatDate(b.date)}</span>
        <span>·</span>
        <span>${renderTags(b.tags)}</span>
      </div>
    </a>
  `).join('');
}

// ── RENDER TOOLS ──
async function renderTools(containerId, limit = null) {
  const data = await loadData();
  const container = document.getElementById(containerId);
  if (!container) return;

  let items = data.tools;
  if (limit) items = items.slice(0, limit);

  container.innerHTML = items.map(t => `
    <div class="card"
         data-lang="${t.language.toLowerCase()}"
         data-search="${(t.name + ' ' + t.tags.join(' ')).toLowerCase()}">
      <div class="tool-name">${t.name}</div>
      <div class="tool-desc">${t.description}</div>
      <div class="tool-footer">
        <div class="writeup-tags">${renderTags(t.tags)}</div>
        <div class="tool-stars">
          <a href="${t.github}" target="_blank" rel="noopener" class="btn btn-outline" style="padding:0.25rem 0.6rem;font-size:0.7rem;margin-left:0px;" onclick="event.stopPropagation()">GitHub →</a>
        </div>
      </div>
    </div>
  `).join('');
}

function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.textContent = Math.floor(progress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      obj.textContent = end;
    }
  };
  window.requestAnimationFrame(step);
}

// ── LOAD PROFILE ──
async function loadProfile() {
  const data = await loadData();
  const p = data.profile;

  // Calcular el número real de items a partir de los arrays de datos
  const blogCount = data.blog ? data.blog.length : 0;
  const writeupsCount = data.writeups ? data.writeups.length : 0;
  const toolsCount = data.tools ? data.tools.length : 0;

  // Animar las estadísticas dinámicamente desde el contenido real
  const blogEl = document.querySelector('[data-stat="blog"]');
  const writeupsEl = document.querySelector('[data-stat="writeups"]');
  const toolsEl = document.querySelector('[data-stat="tools"]');

  if (blogEl) animateValue(blogEl, 0, blogCount, 1200);
  if (writeupsEl) animateValue(writeupsEl, 0, writeupsCount, 1200);
  if (toolsEl) animateValue(toolsEl, 0, toolsCount, 1200);

  // Social links
  const socials = document.getElementById('socialLinks');
  if (socials && p.social) {
    socials.innerHTML = Object.entries(p.social).filter(([,v]) => v).map(([k,v]) => `
      <a href="${v}" target="_blank" rel="noopener" class="social-link">
        <span>↗</span> ${k}
      </a>
    `).join('');
  }
}

// ── TERMINAL TYPER ──
function typeWriter(el, text, speed = 45) {
  let i = 0;
  el.textContent = '';
  const timer = setInterval(() => {
    if (i < text.length) { el.textContent += text[i++]; } else clearInterval(timer);
  }, speed);
}

// ── CANVAS HERO NODES ──
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width = canvas.width = canvas.offsetWidth;
  let height = canvas.height = canvas.offsetHeight;
  
  window.addEventListener('resize', () => {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  });
  
  const particles = [];
  const maxParticles = width < 768 ? 30 : 70;
  const maxDistance = 110;
  
  let mouse = { x: null, y: null, active: false };
  const heroSection = canvas.closest('.hero');
  if (heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    });
    heroSection.addEventListener('mouseleave', () => {
      mouse.active = false;
    });
  }
  
  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2 + 1;
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(234, 123, 123, 0.45)';
      ctx.fill();
    }
  }
  
  for (let i = 0; i < maxParticles; i++) {
    particles.push(new Particle());
  }
  
  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < maxDistance) {
          const alpha = (1 - dist / maxDistance) * 0.12;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(234, 123, 123, ${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
      
      if (mouse.active) {
        const p = particles[i];
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDistance + 40) {
          const alpha = (1 - dist / (maxDistance + 40)) * 0.22;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(234, 123, 123, ${alpha})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }
    }
    
    requestAnimationFrame(animate);
  }
  
  animate();
}

// ── MOUSE REACTIVE CARD GLOW ──
function initCardGlow() {
  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.card');
    if (card) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    }
  });
}

// ── SCROLL REVEAL ANIMATIONS ──
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -40px 0px'
  });
  
  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });
}

// ── DOM CONTENT LOADED ──
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  loadProfile();
  initHeroCanvas();
  initCardGlow();
  initScrollReveal();

  const typedEl = document.getElementById('typedTagline');
  if (typedEl) {
    setTimeout(() => typeWriter(typedEl, typedEl.dataset.text || ''), 600);
  }
});