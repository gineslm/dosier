(function () {
  'use strict';

  var mobileQuery = window.matchMedia('(max-width: 900px)');

  var menuToggle = document.querySelector('[data-menu-toggle]');
  var navIndex = document.querySelector('.nav-index');
  var navWrap = document.querySelector('[data-navwrap]');
  var topbar = document.querySelector('[data-topbar]');
  var sidebar = document.querySelector('.sidebar');

  var indexLinks = document.querySelectorAll('.nav-index__list a[href^="#"]');
  var topbarLinks = document.querySelectorAll('.topbar__list a[href^="#"]');

  // IDs de sección leídos del propio DOM (no en duro) para que sirva igual
  // en es/index.html (perfil/proyectos/...) y en index.html (profile/projects/...).
  var sectionIds = Array.prototype.map.call(indexLinks, function (a) {
    return a.getAttribute('href').slice(1);
  });
  var contactSection = document.querySelector('.contact-section');
  if (contactSection && contactSection.id) sectionIds.push(contactSection.id);
  var sections = sectionIds
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  var menuOpen = false;
  var openScrollY = 0;

  function isMobile() {
    return mobileQuery.matches;
  }

  function setMenu(open) {
    menuOpen = open;
    if (menuToggle) menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (navIndex) navIndex.classList.toggle('is-open', open);
  }

  function openMenu() {
    openScrollY = window.scrollY;
    setMenu(true);
  }

  function closeMenu() {
    if (menuOpen) setMenu(false);
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      if (menuOpen) closeMenu();
      else openMenu();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuOpen) {
      closeMenu();
      if (menuToggle) menuToggle.focus();
    }
  });

  [].concat([].slice.call(indexLinks), [].slice.call(topbarLinks)).forEach(function (a) {
    a.addEventListener('click', function () {
      if (isMobile()) closeMenu();
    });
  });

  function initMenuForViewport() {
    setMenu(!isMobile());
  }
  initMenuForViewport();
  mobileQuery.addEventListener('change', initMenuForViewport);

  // ---------- Sección activa ----------
  var activeId = sectionIds[0];

  function setActive(id) {
    if (id === activeId) return;
    activeId = id;
    indexLinks.forEach(function (a) {
      var match = a.getAttribute('href') === '#' + id;
      if (match) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    topbarLinks.forEach(function (a) {
      var match = a.getAttribute('href') === '#' + id;
      if (match) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  var intersecting = new Set();

  if ('IntersectionObserver' in window && sections.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) intersecting.add(entry.target.id);
        else intersecting.delete(entry.target.id);
      });

      var atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
      if (atBottom) {
        setActive(sectionIds[sectionIds.length - 1]);
        return;
      }

      var current = sectionIds.find(function (id) { return intersecting.has(id); });
      if (current) setActive(current);
    }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });

    sections.forEach(function (s) { observer.observe(s); });
  }

  // ---------- Barra fija ----------
  function updateTopbar() {
    if (!topbar || !navWrap) return;
    var show = isMobile() && navWrap.getBoundingClientRect().bottom < 0;
    topbar.classList.toggle('is-visible', show);
  }

  var scrollRaf = null;
  window.addEventListener('scroll', function () {
    if (scrollRaf) cancelAnimationFrame(scrollRaf);
    scrollRaf = requestAnimationFrame(function () {
      updateTopbar();
      if (menuOpen && isMobile() && Math.abs(window.scrollY - openScrollY) > 80) {
        closeMenu();
      }
      var atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
      if (atBottom) setActive(sectionIds[sectionIds.length - 1]);
    });
  }, { passive: true });

  updateTopbar();

  // ---------- Alto real del sidebar ----------
  // Refuerzo: en algunos entornos (escalados de pantalla poco habituales,
  // sesiones de escritorio remoto) 100vh no se calcula de forma fiable y el
  // sidebar (position: sticky) renderiza más alto que la ventana, con la
  // parte de abajo inaccesible. Se fija el alto real medido por JS en vez
  // de depender solo de la unidad vh; en móvil el CSS ya usa altura
  // automática, así que ahí se retira cualquier valor en línea.
  function syncSidebarHeight() {
    if (!sidebar) return;
    if (isMobile()) {
      sidebar.style.height = '';
      sidebar.style.maxHeight = '';
    } else {
      var h = window.innerHeight + 'px';
      sidebar.style.height = h;
      sidebar.style.maxHeight = h;
    }
  }
  syncSidebarHeight();
  window.addEventListener('resize', syncSidebarHeight);
  mobileQuery.addEventListener('change', syncSidebarHeight);

  // ---------- Transición al cambiar de idioma ----------
  var langLink = document.querySelector('.lang-switch a[href]');
  if (langLink) {
    langLink.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var href = langLink.href;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      e.preventDefault();
      document.body.classList.add('is-leaving');
      window.setTimeout(function () { window.location.href = href; }, 200);
    });
  }

  // ---------- Desvanecido de la barra fija al deslizar (móvil) ----------
  // Solo aparece a cada lado mientras de verdad haya contenido oculto ahí;
  // al llegar al principio o al final desaparece del todo (evita que se
  // quede tapando el último enlace para siempre, como con un degradado fijo).
  var topbarNav = document.querySelector('.topbar__nav');
  if (topbarNav) {
    var updateTopbarFade = function () {
      var atStart = topbarNav.scrollLeft <= 1;
      var atEnd = topbarNav.scrollLeft + topbarNav.clientWidth >= topbarNav.scrollWidth - 1;
      topbarNav.classList.toggle('can-scroll-left', !atStart);
      topbarNav.classList.toggle('can-scroll-right', !atEnd);
    };
    topbarNav.addEventListener('scroll', updateTopbarFade, { passive: true });
    window.addEventListener('resize', updateTopbarFade);
    updateTopbarFade();
  }
})();
