function detectTaskList() {
    var taskListObjects = document.getElementsByTagName("input");
    for (var i = 0; i < taskListObjects.length; i++) {
      var par = taskListObjects[i].parentNode;
      par.classList.add("task-list-item");
      par.parentNode.classList.add("task-list");
    }
}

function detectBlockTable() {
  var tableListObjects = document.getElementsByTagName("thead");
  for (var i = 0; i < tableListObjects.length; i++) {
    var par = tableListObjects[i].parentNode;
    par.classList.add("block-table");
  }
}

function toggleMenu() {
    var menuList = document.getElementsByClassName("menu-list")[0];
    var menuButton = document.getElementById("menu-btn");
    if(menuList.classList.contains("active")){
      menuList.classList.remove("active");
      menuButton.innerHTML = "MENU";
    }else{
      menuList.classList.add("active");
      menuButton.innerHTML = "<div class=\"icon arrow-up\"> </div>";
    }
}

function detectors(){
  detectTaskList();
  detectBlockTable();
}

// --- Archives: search and sort ---
// Stores parsed posts data so we don't re-parse on every keystroke
var _archivePostsCache = null;
var _archiveOriginalHTML = null;

function getArchivePosts() {
  if (_archivePostsCache) return _archivePostsCache;
  var el = document.getElementById('posts-data');
  if (!el) return [];
  var raw = (el.textContent || '').trim();
  if (!raw.length) return [];
  try {
    _archivePostsCache = JSON.parse(raw);
  } catch (e) {
    _archivePostsCache = [];
  }
  return _archivePostsCache;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text, query) {
  if (!query) return text;
  var re = new RegExp('(' + escapeRegExp(query) + ')', 'gi');
  return text.replace(re, '<mark>$1</mark>');
}

function renderArchiveList(posts, query) {
  if (posts.length === 0) {
    return '<p class="archive-no-results">No posts found.</p>';
  }
  var lastYear = '', lastMonth = '';
  var html = '';
  for (var i = 0; i < posts.length; i++) {
    var p = posts[i];
    var y = p.date.substring(0, 4);
    var mo = p.date.substring(5, 7);
    if (lastYear !== y) {
      html += '<div class="year-title">' + y + '</div>';
      lastYear = y;
      lastMonth = '';
    }
    if (lastMonth !== mo) {
      html += '<div class="month-title">' + escapeHtml(p.monthLabel || '') + '</div>';
      lastMonth = mo;
    }
    var title = escapeHtml(p.title || 'Untitled');
    if (query) {
      title = highlightText(title, escapeHtml(query));
    }
    var dateStr = escapeHtml(p.dateDisplay || p.date);
    // Show matching tags when searching
    var tagHtml = '';
    if (query && p.tags && p.tags.length > 0) {
      var matchingTags = p.tags.filter(function(t) {
        return t.toLowerCase().indexOf(query.toLowerCase()) !== -1;
      });
      if (matchingTags.length > 0) {
        tagHtml = '<span class="archive-tags">';
        matchingTags.forEach(function(t) {
          tagHtml += '<span class="archive-tag">' + highlightText(escapeHtml(t), escapeHtml(query)) + '</span>';
        });
        tagHtml += '</span>';
      }
    }
    html += '<div class="post-list-item"><div class="post-title"><a href="' + p.path + '">' + title + '</a>' + tagHtml + '</div>';
    html += '<span class="post-date">' + dateStr + '</span></div>';
  }
  return html;
}

function applyArchiveFilterAndSort() {
  var searchEl = document.getElementById('archive-search');
  var sortEl = document.getElementById('archive-sort');
  var listEl = document.querySelector('.post-list');
  var countEl = document.getElementById('archive-result-count');
  if (!listEl) return;

  var search = (searchEl && searchEl.value) ? searchEl.value.trim() : '';
  var searchLower = search.toLowerCase();
  var sortVal = (sortEl && sortEl.value) ? sortEl.value : 'newest';

  // Save original HTML on first call
  if (!_archiveOriginalHTML) {
    _archiveOriginalHTML = listEl.innerHTML;
  }

  // If no search and default sort, restore original server-rendered HTML
  if (!search && sortVal === 'newest') {
    listEl.innerHTML = _archiveOriginalHTML;
    if (countEl) countEl.textContent = '';
    return;
  }

  var all = getArchivePosts();
  var posts = all.filter(function(p) {
    if (!searchLower) return true;
    var t = (p.title || '').toLowerCase();
    var tags = (p.tags || []).join(' ').toLowerCase();
    return t.indexOf(searchLower) !== -1 || tags.indexOf(searchLower) !== -1;
  });

  if (sortVal === 'oldest') {
    posts.sort(function(a,b) { return a.date.localeCompare(b.date); });
  } else if (sortVal === 'title-asc') {
    posts.sort(function(a,b) { return (a.title||'').localeCompare(b.title||''); });
  } else if (sortVal === 'title-desc') {
    posts.sort(function(a,b) { return (b.title||'').localeCompare(a.title||''); });
  } else {
    posts.sort(function(a,b) { return b.date.localeCompare(a.date); });
  }

  listEl.innerHTML = renderArchiveList(posts, search);

  // Show result count when searching
  if (countEl) {
    if (search) {
      countEl.textContent = posts.length + ' / ' + all.length;
    } else {
      countEl.textContent = '';
    }
  }
}

var _archiveDebounce;
function archiveSearchHandler() {
  clearTimeout(_archiveDebounce);
  _archiveDebounce = setTimeout(applyArchiveFilterAndSort, 150);
}

function initArchivesToolbar() {
  var searchEl = document.getElementById('archive-search');
  var sortEl = document.getElementById('archive-sort');
  if (searchEl) searchEl.addEventListener('input', archiveSearchHandler);
  if (sortEl) sortEl.addEventListener('change', applyArchiveFilterAndSort);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initArchivesToolbar);
} else {
  initArchivesToolbar();
}
