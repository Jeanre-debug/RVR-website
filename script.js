/* ═══════════════════════════════════════════════════════════════════════════
   RVR BUILDING PROJECTS — World-Class JavaScript
   Features: Preloader · Scroll Progress · Nav Spy · Ken Burns · Marquee ·
             Portfolio Filters · Lightbox · Testimonials Slider · Scroll
             Reveal · Counter Animation · Contact Form · Mobile CTA
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ─── Utility helpers ─────────────────────────────────────────────────────── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ═══════════════════════════════════════════════════════════════════════════
   1. PRELOADER
   ═══════════════════════════════════════════════════════════════════════════ */
(function initPreloader() {
  const preloader   = qs('#preloader');
  const progressBar = qs('#preloaderBar');
  const hero        = qs('#hero');

  if (!preloader) return;

  // Prevent scroll during preload
  document.body.style.overflow = 'hidden';

  // Trigger bar fill after a brief delay (let CSS transitions settle)
  let fillStart;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // Small delay for the bar track to fade in (CSS 0.75s delay)
      fillStart = setTimeout(() => {
        progressBar.style.width = '100%';
      }, 100);
    });
  });

  // Total preloader time: ~0.6 seconds
  // Bar fills 0.25s → slide-up starts at ~0.4s
  const slideUpDelay = 400;

  setTimeout(() => {
    preloader.classList.add('slide-up');

    // After slide-up transition (0.7s), hide preloader and reveal hero content
    preloader.addEventListener('transitionend', () => {
      preloader.style.display = 'none';
      preloader.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      // Trigger hero content reveal
      if (hero) {
        requestAnimationFrame(() => {
          hero.classList.add('hero--loaded');
        });
      }
    }, { once: true });

    // Restore scroll even if transition doesn't fire
    setTimeout(() => {
      document.body.style.overflow = '';
      if (hero) hero.classList.add('hero--loaded');
    }, 350);

  }, slideUpDelay);

  // Cleanup
  if (fillStart) clearTimeout(fillStart);
})();


/* ═══════════════════════════════════════════════════════════════════════════
   2. SCROLL PROGRESS BAR
   ═══════════════════════════════════════════════════════════════════════════ */
