/**
 * Load HTML partials into elements with data-include="path/to/partial.html"
 * Must be served over HTTP (e.g. npm start) for fetch to work.
 */
(function () {
  'use strict';

  function getCurrentPage() {
    var path = window.location.pathname;
    var base = path.split('/').pop() || 'index.html';
    if (base === '' || base === '/') return 'index';
    return base.replace(/\.html$/, '') || 'index';
  }

  function setActiveNav() {
    var current = getCurrentPage();
    document.querySelectorAll('.nav-link[data-page]').forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('data-page') === current);
    });
  }

  function loadPartial(container, url) {
    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load ' + url);
        return res.text();
      })
      .then(function (html) {
        container.innerHTML = html;
        if (url.indexOf('header') !== -1) {
          setActiveNav();
        }
      })
      .catch(function (err) {
        console.error(err);
        container.innerHTML = '<!-- Failed to load: ' + url + ' -->';
      });
  }

  function init() {
    var includes = document.querySelectorAll('[data-include]');
    var promises = [];
    includes.forEach(function (el) {
      var url = el.getAttribute('data-include');
      if (url) promises.push(loadPartial(el, url));
    });
    Promise.all(promises).catch(function () {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
