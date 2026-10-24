(function () {
  'use strict';

  // 푸터 연도
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 모바일 메뉴 토글
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('nav-menu');

  function closeMenu() {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '메뉴 열기');
  }

  toggle.addEventListener('click', function () {
    var open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  });

  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  // IntersectionObserver 미지원 시 등장 효과 없이 모두 표시
  if (!('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('js');

  // 스크롤 등장 효과
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(function (el, i) {
    el.style.transitionDelay = (i % 6) * 50 + 'ms';
    revealObserver.observe(el);
  });

  // 숫자 카운트업
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var duration = 900;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (!reduceMotion) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    document.querySelectorAll('[data-count]').forEach(function (el) {
      countObserver.observe(el);
    });
  }

  // 현재 섹션에 맞춰 내비게이션 활성화
  var navLinks = {};
  menu.querySelectorAll('a[href^="#"]:not(.btn)').forEach(function (a) {
    navLinks[a.getAttribute('href').slice(1)] = a;
  });

  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var link = navLinks[entry.target.id];
      if (!link || !entry.isIntersecting) return;
      Object.keys(navLinks).forEach(function (id) {
        navLinks[id].classList.remove('is-active');
      });
      link.classList.add('is-active');
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  Object.keys(navLinks).forEach(function (id) {
    var section = document.getElementById(id);
    if (section) sectionObserver.observe(section);
  });
})();