(function initScrollProgress() {
  const bar = qs('#scrollProgress');
  if (!bar) return;

  function updateProgress() {
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled   = window.scrollY;
    const pct        = docHeight > 0 ? (scrolled / docHeight) * 100 : 0;
    bar.style.width  = pct.toFixed(2) + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
})();


/* ═══════════════════════════════════════════════════════════════════════════
   3. NAVIGATION — Scroll shadow, scroll spy, mobile menu
   ═══════════════════════════════════════════════════════════════════════════ */
(function initNavigation() {
  const nav      = qs('#nav');
  const burger   = qs('#burger');
  const navLinks = qs('#navLinks');
  if (!nav) return;

  /* ── Scroll shadow ────────────────────────────────────────────────────── */
  function onNavScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();

  /* ── Scroll Spy ───────────────────────────────────────────────────────── */
  const sections    = qsa('section[id]');
  const navAnchors  = qsa('.nav__links li a[data-nav]');
  const navHeight   = () => parseInt(getComputedStyle(document.documentElement)
                              .getPropertyValue('--nav-h')) || 76;

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navAnchors.forEach(a => {
          a.classList.toggle('active', a.dataset.nav === id);
        });
      }
    });
  }, {
    rootMargin: `-${navHeight()}px 0px -60% 0px`,
    threshold: 0
  });

  sections.forEach(s => spyObserver.observe(s));

  /* ── Mobile burger ────────────────────────────────────────────────────── */
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const isOpen = burger.classList.toggle('open');
      navLinks.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && navLinks.classList.contains('open')) {
        closeMenu();
      }
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) closeMenu();
    });
  }

  function closeMenu() {
    burger.classList.remove('open');
    navLinks.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  /* ── Smooth anchor scroll (offset for fixed nav) ─────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = qs(targetId);
      if (!target) return;
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - navHeight();
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });
})();


/* ═══════════════════════════════════════════════════════════════════════════
   4. BACK TO TOP
   ═══════════════════════════════════════════════════════════════════════════ */
(function initBackToTop() {
  const btn = qs('#backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ═══════════════════════════════════════════════════════════════════════════
   5. PORTFOLIO FILTERS + LIGHTBOX
   ═══════════════════════════════════════════════════════════════════════════ */
(function initPortfolio() {
  const filterBtns     = qsa('.filter-btn');
  const portfolioItems = qsa('.portfolio-item');

  /* ── Filters ──────────────────────────────────────────────────────────── */
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      let delay = 0;

      portfolioItems.forEach(item => {
        const show = filter === 'all' || item.dataset.category === filter;
        if (show) {
          item.classList.remove('hidden');
          item.style.animation = 'none';
          requestAnimationFrame(() => {
            item.style.animation = `portfolioFadeIn 0.4s var(--ease-out) ${delay}ms both`;
          });
          delay += 80;
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  /* ── Lightbox ─────────────────────────────────────────────────────────── */
  const lightbox         = qs('#lightbox');
  const lightboxImg      = qs('#lightboxImg');
  const lightboxTag      = qs('#lightboxTag');
  const lightboxCounter  = qs('#lightboxCounter');
  const lightboxTitle    = qs('#lightboxTitle');
  const lightboxDesc     = qs('#lightboxDesc');
  const lightboxClose    = qs('#lightboxClose');
  const lightboxPrev     = qs('#lightboxPrev');
  const lightboxNext     = qs('#lightboxNext');
  const lightboxBackdrop = qs('#lightboxBackdrop');

  if (!lightbox) return;

  // Gallery state for the currently open project
  let gallery = [];
  let galleryMeta = {};
  let currentIndex = 0;

  function buildGallery(item) {
    const raw = item.dataset.images;
    gallery = raw ? raw.split(',').map(s => s.trim()) : [item.dataset.image];
    galleryMeta = {
      tag:   item.dataset.tag   || '',
      title: item.dataset.title || '',
      desc:  (item.dataset.desc || '').replace(/&amp;/g, '&'),
    };
  }

  function updateUI() {
    const multi = gallery.length > 1;
    lightboxPrev.style.display    = multi ? '' : 'none';
    lightboxNext.style.display    = multi ? '' : 'none';
    lightboxCounter.textContent   = multi ? `${currentIndex + 1} / ${gallery.length}` : '';
    lightboxTag.textContent       = galleryMeta.tag;
    lightboxTitle.textContent     = galleryMeta.title;
    lightboxDesc.textContent      = galleryMeta.desc;
  }

  function loadImage(index) {
    const src = gallery[index];
    if (!src) return;
    lightboxImg.classList.add('loading');
    updateUI();
    const img = new Image();
    img.onload = () => {
      lightboxImg.src = src;
      lightboxImg.alt = galleryMeta.title;
      requestAnimationFrame(() => lightboxImg.classList.remove('loading'));
    };
    img.onerror = () => {
      lightboxImg.src = src;
      lightboxImg.classList.remove('loading');
    };
    img.src = src;
  }

  function openLightbox(item) {
    buildGallery(item);
    currentIndex = 0;
    loadImage(0);
    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => requestAnimationFrame(() => lightbox.classList.add('active')));
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.addEventListener('transitionend', () => {
      lightbox.setAttribute('hidden', '');
      document.body.style.overflow = '';
    }, { once: true });
    setTimeout(() => {
      if (lightbox.classList.contains('active')) return;
      lightbox.setAttribute('hidden', '');
      document.body.style.overflow = '';
    }, 400);
  }

  function prev() {
    currentIndex = (currentIndex - 1 + gallery.length) % gallery.length;
    loadImage(currentIndex);
  }

  function next() {
    currentIndex = (currentIndex + 1) % gallery.length;
    loadImage(currentIndex);
  }

  // Open on click or Enter/Space
  portfolioItems.forEach(item => {
    const trigger = () => openLightbox(item);
    item.addEventListener('click', trigger);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); trigger(); }
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxBackdrop.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', prev);
  lightboxNext.addEventListener('click', next);

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });

  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) delta < 0 ? next() : prev();
  }, { passive: true });
})();


/* ═══════════════════════════════════════════════════════════════════════════
   6. TESTIMONIALS SLIDER
   ═══════════════════════════════════════════════════════════════════════════ */
(function initTestimonialsSlider() {
  const track    = qs('#testimonialsTrack');
  const dotsWrap = qs('#tDots');
  const prevBtn  = qs('#tPrev');
  const nextBtn  = qs('#tNext');
  const slider   = qs('#testimonialsSlider');

  if (!track || !dotsWrap) return;

  const cards        = qsa('.testimonial-card', track);
  const totalCards   = cards.length;
  let currentSlide   = 0;
  let autoTimer      = null;
  let isHovered      = false;

  // Determine cards visible based on viewport
  function getVisible() {
    return window.innerWidth <= 768 ? 1 : 2;
  }

  function getTotalSlides() {
    return totalCards - getVisible() + 1;
  }

  // Build dots
  function buildDots() {
    dotsWrap.innerHTML = '';
    const total = getTotalSlides();
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'testimonials__dot' + (i === currentSlide ? ' active' : '');
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-selected', String(i === currentSlide));
      dot.addEventListener('click', () => goToSlide(i));
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    qsa('.testimonials__dot', dotsWrap).forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
      dot.setAttribute('aria-selected', String(i === currentSlide));
    });
  }

  function goToSlide(index) {
    const total = getTotalSlides();
    currentSlide = ((index % total) + total) % total;

    // Calculate card width including gap
    const cardEl  = cards[0];
    const gap     = 24;
    const cardW   = cardEl.getBoundingClientRect().width;
    const offset  = currentSlide * (cardW + gap);

    track.style.transform = `translateX(-${offset}px)`;
    updateDots();
  }

  function next() {
    const total = getTotalSlides();
    goToSlide((currentSlide + 1) % total);
  }

  function prev() {
    const total = getTotalSlides();
    goToSlide((currentSlide - 1 + total) % total);
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => {
      if (!isHovered) next();
    }, 5000);
  }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  // Event listeners
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAuto(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAuto(); });

  // Pause on hover
  if (slider) {
    slider.addEventListener('mouseenter', () => { isHovered = true; });
    slider.addEventListener('mouseleave', () => { isHovered = false; });
  }

  // Touch swipe for slider
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) {
      delta < 0 ? next() : prev();
      startAuto();
    }
  }, { passive: true });

  // Keyboard
  if (slider) {
    slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { prev(); startAuto(); }
      if (e.key === 'ArrowRight') { next(); startAuto(); }
    });
  }

  // Rebuild on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      currentSlide = 0;
      buildDots();
      goToSlide(0);
    }, 200);
  });

  // Init
  buildDots();
  goToSlide(0);
  startAuto();
})();


