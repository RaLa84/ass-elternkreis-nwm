/**
 * Client-side search for ASS Elternkreis NWM
 * Loads searchindex.json and provides live search results
 */
(function () {
  'use strict';

  var searchIndex = null;
  var searchOverlay = null;
  var searchInput = null;
  var searchResults = null;
  var debounceTimer = null;

  // Detect if we're in a subdirectory
  var basePath = '';
  var path = window.location.pathname;
  if (path.indexOf('/vorschule/') !== -1 || path.indexOf('/grundschule/') !== -1 ||
      path.indexOf('/teenager/') !== -1 || path.indexOf('/junge-erwachsene/') !== -1 ||
      path.indexOf('/erwachsene/') !== -1 || path.indexOf('/wissen/') !== -1 || path.indexOf('/blog/') !== -1) {
    basePath = '../';
  }

  function createSearchUI() {
    // Overlay
    searchOverlay = document.createElement('div');
    searchOverlay.id = 'searchOverlay';
    searchOverlay.className = 'fixed inset-0 z-50 hidden';
    searchOverlay.innerHTML =
      '<div class="absolute inset-0 bg-black/40 backdrop-blur-sm" id="searchBackdrop"></div>' +
      '<div class="relative z-10 max-w-2xl mx-auto mt-20 sm:mt-32 px-4">' +
        '<div class="bg-white rounded-2xl shadow-2xl overflow-hidden">' +
          '<div class="flex items-center gap-3 p-4 border-b border-gray-100">' +
            '<svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>' +
            '<input id="searchInput" type="text" placeholder="Suche nach Fragen, Themen, Begriffen..." class="flex-1 text-base text-gray-900 placeholder-gray-400 outline-none bg-transparent">' +
            '<kbd class="hidden sm:inline-flex items-center px-2 py-0.5 text-xs text-gray-400 bg-gray-100 rounded border border-gray-200">ESC</kbd>' +
          '</div>' +
          '<div id="searchResults" class="max-h-[60vh] overflow-y-auto"></div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(searchOverlay);
    searchInput = document.getElementById('searchInput');
    searchResults = document.getElementById('searchResults');

    // Close on backdrop click
    document.getElementById('searchBackdrop').addEventListener('click', closeSearch);

    // Close on ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !searchOverlay.classList.contains('hidden')) {
        closeSearch();
      }
      // Ctrl+K or Cmd+K to open
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    });

    // Debounced search on input
    searchInput.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        performSearch(searchInput.value.trim());
      }, 200);
    });
  }

  function openSearch() {
    searchOverlay.classList.remove('hidden');
    searchInput.value = '';
    searchResults.innerHTML = renderInitialHint();
    searchInput.focus();
    document.body.style.overflow = 'hidden';

    // Load index if not loaded
    if (!searchIndex) {
      loadSearchIndex();
    }
  }

  function closeSearch() {
    searchOverlay.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function loadSearchIndex() {
    fetch(basePath + 'searchindex.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        searchIndex = data;
        // Re-run search if there's already input
        if (searchInput.value.trim()) {
          performSearch(searchInput.value.trim());
        }
      })
      .catch(function () {
        searchResults.innerHTML =
          '<div class="p-6 text-center text-gray-500">Suchindex konnte nicht geladen werden.</div>';
      });
  }

  function performSearch(query) {
    if (!query) {
      searchResults.innerHTML = renderInitialHint();
      return;
    }
    if (!searchIndex) {
      searchResults.innerHTML =
        '<div class="p-6 text-center text-gray-400">Index wird geladen...</div>';
      return;
    }

    var terms = query.toLowerCase().split(/\s+/).filter(function (t) { return t.length > 1; });
    if (terms.length === 0) {
      searchResults.innerHTML = renderInitialHint();
      return;
    }

    // Score each entry
    var scored = searchIndex.map(function (item) {
      var score = 0;
      var titleLow = item.title.toLowerCase();
      var previewLow = (item.preview || '').toLowerCase();
      var tagsLow = (item.tags || []).join(' ').toLowerCase();
      var categoryLow = (item.category || '').toLowerCase();

      terms.forEach(function (term) {
        // Title match (highest weight)
        if (titleLow.indexOf(term) !== -1) score += 10;
        // Category match
        if (categoryLow.indexOf(term) !== -1) score += 5;
        // Tag match
        if (tagsLow.indexOf(term) !== -1) score += 3;
        // Preview match
        if (previewLow.indexOf(term) !== -1) score += 1;
      });

      return { item: item, score: score };
    });

    // Filter and sort
    var results = scored
      .filter(function (s) { return s.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 8);

    if (results.length === 0) {
      searchResults.innerHTML =
        '<div class="p-8 text-center">' +
          '<svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' +
          '<p class="text-gray-500 font-medium">Keine Treffer gefunden</p>' +
          '<p class="text-sm text-gray-400 mt-1">Versuche andere Suchbegriffe</p>' +
        '</div>';
      return;
    }

    var html = '<div class="divide-y divide-gray-100">';
    results.forEach(function (r) {
      var item = r.item;
      var url = basePath + item.url;
      var highlightedTitle = highlightTerms(item.title, terms);
      var preview = item.preview ? highlightTerms(item.preview, terms) : '';

      html +=
        '<a href="' + url + '" class="block px-4 py-3 hover:bg-forest/5 transition-colors">' +
          '<div class="flex items-start gap-3">' +
            '<div class="flex-1 min-w-0">' +
              '<div class="flex items-center gap-2 mb-0.5">' +
                '<span class="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-forest/10 text-forest whitespace-nowrap">' + escapeHtml(item.category) + '</span>' +
              '</div>' +
              '<p class="text-sm font-semibold text-gray-900 truncate">' + highlightedTitle + '</p>' +
              (preview ? '<p class="text-xs text-gray-500 mt-0.5 line-clamp-2">' + preview + '</p>' : '') +
            '</div>' +
            '<svg class="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>' +
          '</div>' +
        '</a>';
    });
    html += '</div>';

    searchResults.innerHTML = html;
  }

  function highlightTerms(text, terms) {
    var escaped = escapeHtml(text);
    terms.forEach(function (term) {
      var regex = new RegExp('(' + escapeRegex(term) + ')', 'gi');
      escaped = escaped.replace(regex, '<mark class="bg-sunflower/30 text-inherit rounded px-0.5">$1</mark>');
    });
    return escaped;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function renderInitialHint() {
    return '<div class="p-6 text-center text-gray-400 text-sm">' +
      '<p>Durchsuche 100 FAQ-Fragen, Blog-Artikel und mehr</p>' +
      '<p class="mt-1 text-xs">Tipp: <kbd class="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 text-gray-500">Strg</kbd> + <kbd class="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 text-gray-500">K</kbd> zum Öffnen</p>' +
    '</div>';
  }

  // Initialize
  function init() {
    createSearchUI();

    // Bind all search trigger buttons
    document.querySelectorAll('[data-search-trigger]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openSearch();
      });
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
