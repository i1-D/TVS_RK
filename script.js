
(function () {
  'use strict';

  // ----- Mobile Menu Toggle -----
  function initMobileMenu() {
    var menuToggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.nav');
    
    if (!menuToggle || !nav) {
      // Retry if header not loaded yet
      setTimeout(initMobileMenu, 100);
      return;
    }

    // Check if already initialized
    if (menuToggle.hasAttribute('data-initialized')) {
      return;
    }
    
    menuToggle.setAttribute('data-initialized', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');

    var navLinks = document.querySelectorAll('.nav-link');

    function toggleMenu() {
      var isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      nav.classList.toggle('menu-open');
      
      // Prevent body scroll when menu is open
      if (!isExpanded) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }

    function closeMenu() {
      menuToggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('menu-open');
      document.body.style.overflow = '';
    }

    menuToggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });
    
    // Close menu when clicking on a nav link
    navLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        closeMenu();
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (nav.classList.contains('menu-open') && 
          !nav.contains(event.target) && 
          !menuToggle.contains(event.target)) {
        closeMenu();
      }
    });

    // Close menu on window resize if it's larger than mobile
    window.addEventListener('resize', function() {
      if (window.innerWidth > 900) {
        closeMenu();
      }
    });

    // Close menu on scroll
    window.addEventListener('scroll', function() {
      if (nav.classList.contains('menu-open')) {
        closeMenu();
      }
    });
  }

  // Initialize menu - multiple strategies to catch header loading
  function tryInitMenu() {
    var menuToggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.nav');
    
    if (menuToggle && nav && !menuToggle.hasAttribute('data-initialized')) {
      initMobileMenu();
      return true;
    }
    return false;
  }

  // Strategy 1: Try immediately
  tryInitMenu();

  // Strategy 2: After DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(tryInitMenu, 100);
    });
  }

  // Strategy 3: Watch for header insertion via MutationObserver
  var headerObserver = new MutationObserver(function(mutations) {
    tryInitMenu();
  });

  // Observe document body for header insertion
  if (document.body) {
    headerObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      headerObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  }

  // Strategy 4: Periodic check as fallback (stops after 3 seconds)
  var attempts = 0;
  var maxAttempts = 30; // 30 attempts * 100ms = 3 seconds
  var checkInterval = setInterval(function() {
    attempts++;
    if (tryInitMenu() || attempts >= maxAttempts) {
      clearInterval(checkInterval);
    }
  }, 100);


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

  // ----- What We Offer: flip cards on click -----
  var serviceCards = document.querySelectorAll('.offer .service-card');
  serviceCards.forEach(function (card) {
    card.addEventListener('click', function () {
      card.classList.toggle('flipped');
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('flipped');
      }
    });
  });

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

  // ----- Fixed Scroll Indicator -----
  var scrollIndicatorDots = document.querySelectorAll('.scroll-indicator-dot');
  var scrollIndicatorLine = document.querySelector('.scroll-indicator-line');
  
  // Detect sections based on available dots
  function getSectionsForPage() {
    var sections = [];
    scrollIndicatorDots.forEach(function (dot) {
      var sectionName = dot.getAttribute('data-section');
      if (sectionName) {
        var section = document.querySelector('.' + sectionName);
        if (section) {
          sections.push(section);
        }
      }
    });
    return sections;
  }
  
  var scrollSections = getSectionsForPage();

  function updateScrollIndicator() {
    if (!scrollIndicatorDots.length || !scrollSections.length) return;

    var scrollY = window.scrollY || window.pageYOffset;
    var windowHeight = window.innerHeight;
    var documentHeight = document.documentElement.scrollHeight;
    var scrollPercent = scrollY / (documentHeight - windowHeight);

    // Find active section
    var activeIndex = 0;
    var headerOffset = 80;
    var threshold = windowHeight * 0.3;

    scrollSections.forEach(function (section, index) {
      var rect = section.getBoundingClientRect();
      var sectionTop = rect.top + scrollY;
      var sectionMiddle = sectionTop + rect.height / 2;

      if (scrollY + headerOffset + threshold >= sectionTop && 
          scrollY + headerOffset + threshold < sectionTop + rect.height) {
        activeIndex = index;
      }
    });

    // Update active dot
    scrollIndicatorDots.forEach(function (dot, index) {
      if (index === activeIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Update line progress
    if (scrollIndicatorLine && scrollIndicatorDots.length > 0) {
      var totalDots = scrollIndicatorDots.length;
      var progressPercent = ((activeIndex + 1) / totalDots) * 100;
      
      // Check if mobile (horizontal layout)
      var isMobile = window.innerWidth <= 900;
      
      if (isMobile) {
        // Horizontal line: fill from left to right
        var activeDot = scrollIndicatorDots[activeIndex];
        if (activeDot) {
          var dotsContainer = document.querySelector('.scroll-indicator-dots');
          if (dotsContainer) {
            var containerRect = dotsContainer.getBoundingClientRect();
            var dotRect = activeDot.getBoundingClientRect();
            var dotPosition = ((dotRect.left + dotRect.width / 2) - containerRect.left) / containerRect.width;
            progressPercent = Math.max(0, Math.min(100, dotPosition * 100));
          }
        }
        
        scrollIndicatorLine.style.background = 
          `linear-gradient(to right, 
            var(--color-primary) 0%, 
            var(--color-primary) ${progressPercent}%, 
            rgba(193, 39, 44, 0.2) ${progressPercent}%, 
            rgba(193, 39, 44, 0.2) 100%)`;
      } else {
        // Vertical line: fill from top to bottom
        var activeDot = scrollIndicatorDots[activeIndex];
        if (activeDot) {
          var indicatorRect = document.querySelector('.scroll-indicator').getBoundingClientRect();
          var dotRect = activeDot.getBoundingClientRect();
          var dotPosition = ((dotRect.top + dotRect.height / 2) - indicatorRect.top) / indicatorRect.height;
          progressPercent = Math.max(0, Math.min(100, dotPosition * 100));
        }
        
        scrollIndicatorLine.style.background = 
          `linear-gradient(to bottom, 
            var(--color-primary) 0%, 
            var(--color-primary) ${progressPercent}%, 
            rgba(193, 39, 44, 0.2) ${progressPercent}%, 
            rgba(193, 39, 44, 0.2) 100%)`;
      }
    }
  }

  // Click handler for scroll indicator dots
  scrollIndicatorDots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      var section = scrollSections[index];
      if (section) {
        var headerOffset = 80;
        var sectionTop = section.offsetTop - headerOffset;
        window.scrollTo({
          top: sectionTop,
          behavior: 'smooth'
        });
      }
    });
  });

  if (scrollIndicatorDots.length && scrollSections.length) {
    window.addEventListener('scroll', updateScrollIndicator);
    window.addEventListener('resize', updateScrollIndicator);
    updateScrollIndicator();
  }

  // ----- Hide scroll indicator when footer is in view -----
  var scrollIndicator = document.querySelector('.scroll-indicator');
  var footerObserver = null;

  function checkFooterVisibility() {
    if (!scrollIndicator) return;
    
    var footer = document.querySelector('.footer');
    if (!footer) return;

    var footerRect = footer.getBoundingClientRect();
    var windowHeight = window.innerHeight;
    
    // Hide indicator when footer enters viewport (when top of footer is visible)
    if (footerRect.top < windowHeight) {
      scrollIndicator.classList.add('hidden');
    } else {
      scrollIndicator.classList.remove('hidden');
    }
  }

  function initFooterObserver() {
    if (!scrollIndicator) return;
    
    var footer = document.querySelector('.footer');
    if (!footer) {
      // Retry if footer not loaded yet (loaded via include.js)
      setTimeout(initFooterObserver, 100);
      return;
    }

    // Use Intersection Observer if available
    if ('IntersectionObserver' in window && !footerObserver) {
      footerObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            scrollIndicator.classList.add('hidden');
          } else {
            scrollIndicator.classList.remove('hidden');
          }
        });
      }, {
        root: null,
        rootMargin: '0px',
        threshold: 0 // Trigger as soon as footer enters viewport
      });
      
      footerObserver.observe(footer);
    } else {
      // Fallback: check on scroll
      window.addEventListener('scroll', checkFooterVisibility);
      window.addEventListener('resize', checkFooterVisibility);
      checkFooterVisibility();
    }
  }

  // Initialize footer observer
  if (scrollIndicator) {
    // Wait a bit for include.js to load footer
    setTimeout(function() {
      initFooterObserver();
      // Also check on scroll as backup
      window.addEventListener('scroll', checkFooterVisibility);
    }, 300);
  }
})();

