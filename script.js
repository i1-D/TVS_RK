
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

  // ----- What We Offer: flip on hover (desktop) or click (mobile) -----
  var serviceCards = document.querySelectorAll('.offer .service-card');
  serviceCards.forEach(function (card) {
    card.addEventListener('click', function (e) {
      if (window.matchMedia('(hover: hover)').matches) return;
      serviceCards.forEach(function (other) {
        if (other !== card) other.classList.remove('flipped');
      });
      card.classList.toggle('flipped');
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (window.matchMedia('(hover: hover)').matches) {
          card.classList.toggle('flipped');
        } else {
          serviceCards.forEach(function (other) {
            if (other !== card) other.classList.remove('flipped');
          });
          card.classList.toggle('flipped');
        }
      }
    });
  });

  // ----- Services page only: auto-flip first offer card once when section is in view, flip back after 5s -----
  (function initOfferFirstCardAutoplay() {
    var servicesPageHero = document.querySelector('.hero--services');
    var offerSection = document.querySelector('.offer');
    var firstCard = document.querySelector('.offer .service-card');
    if (!servicesPageHero || !offerSection || !firstCard) return;

    var FLIP_BACK_DELAY_MS = 2000;
    var flipBackTimeout = null;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.target !== offerSection || !entry.isIntersecting) return;
          if (offerSection.getAttribute('data-first-card-autoplay') === 'done') return;

          offerSection.setAttribute('data-first-card-autoplay', 'done');
          firstCard.classList.add('flipped');

          if (flipBackTimeout) clearTimeout(flipBackTimeout);
          flipBackTimeout = setTimeout(function () {
            firstCard.classList.remove('flipped');
            flipBackTimeout = null;
          }, FLIP_BACK_DELAY_MS);
        });
      },
      { threshold: 0.2, rootMargin: '0px' }
    );

    observer.observe(offerSection);
  })();

  // ----- Services section: animate stats when section comes into view -----
  (function initStatsCounter() {
    var servicesSection = document.querySelector('.services');
    var statValues = document.querySelectorAll('.services .stat-value[data-target]');
    if (!servicesSection || !statValues.length) return;

    var DURATION = 1800;   // ms
    var animating = false;
    var animId = null;

    function easeOutQuart(t) {
      return 1 - (--t) * t * t * t;
    }

    function setStatValue(el, value, suffix) {
      var num = Math.round(value);
      el.textContent = num + (suffix || '');
    }

    function resetStats() {
      statValues.forEach(function (el) {
        var suffix = el.getAttribute('data-suffix') || '';
        el.textContent = '0' + suffix;
      });
    }

    function runCountUp() {
      if (animating) return;
      animating = true;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var elapsed = timestamp - startTime;
        var progress = Math.min(elapsed / DURATION, 1);
        var eased = easeOutQuart(progress);

        statValues.forEach(function (el) {
          var target = parseInt(el.getAttribute('data-target'), 10);
          var suffix = el.getAttribute('data-suffix') || '';
          if (isNaN(target)) return;
          var current = eased * target;
          setStatValue(el, current, suffix);
        });

        if (progress < 1) {
          animId = requestAnimationFrame(step);
        } else {
          animating = false;
          animId = null;
        }
      }

      animId = requestAnimationFrame(step);
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.target !== servicesSection) return;
          if (entry.isIntersecting) {
            resetStats();
            runCountUp();
          } else {
            if (animId) {
              cancelAnimationFrame(animId);
              animId = null;
            }
            animating = false;
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px' }
    );

    observer.observe(servicesSection);
  })();

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

  // Homepage collection slider
  var collectionEl = document.querySelector('.collection .swiper');
  if (collectionEl && !collectionEl.swiper) {
    new Swiper('.collection .swiper', {
      loop: true,
      slidesPerView: 'auto',
      spaceBetween: 12,
      centeredSlides: true,
      freeMode: true,
      freeModeMomentum: true,
      speed: 2000,
      autoplay: {
        delay: 0,
        disableOnInteraction: false,
        pauseOnMouseEnter: false,
      },
      navigation: {
        nextEl: '.collection .swiper-button-next',
        prevEl: '.collection .swiper-button-prev',
      },
      breakpoints: {
        480: { slidesPerView: 1.5, spaceBetween: 20 },
        600: { slidesPerView: 1.5, spaceBetween: 12 },
        900: { slidesPerView: 1.5, spaceBetween: 12 },
        1200: { slidesPerView: 2, spaceBetween: 16 },
        1920: { slidesPerView: 2.8, spaceBetween: 8 },
      },
    });
  }

  // Spare parts page: 1 slide, prev/next buttons, pagination dots
  var partsEl = document.querySelector('.parts-section .swiper--parts');
  if (partsEl && !partsEl.swiper) {
    new Swiper('.parts-section .swiper--parts', {
      slidesPerView: 1,
      spaceBetween: 0,
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: '.parts-section .swiper-button-next',
        prevEl: '.parts-section .swiper-button-prev',
      },
      pagination: {
        el: '.parts-section .swiper-pagination',
        clickable: true,
      },
    });
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSwiper);
} else {
  initSwiper();
}