/* ═══════════════════════════════════════════════════════════════════════════
   7. SCROLL REVEAL ANIMATIONS
   ═══════════════════════════════════════════════════════════════════════════ */
(function initScrollReveal() {
  // Single-element fade-in
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -44px 0px' });

  // Stagger children
  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        Array.from(entry.target.children).forEach((child, i) => {
          setTimeout(() => child.classList.add('visible'), i * 110);
        });
        staggerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  // Auto-apply to key elements that aren't already marked
  const autoReveal = [
    '.section-label',
    '.section-heading',
    '.section-sub',
    '.service-card',
    '.why-card',
    '.testimonial-card',
    '.portfolio-item',
    '.about__content p',
    '.about__content .btn',
    '.contact-detail',
  ];

  autoReveal.forEach(sel => {
    qsa(sel).forEach(el => {
      if (!el.classList.contains('fade-in') && !el.closest('.fade-in-stagger')) {
        el.classList.add('fade-in');
      }
    });
  });

  // Observe all .fade-in
  qsa('.fade-in').forEach(el => revealObserver.observe(el));

  // Observe all .fade-in-stagger containers
  qsa('.fade-in-stagger').forEach(el => staggerObserver.observe(el));
})();


/* ═══════════════════════════════════════════════════════════════════════════
   8. ANIMATED STAT COUNTERS
   ═══════════════════════════════════════════════════════════════════════════ */
