
(function () {
  'use strict';


  // ----- Collection slider (scroll-snap) -----
  var collectionCarousel = document.querySelector('.carousel--collection');
  var viewport = collectionCarousel ? collectionCarousel.querySelector('.carousel-viewport') : null;
  var collectionSlides = collectionCarousel ? collectionCarousel.querySelectorAll('.carousel-slide') : [];
  var btnPrev = document.querySelector('.carousel--collection .carousel-btn--prev');
  var btnNext = document.querySelector('.carousel--collection .carousel-btn--next');

  function getSlideWidth(slide) {
    if (!slide) return 220;
    var style = window.getComputedStyle(slide);
    var width = parseFloat(style.width) || 220;
    var gap = 20;
    var track = slide.closest('.carousel-track');
    if (track) {
      var trackStyle = window.getComputedStyle(track);
      gap = parseFloat(trackStyle.gap) || 20;
    }
    return width + gap;
  }

  function scrollCollection(direction) {
    if (!viewport || !collectionSlides.length) return;
    var step = getSlideWidth(collectionSlides[0]);
    viewport.scrollBy({ left: direction * step, behavior: 'smooth' });
  }

  function updateCollectionActiveFromScroll() {
    if (!viewport || !collectionSlides.length) return;
    var vw = viewport.getBoundingClientRect().width;
    var vLeft = viewport.scrollLeft;
    var center = vLeft + vw / 2;
    var best = 0;
    var bestDist = Infinity;
    collectionSlides.forEach(function (slide, i) {
      var r = slide.getBoundingClientRect();
      var slideCenter = r.left - viewport.getBoundingClientRect().left + r.width / 2 + viewport.scrollLeft;
      var dist = Math.abs(center - slideCenter);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    collectionSlides.forEach(function (slide, i) {
      slide.classList.toggle('carousel-slide--active', i === best);
    });
  }

  if (viewport && collectionSlides.length) {
    viewport.addEventListener('scroll', updateCollectionActiveFromScroll);
    if ('onscrollend' in viewport) {
      viewport.addEventListener('scrollend', updateCollectionActiveFromScroll);
    }
    setTimeout(updateCollectionActiveFromScroll, 100);
    if (btnPrev) btnPrev.addEventListener('click', function () { scrollCollection(-1); });
    if (btnNext) btnNext.addEventListener('click', function () { scrollCollection(1); });
    collectionSlides.forEach(function (slide) {
      slide.addEventListener('click', function () {
        slide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });
    });
  }

  // ----- Other carousels (e.g. parts: single active slide) -----
  var track = document.querySelector('.carousel--parts .carousel-track');
  var slides = document.querySelectorAll('.carousel--parts .carousel-slide');
  var partsPrev = document.querySelector('.carousel--parts .carousel-btn--prev');
  var partsNext = document.querySelector('.carousel--parts .carousel-btn--next');
  var carousel = track ? track.closest('.carousel') : null;
  var dotsContainer = carousel && carousel.parentElement ? carousel.parentElement.querySelector('.carousel-dots') : null;
  var dots = dotsContainer ? dotsContainer.querySelectorAll('.carousel-dot') : [];
  var current = 0;
  var total = slides.length;

  function setActive(index) {
    if (total === 0) return;
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
    setActive(0);
    if (partsPrev) partsPrev.addEventListener('click', function () { setActive(current - 1); });
    if (partsNext) partsNext.addEventListener('click', function () { setActive(current + 1); });
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var idx = parseInt(dot.getAttribute('data-index'), 10);
        if (!isNaN(idx)) setActive(idx);
      });
    });
    slides.forEach(function (slide, i) {
      slide.addEventListener('click', function () { setActive(i); });
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


const swiper = new Swiper('.swiper', {
  loop: true,
  slidesPerView: 4,
  spaceBetween: 20,
  centeredSlides: true,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
})
