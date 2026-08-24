document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  const header = document.getElementById('siteHeader');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const navItems = Array.from(document.querySelectorAll('.nav-link'));
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  const parallaxEls = Array.from(document.querySelectorAll('[data-parallax]'));
  const processSection = document.getElementById('process');
  const processSteps = Array.from(document.querySelectorAll('[data-step]'));
  const form = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const closeNav = () => {
    if (!navLinks || !navToggle) return;
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (link) closeNav();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeNav();
    });
  }

  const setActiveLink = (sectionId) => {
    navItems.forEach((link) => {
      const match = link.getAttribute('href') === `#${sectionId}`;
      link.classList.toggle('active', match);
      if (match) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const updateHeaderState = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 12);
  };

  const updateActiveSection = () => {
    if (!sections.length) return;
    const anchorLine = window.scrollY + (header ? header.offsetHeight : 0) + Math.round(window.innerHeight * 0.2);
    let activeId = sections[0].id;

    sections.forEach((section) => {
      if (section.offsetTop <= anchorLine) {
        activeId = section.id;
      }
    });

    setActiveLink(activeId);
  };

  let parallaxFrame = 0;
  const updateParallax = () => {
    if (reduceMotion.matches) return;
    const scrollY = window.scrollY;
    parallaxEls.forEach((element) => {
      const factor = Number.parseFloat(element.dataset.parallax || '0');
      if (!Number.isFinite(factor) || factor === 0) return;
      element.style.setProperty('--parallax-y', `${Math.round(scrollY * factor)}px`);
    });
  };

  const scheduleScrollUpdate = () => {
    if (parallaxFrame) return;
    parallaxFrame = window.requestAnimationFrame(() => {
      updateHeaderState();
      updateActiveSection();
      updateParallax();
      parallaxFrame = 0;
    });
  };

  window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
  window.addEventListener('resize', scheduleScrollUpdate);
  updateHeaderState();
  updateActiveSection();
  updateParallax();

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });

    revealEls.forEach((element) => revealObserver.observe(element));

    let processActivated = false;
    if (processSection && processSteps.length) {
      const processObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !processActivated) {
            processActivated = true;
            processSteps.forEach((step, index) => {
              window.setTimeout(() => step.classList.add('is-active'), index * 140);
            });
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.35 });

      processObserver.observe(processSection);
    }
  } else {
    revealEls.forEach((element) => element.classList.add('is-visible'));
    updateActiveSection();
    processSteps.forEach((step) => step.classList.add('is-active'));
  }

  if (reduceMotion.matches) {
    revealEls.forEach((element) => element.classList.add('is-visible'));
    parallaxEls.forEach((element) => {
      element.style.setProperty('--parallax-y', '0px');
    });
    processSteps.forEach((step) => step.classList.add('is-active'));
  }

  if (form && formNote) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const email = String(data.get('email') || '').trim();
      const projectType = String(data.get('projectType') || '').trim();
      const timeline = String(data.get('timeline') || '').trim();
      const location = String(data.get('location') || '').trim();
      const budget = String(data.get('budget') || '').trim();
      const message = String(data.get('message') || '').trim();

      const subject = `Project brief from ${name || 'a new contact'}`;
      const body = [
        'Good Az Gold Productions project brief',
        '',
        `Name: ${name}`,
        `Email: ${email}`,
        `Project Type: ${projectType}`,
        `Timeline: ${timeline}`,
        `Location: ${location}`,
        `Budget Range: ${budget}`,
        '',
        'Message:',
        message,
        '',
        'Please reply to contact@goodazgoldproductions.com.'
      ].join('\n');

      const mailto = `mailto:contact@goodazgoldproductions.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      formNote.textContent = 'Your email application is opening. If it does not, use contact@goodazgoldproductions.com directly.';
      window.location.href = mailto;
    });
  }
});