(function initCounters() {
  function animateCounter(el, target, suffix) {
    const duration  = 1800;
    const startTime = performance.now();

    function update(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const value    = Math.round(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const nums = entry.target.querySelectorAll('.stat__num[data-target]');
        nums.forEach(el => {
          const target = parseFloat(el.dataset.target);
          const suffix = el.dataset.suffix || '';
          if (!isNaN(target)) animateCounter(el, target, suffix);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statsSection = qs('.about__stats');
  if (statsSection) statsObserver.observe(statsSection);
})();


/* ═══════════════════════════════════════════════════════════════════════════
   9. CONTACT FORM
   ═══════════════════════════════════════════════════════════════════════════ */
(function initContactForm() {
  const form       = qs('#contactForm');
  const successMsg = qs('#formSuccess');
  const submitBtn  = qs('#formSubmit');

  if (!form) return;

  const submitOriginalHTML = submitBtn.innerHTML;

  // Real-time validation feedback
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => {
      if (field.style.borderColor === 'rgb(204, 0, 0)') {
        field.style.borderColor = '';
        field.style.boxShadow   = '';
      }
    });
    field.addEventListener('blur', () => {
      if (field.hasAttribute('required') && !field.value.trim()) {
        field.style.borderColor = 'rgba(204,0,0,0.7)';
        field.style.boxShadow   = '0 0 0 3px rgba(204,0,0,0.1)';
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = form.querySelectorAll('[required]');
    let valid = true;

    requiredFields.forEach(field => {
      field.style.borderColor = '';
      field.style.boxShadow   = '';
      if (!field.value.trim()) {
        field.style.borderColor = 'rgba(204,0,0,0.7)';
        field.style.boxShadow   = '0 0 0 3px rgba(204,0,0,0.1)';
        valid = false;
      }
    });

    // Email format check
    const emailField = qs('#email');
    if (emailField && emailField.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
      emailField.style.borderColor = 'rgba(204,0,0,0.7)';
      emailField.style.boxShadow   = '0 0 0 3px rgba(204,0,0,0.1)';
      valid = false;
    }

    if (!valid) return;

    // Loading state
    submitBtn.textContent   = 'Sending…';
    submitBtn.disabled      = true;
    submitBtn.style.opacity = '0.7';

    // Submit to Netlify Forms
    fetch('/', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams(new FormData(form)).toString(),
    })
      .then(() => {
        submitBtn.style.display = 'none';
        successMsg.removeAttribute('hidden');
        form.reset();

        setTimeout(() => {
          submitBtn.style.display = '';
          submitBtn.innerHTML     = submitOriginalHTML;
          submitBtn.disabled      = false;
          submitBtn.style.opacity = '';
          successMsg.setAttribute('hidden', '');
        }, 8000);
      })
      .catch(() => {
        submitBtn.innerHTML     = submitOriginalHTML;
        submitBtn.disabled      = false;
        submitBtn.style.opacity = '';
      });
  });
})();


/* ═══════════════════════════════════════════════════════════════════════════
   10. MOBILE FLOATING CTA BAR
        — Hides after clicking "Get a Quote" link
        — Reappears when user scrolls UP
   ═══════════════════════════════════════════════════════════════════════════ */
(function initMobileCta() {
  const bar = qs('#mobileCta');
  if (!bar) return;

  // Only active on mobile
  const mq = window.matchMedia('(max-width: 768px)');
  if (!mq.matches) return;

  let lastScrollY      = window.scrollY;
  let isHidden         = false;
  let scrollTimer      = null;

  function handleScroll() {
    const current = window.scrollY;
    const diff    = current - lastScrollY;

    // Scrolling DOWN and past 200px — keep visible
    if (diff > 4 && current > 200 && !isHidden) {
      // keep visible on scroll down (don't hide)
    }

    // Scrolling UP — ensure visible
    if (diff < -4 && isHidden) {
      bar.classList.remove('hidden');
      isHidden = false;
    }

    lastScrollY = current;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  // Hide when quote button is clicked (user is going to contact section)
  const quoteBtn = bar.querySelector('.mobile-cta__btn--quote');
  if (quoteBtn) {
    quoteBtn.addEventListener('click', () => {
      setTimeout(() => {
        bar.classList.add('hidden');
        isHidden = true;

        // Reappear after 5s
        setTimeout(() => {
          bar.classList.remove('hidden');
          isHidden = false;
        }, 5000);
      }, 300);
    });
  }
})();


/* ═══════════════════════════════════════════════════════════════════════════
   11. MARQUEE — duplicate content for seamless loop
   ═══════════════════════════════════════════════════════════════════════════ */
(function initMarquee() {
  const track = qs('.marquee-track');
  if (!track) return;

  // The CSS animation handles the loop via -50% translate on a doubled string.
  // We verify the content node exists and duplicate it for seamless scroll.
  const content = qs('.marquee-content', track);
  if (!content) return;

  // Clone for continuous seamless scroll
  const clone = content.cloneNode(true);
  track.appendChild(clone);
})();


/* ═══════════════════════════════════════════════════════════════════════════
   12. PORTFOLIO — show overlays on mobile (always visible)
   ═══════════════════════════════════════════════════════════════════════════ */
(function initPortfolioMobile() {
  if (!window.matchMedia('(max-width: 768px)').matches) return;

  qsa('.portfolio-item__overlay').forEach(overlay => {
    overlay.style.opacity = '1';
    const children = overlay.children;
    Array.from(children).forEach(child => {
      child.style.transform = 'translateY(0)';
      child.style.opacity   = '1';
    });
  });
})();


/* ═══════════════════════════════════════════════════════════════════════════
   13. REDUCED MOTION — respect prefers-reduced-motion
   ═══════════════════════════════════════════════════════════════════════════ */
(function respectReducedMotion() {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Immediately show all fade-in elements
  qsa('.fade-in').forEach(el => el.classList.add('visible'));
  qsa('.fade-in-stagger > *').forEach(el => el.classList.add('visible'));
  qsa('.reveal-up').forEach(el => {
    el.style.opacity   = '1';
    el.style.transform = 'none';
    el.style.transition = 'none';
  });

  // Stop Ken Burns
  const heroBg = qs('.hero__bg-img');
  if (heroBg) heroBg.style.animation = 'none';

  // Stop marquee
  const marqueeTrack = qs('.marquee-track');
  if (marqueeTrack) marqueeTrack.style.animation = 'none';
})();


/* ═══════════════════════════════════════════════════════════════════════════
   14. CUSTOM CURSOR
   ═══════════════════════════════════════════════════════════════════════════ */
(function initCustomCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const dot  = qs('#cursorDot');
  const ring = qs('#cursorRing');
  if (!dot || !ring) return;

  document.body.classList.add('has-custom-cursor');

  let mouseX = -100, mouseY = -100;
  let ringX  = -100, ringY  = -100;
  let started = false;

  const hoverSel = 'a, button, [role="button"], .filter-btn, .portfolio-item, .service-card, .back-to-top, label, select, .testimonials__arrow, .lightbox__arrow, .lightbox__close, .why-card, .cert';
  const textSel  = 'p, h1, h2, h3, h4, li, blockquote';

  function setDot(x, y) {
    dot.style.left = x + 'px';
    dot.style.top  = y + 'px';
  }

  function animateRing() {
    ringX += (mouseX - ringX) * 0.13;
    ringY += (mouseY - ringY) * 0.13;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    setDot(mouseX, mouseY);
    if (!started) {
      started = true;
      ringX = mouseX; ringY = mouseY;
      dot.classList.add('visible');
      ring.classList.add('visible');
      animateRing();
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    dot.classList.remove('visible');
    ring.classList.remove('visible');
  });
  document.addEventListener('mouseenter', () => {
    if (started) { dot.classList.add('visible'); ring.classList.add('visible'); }
  });

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverSel)) {
      document.body.classList.add('cursor-hover');
      document.body.classList.remove('cursor-text');
    } else if (e.target.closest(textSel)) {
      document.body.classList.remove('cursor-hover');
      document.body.classList.add('cursor-text');
    } else {
      document.body.classList.remove('cursor-hover', 'cursor-text');
    }
  }, { passive: true });

  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));
})();


