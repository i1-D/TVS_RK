(function () {
  'use strict';

  // ----- Carousel -----
  var track = document.querySelector('.carousel-track');
  var slides = document.querySelectorAll('.carousel-slide');
  var btnPrev = document.querySelector('.carousel-btn--prev');
  var btnNext = document.querySelector('.carousel-btn--next');
  var carousel = track ? track.closest('.carousel') : null;
  var dotsContainer = carousel && carousel.parentElement ? carousel.parentElement.querySelector('.carousel-dots') : null;
  var dots = dotsContainer ? dotsContainer.querySelectorAll('.carousel-dot') : [];
  var current = 1;
  var total = slides.length;
  var startIndex = dots.length ? 0 : 1;

  function setActive(index) {
    current = ((index % total) + total) % total;
    slides.forEach(function (slide, i) {
      slide.classList.remove('carousel-slide--active', 'carousel-slide--prev', 'carousel-slide--next');
      if (i === current) {
        slide.classList.add('carousel-slide--active');
      } else if (i < current) {
        slide.classList.add('carousel-slide--prev');
      } else {
        slide.classList.add('carousel-slide--next');
      }
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
      dot.setAttribute('aria-selected', i === current);
    });
  }

  if (track && slides.length) {
    setActive(startIndex);

    if (btnPrev) {
      btnPrev.addEventListener('click', function () {
        setActive(current - 1);
      });
    }
    if (btnNext) {
      btnNext.addEventListener('click', function () {
        setActive(current + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var idx = parseInt(dot.getAttribute('data-index'), 10);
        if (!isNaN(idx)) setActive(idx);
      });
    });

    slides.forEach(function (slide, i) {
      slide.addEventListener('click', function () {
        setActive(i);
      });
    });
  }

  // ----- Nav active state on scroll (optional) -----
  var navLinks = document.querySelectorAll('.nav-link');
  var sections = document.querySelectorAll('.hero, .services, .collection, .parts-section, .footer');

  function updateActiveNav() {
    var scrollY = window.scrollY || window.pageYOffset;
    var headerH = 80;
    var currentSection = '';

    sections.forEach(function (section) {
      var top = section.offsetTop - headerH;
      var height = section.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        currentSection = section.classList[0];
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      var text = link.textContent.trim().toLowerCase();
      if (currentSection === 'hero' && text === 'home') link.classList.add('active');
      if (currentSection === 'services' && text === 'services') link.classList.add('active');
      if ((currentSection === 'collection' || currentSection === 'parts-section') && text === 'spare parts') link.classList.add('active');
      if (currentSection === 'footer' && text === 'contact us') link.classList.add('active');
    });
  }

  if (navLinks.length && sections.length) {
    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav();
  }
})();
