(function () {
  'use strict';

  // 푸터 연도
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 한글 / 영문 전환
  // 한글은 HTML 본문 그대로, 영문은 data-en / data-en-aria-label / data-en-content 속성에 있음
  var STORAGE_KEY = 'lang';
  var currentLang = 'ko';
  var attrMap = { 'data-en-aria-label': 'aria-label', 'data-en-content': 'content' };

  var textEls = document.querySelectorAll('[data-en]');
  textEls.forEach(function (el) { el.dataset.ko = el.innerHTML; });

  Object.keys(attrMap).forEach(function (enAttr) {
    document.querySelectorAll('[' + enAttr + ']').forEach(function (el) {
      el.setAttribute('data-ko-' + attrMap[enAttr], el.getAttribute(attrMap[enAttr]));
    });
  });

  function setLang(lang) {
    currentLang = lang === 'en' ? 'en' : 'ko';
    var isEn = currentLang === 'en';
    document.documentElement.lang = currentLang;

    textEls.forEach(function (el) {
      el.innerHTML = isEn ? el.dataset.en : el.dataset.ko;
    });

    Object.keys(attrMap).forEach(function (enAttr) {
      var attr = attrMap[enAttr];
      document.querySelectorAll('[' + enAttr + ']').forEach(function (el) {
        el.setAttribute(attr, isEn ? el.getAttribute(enAttr) : el.getAttribute('data-ko-' + attr));
      });
    });

    document.querySelectorAll('.lang-switch [data-lang]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.lang === currentLang));
    });

    updateToggleLabel();
  }

  // 우선순위: 주소의 ?lang=en > 이전에 고른 언어 > 브라우저 언어
  function initialLang() {
    var param = new URLSearchParams(location.search).get('lang');
    if (param === 'ko' || param === 'en') return param;
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'ko' || saved === 'en') return saved;
    } catch (e) {}
    return (navigator.language || 'ko').toLowerCase().indexOf('ko') === 0 ? 'ko' : 'en';
  }

  document.querySelectorAll('.lang-switch [data-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setLang(btn.dataset.lang);
      try { localStorage.setItem(STORAGE_KEY, currentLang); } catch (e) {}
    });
  });

  // 모바일 메뉴 토글
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('nav-menu');

  function updateToggleLabel() {
    var open = menu.classList.contains('is-open');
    var labels = currentLang === 'en' ? ['Open menu', 'Close menu'] : ['메뉴 열기', '메뉴 닫기'];
    toggle.setAttribute('aria-label', open ? labels[1] : labels[0]);
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    updateToggleLabel();
  }

  toggle.addEventListener('click', function () {
    var open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    updateToggleLabel();
  });

  setLang(initialLang());

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