/* ═══════════════════════════════════════════════════════════════════════════
   15. 3D CARD TILT — service cards
   ═══════════════════════════════════════════════════════════════════════════ */
(function initCardTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  qsa('.service-card').forEach(card => {
    // Inject shine layer
    const shine = document.createElement('div');
    shine.className = 'card-shine';
    card.appendChild(shine);

    card.addEventListener('mousemove', (e) => {
      const r  = card.getBoundingClientRect();
      const x  = e.clientX - r.left;
      const y  = e.clientY - r.top;
      const cx = r.width  / 2;
      const cy = r.height / 2;
      const rX = ((y - cy) / cy) * -9;
      const rY = ((x - cx) / cx) *  9;

      card.style.transition = 'box-shadow var(--transition), border-color var(--transition)';
      card.style.transform  = `perspective(900px) rotateX(${rX}deg) rotateY(${rY}deg) translateZ(12px)`;
      shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.12) 0%, transparent 65%)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.65s var(--ease-spring), box-shadow var(--transition), border-color var(--transition)';
      card.style.transform  = '';
      shine.style.background = 'transparent';
    });
  });
})();


/* ═══════════════════════════════════════════════════════════════════════════
   16. MAGNETIC BUTTONS
   ═══════════════════════════════════════════════════════════════════════════ */
(function initMagneticButtons() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  qsa('.magnetic-btn, .btn--red, .nav__cta').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r  = btn.getBoundingClientRect();
      const x  = (e.clientX - r.left - r.width  / 2) * 0.22;
      const y  = (e.clientY - r.top  - r.height / 2) * 0.22;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();


/* ═══════════════════════════════════════════════════════════════════════════
   17. CURSOR SPOTLIGHT — ambient glow on dark sections
   ═══════════════════════════════════════════════════════════════════════════ */
(function initCursorSpotlight() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  qsa('.why, .contact').forEach(section => {
    section.addEventListener('mousemove', (e) => {
      const r = section.getBoundingClientRect();
      section.style.setProperty('--spot-x', (e.clientX - r.left) + 'px');
      section.style.setProperty('--spot-y', (e.clientY - r.top)  + 'px');
    }, { passive: true });
  });
})();


