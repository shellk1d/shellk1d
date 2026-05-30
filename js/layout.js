// ── SHARED LAYOUT ──
// Inject navbar and footer into every page

const isSubdir = window.location.pathname.includes('/writeups-html/') || window.location.pathname.includes('/blog-html/');
const prefix = isSubdir ? '../' : '';

const NAV_HTML = `
<nav class="navbar">
  <a href="${prefix}index.html" class="nav-brand">
    <span class="prompt">shellk1d</span>:<span style="color:var(--red-300)">~</span>#<span class="cursor"></span>
  </a>
  <ul class="nav-links" id="navLinks">
    <li><a href="${prefix}writeups.html" data-page="writeups">WriteUps</a></li>
    <li><a href="${prefix}blog.html" data-page="blog">Blog</a></li>
    <li><a href="${prefix}tools.html" data-page="tools">Herramientas</a></li>
  </ul>
  <button class="nav-toggle" id="navToggle" aria-label="Menú">&#9776;</button>
</nav>
`;

const FOOTER_HTML = `
<footer>
  <p>
    <span class="footer-accent">[</span>
    <span data-profile="alias">shellk1d</span>
    <span class="footer-accent">]</span>
    &nbsp;·&nbsp; Todos los contenidos son de carácter educativo
    &nbsp;·&nbsp; <span class="footer-accent">~/</span> ${new Date().getFullYear()}
  </p>
</footer>
`;

// Inject on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.getElementById('pageWrapper');
  if (wrapper) {
    wrapper.insertAdjacentHTML('afterbegin', NAV_HTML);
    wrapper.insertAdjacentHTML('beforeend', FOOTER_HTML);
  }
});
