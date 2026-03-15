/* ═══════════════════════════════════════════════════════════════
   ANCALAGON ROBOTICS — MAIN SCRIPT
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── CURSOR GLOW ────────────────────────────────────────────── */
(function initCursorGlow() {
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  let cx = window.innerWidth / 2;
  let cy = window.innerHeight / 2;
  let tx = cx, ty = cy;
  let raf;

  document.addEventListener('mousemove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
  });

  function animate() {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    glow.style.left = cx + 'px';
    glow.style.top = cy + 'px';
    raf = requestAnimationFrame(animate);
  }
  animate();
})();

/* ─── NAVBAR SCROLL ──────────────────────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Mobile menu links close menu on click
  document.querySelectorAll('.mob-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();

/* ─── SCROLL REVEAL ──────────────────────────────────────────── */
(function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  reveals.forEach(el => observer.observe(el));
})();

/* ─── COUNTER ANIMATION ──────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');

  function animateCounter(el, target) {
    const duration = 1800;
    const start = performance.now();
    const easeOut = t => 1 - Math.pow(1 - t, 3);

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(easeOut(progress) * target);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.dataset.target, 10);
          animateCounter(entry.target, target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
})();

/* ─── LAB CARDS DRAG SCROLL ──────────────────────────────────── */
(function initDragScroll() {
  const track = document.querySelector('.lab-scroll-track');
  if (!track) return;

  let isDown = false;
  let startX, scrollLeft;

  track.addEventListener('mousedown', (e) => {
    isDown = true;
    track.classList.add('grabbing');
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });

  track.addEventListener('mouseleave', () => {
    isDown = false;
    track.classList.remove('grabbing');
  });

  track.addEventListener('mouseup', () => {
    isDown = false;
    track.classList.remove('grabbing');
  });

  track.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.2;
    track.scrollLeft = scrollLeft - walk;
  });

  // Touch scroll (mobile)
  let touchStartX, touchScrollLeft;
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].pageX;
    touchScrollLeft = track.scrollLeft;
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    const x = e.touches[0].pageX;
    const walk = (touchStartX - x) * 1.2;
    track.scrollLeft = touchScrollLeft + walk;
  }, { passive: true });
})();

/* ─── VIDEO MODAL ────────────────────────────────────────────── */
function openVideoModal(e) {
  e.preventDefault();
  const modal = document.getElementById('video-modal');
  const video = document.getElementById('modal-video');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  video.play().catch(() => {});
}

function closeVideoModal() {
  const modal = document.getElementById('video-modal');
  const video = document.getElementById('modal-video');
  modal.classList.remove('active');
  document.body.style.overflow = '';
  video.pause();
  video.currentTime = 0;
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeVideoModal();
});

/* ─── NEWSLETTER ─────────────────────────────────────────────── */
function handleNewsletter(e) {
  e.preventDefault();
  const input = document.getElementById('email-input');
  const msg = document.getElementById('newsletter-msg');
  const email = input.value.trim();

  if (!email) return;

  // Simulate submission
  const btn = e.target.querySelector('.newsletter-btn');
  btn.textContent = 'Submitting...';
  btn.disabled = true;

  setTimeout(() => {
    input.value = '';
    btn.textContent = 'Sign Up';
    btn.disabled = false;
    msg.style.display = 'block';
    msg.textContent = '✓ You\'re on the list. We\'ll be in touch.';
    setTimeout(() => { msg.style.display = 'none'; }, 5000);
  }, 900);
}

/* ─── SMOOTH ANCHOR SCROLL ───────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 72;
      const targetY = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  });
});

/* ─── PARALLAX HERO ──────────────────────────────────────────── */
(function initParallax() {
  const heroVideo = document.querySelector('.hero-video');
  if (!heroVideo) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroHeight = document.getElementById('hero').offsetHeight;
    if (scrollY < heroHeight) {
      heroVideo.style.transform = `translateY(${scrollY * 0.25}px)`;
    }
  }, { passive: true });
})();

/* ─── ACTIVE NAV LINK ON SCROLL ─────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.style.color = href === `#${id}` ? 'var(--text-primary)' : '';
          });
        }
      });
    },
    { threshold: 0.35 }
  );

  sections.forEach(s => observer.observe(s));
})();