/* ═══════════════════════════════════════════════════════════════════════════
   18. SPLIT TEXT — section headings animate word by word
   ═══════════════════════════════════════════════════════════════════════════ */
(function initSplitText() {
  const targets = qsa(
    '.about .section-heading, .services .section-heading, ' +
    '.portfolio .section-heading, .why .section-heading, ' +
    '.testimonials .section-heading, .cta-strip__heading'
  );

  targets.forEach(el => {
    // Remove any existing fade-in class (we handle it ourselves)
    el.classList.remove('fade-in');

    // Split innerHTML preserving <br> tags
    const parts = el.innerHTML.split(/(<br\s*\/?>)/gi);
    el.innerHTML = parts.map(part => {
      if (/<br/i.test(part)) return part;
      return part.trim().split(/\s+/).filter(Boolean)
        .map(w => `<span class="split-word"><span class="split-word-inner">${w}</span></span>`)
        .join(' ');
    }).join('');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          el.classList.add('split-visible');
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.25 });

    observer.observe(el);
  });
})();


/* ═══════════════════════════════════════════════════════════════════════════
   19. CTA STRIP — trigger background scale-in on scroll
   ═══════════════════════════════════════════════════════════════════════════ */
(function initCtaStrip() {
  const strip = qs('.cta-strip');
  if (!strip) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        strip.classList.add('in-view');
        observer.unobserve(strip);
      }
    });
  }, { threshold: 0.15 });

  observer.observe(strip);
})();


/* ═══════════════════════════════════════════════════════════════════════════
   14. CUSTOM CURSOR
   ═══════════════════════════════════════════════════════════════════════════ */
(function initCustomCursor() {
  // Skip on touch/coarse pointer devices
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const dot  = qs('#cursorDot');
  const ring = qs('#cursorRing');
  if (!dot || !ring) return;

  // Activate custom cursor on the page
  document.body.classList.add('has-custom-cursor');

  let mouseX = -100, mouseY = -100;
  let ringX  = -100, ringY  = -100;
  let rafId  = null;

  // Elements that trigger the hover state
  const hoverSelector = 'a, button, [role="button"], .filter-btn, .portfolio-item, .service-card, .back-to-top, .nav__cta, label, select, .testimonials__arrow, .lightbox__arrow, .lightbox__close';
  // Elements that trigger the text state
  const textSelector  = 'p, h1, h2, h3, h4, li, blockquote, span:not(.marquee-sep):not(.hero__badge-dot), .section-label, .section-sub';

  function setDotPosition(x, y) {
    dot.style.left = x + 'px';
    dot.style.top  = y + 'px';
  }

  function animateRing() {
    // Ring lags behind — lerp toward mouse
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;

    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';

    rafId = requestAnimationFrame(animateRing);
  }

  // On first mouse move, show cursors and start loop
  let started = false;
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    setDotPosition(mouseX, mouseY);

    if (!started) {
      started = true;
      dot.classList.add('visible');
      ring.classList.add('visible');
      ringX = mouseX;
      ringY = mouseY;
      animateRing();
    }
  }, { passive: true });

  // Hide when leaving window
  document.addEventListener('mouseleave', () => {
    dot.classList.remove('visible');
    ring.classList.remove('visible');
  });
  document.addEventListener('mouseenter', () => {
    if (started) {
      dot.classList.add('visible');
      ring.classList.add('visible');
    }
  });

  // Hover state
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest(hoverSelector);
    if (target) {
      document.body.classList.add('cursor-hover');
      document.body.classList.remove('cursor-text');
    } else {
      document.body.classList.remove('cursor-hover');
    }
  }, { passive: true });

  // Text state
  document.addEventListener('mouseover', (e) => {
    if (document.body.classList.contains('cursor-hover')) return;
    const target = e.target.closest(textSelector);
    if (target) {
      document.body.classList.add('cursor-text');
    } else {
      document.body.classList.remove('cursor-text');
    }
  }, { passive: true });

  // Click state
  document.addEventListener('mousedown', () => {
    document.body.classList.add('cursor-click');
  });
  document.addEventListener('mouseup', () => {
    document.body.classList.remove('cursor-click');
  });
})();
