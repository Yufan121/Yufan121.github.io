// Global site search powered by hexo-generator-searchdb
(function() {
  var searchData = null;
  var searchInput = document.getElementById('search-input');
  var searchResults = document.getElementById('search-results');

  function loadSearchData(callback) {
    if (searchData) { callback(); return; }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/search.xml', true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        searchData = parseSearchXML(xhr.responseXML);
        callback();
      }
    };
    xhr.send();
  }

  function parseSearchXML(xml) {
    var entries = xml.querySelectorAll('entry');
    var data = [];
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var title = entry.querySelector('title') ? entry.querySelector('title').textContent : '';
      var url = entry.querySelector('url') ? entry.querySelector('url').textContent.trim() : '';
      var content = entry.querySelector('content') ? entry.querySelector('content').textContent : '';
      data.push({ title: title, url: url, content: content });
    }
    return data;
  }

  function stripHtml(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  function doSearch(query) {
    if (!query || query.length < 2) {
      searchResults.innerHTML = '<div class="search-hint">Type at least 2 characters to search...</div>';
      return;
    }
    var q = query.toLowerCase();
    var results = [];
    for (var i = 0; i < searchData.length; i++) {
      var d = searchData[i];
      var titleLower = d.title.toLowerCase();
      var contentText = stripHtml(d.content).toLowerCase();
      var titleIdx = titleLower.indexOf(q);
      var contentIdx = contentText.indexOf(q);
      if (titleIdx !== -1 || contentIdx !== -1) {
        results.push({ title: d.title, url: d.url, contentText: contentText, contentIdx: contentIdx, titleMatch: titleIdx !== -1 });
      }
    }
    // Sort: title matches first
    results.sort(function(a, b) { return (b.titleMatch ? 1 : 0) - (a.titleMatch ? 1 : 0); });

    if (results.length === 0) {
      searchResults.innerHTML = '<div class="search-no-results">No results found for "' + escapeHtml(query) + '"</div>';
      return;
    }

    var html = '';
    var max = Math.min(results.length, 10);
    for (var j = 0; j < max; j++) {
      var r = results[j];
      var snippet = '';
      if (r.contentIdx !== -1) {
        var start = Math.max(0, r.contentIdx - 40);
        var end = Math.min(r.contentText.length, r.contentIdx + query.length + 80);
        snippet = (start > 0 ? '...' : '') + r.contentText.substring(start, end) + (end < r.contentText.length ? '...' : '');
      }
      html += '<a class="search-result-item" href="' + r.url + '">';
      html += '<div class="search-result-title">' + highlightText(escapeHtml(r.title), query) + '</div>';
      if (snippet) {
        html += '<div class="search-result-snippet">' + highlightText(escapeHtml(snippet), query) + '</div>';
      }
      html += '</a>';
    }
    if (results.length > 10) {
      html += '<div class="search-hint">' + (results.length - 10) + ' more results...</div>';
    }
    searchResults.innerHTML = html;
  }

  function highlightText(text, query) {
    var re = new RegExp('(' + escapeRegExp(escapeHtml(query)) + ')', 'gi');
    return text.replace(re, '<mark>$1</mark>');
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  var debounceTimer;
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function() {
        doSearch(searchInput.value.trim());
      }, 200);
    });
  }

  window.openSearch = function() {
    var overlay = document.getElementById('search-overlay');
    overlay.classList.add('active');
    searchInput.value = '';
    searchResults.innerHTML = '<div class="search-hint">Type to search across all posts...</div>';
    loadSearchData(function() {
      searchInput.focus();
    });
  };

  window.closeSearch = function() {
    document.getElementById('search-overlay').classList.remove('active');
  };

  // Close on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeSearch();
    // Ctrl/Cmd+K to open search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
  });
})();