// Initialize Swiper after library and DOM loads
function initSwiper() {
  if (typeof Swiper === 'undefined') {
    setTimeout(initSwiper, 100);
    return;
  }

  const swiperElement = document.querySelector('.collection .swiper');
  if (!swiperElement) {
    setTimeout(initSwiper, 100);
    return;
  }

  new Swiper('.collection .swiper', {
    loop: true,
    slidesPerView: 'auto',
    spaceBetween: 12,
    centeredSlides: true,
    autoplay: {
      delay: 0,
      disableOnInteraction: false,
      pauseOnMouseEnter: false,
    },
    speed: 3000,
    navigation: {
      nextEl: '.collection .swiper-button-next',
      prevEl: '.collection .swiper-button-prev',
    },
    breakpoints: {
      // Mobile: up to 480px - show 3 slides (1 centered, 1 partial left, 1 partial right)
      480: {
        slidesPerView: 1.15,
        spaceBetween: 12,
        centeredSlides: true,
      },
      // Small tablets: 481px - 600px - show 3 slides with partial visibility
      600: {
        slidesPerView: 1.3,
        spaceBetween: 15,
        centeredSlides: true,
      },
      // Tablets: 601px - 900px - show 3 slides with partial visibility
      900: {
        slidesPerView: 1.5,
        spaceBetween: 18,
        centeredSlides: true,
      },
      // Small desktops: 901px - 1200px
      1200: {
        slidesPerView: 4,
        spaceBetween: 20,
        centeredSlides: true,
      },
      // Large desktops: 1201px - 1920px
      1920: {
        slidesPerView: 5,
        spaceBetween: 20,
        centeredSlides: true,
      },
    },
  });
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSwiper);
} else {
  initSwiper();
}
