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

// --- Archives: search and sort (only on main /archives/ page) ---
// Dates and month labels use server-formatted values (dateDisplay, monthLabel) so they
// match theme.date_format and the site locale, consistent with the server-rendered list.

function renderArchiveList(posts) {
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
    var dateStr = escapeHtml(p.dateDisplay || p.date);
    html += '<div class="post-list-item"><div class="post-title"><a href="' + p.path + '">' + title + '</a></div>';
    html += '<span class="post-date">' + dateStr + '</span></div>';
  }
  return html;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function applyArchiveFilterAndSort() {
  var el = document.getElementById('posts-data');
  var searchEl = document.getElementById('archive-search');
  var sortEl = document.getElementById('archive-sort');
  var listEl = document.querySelector('.post-list');
  if (!el || !listEl) return;
  var search = (searchEl && searchEl.value) ? searchEl.value.trim().toLowerCase() : '';
  var sortVal = (sortEl && sortEl.value) ? sortEl.value : 'newest';
  if (search === '' && sortVal === 'newest') {
    window.location.reload();
    return;
  }
  var raw = (el.textContent || '').trim();
  var all = raw.length ? JSON.parse(atob(raw)) : [];
  var posts = all.filter(function(p) {
    if (!search) return true;
    var t = (p.title || '').toLowerCase();
    var tags = (p.tags || []).join(' ').toLowerCase();
    return t.indexOf(search) !== -1 || tags.indexOf(search) !== -1;
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
  listEl.innerHTML = renderArchiveList(posts);
}

function initArchivesToolbar() {
  var searchEl = document.getElementById('archive-search');
  var sortEl = document.getElementById('archive-sort');
  if (searchEl) searchEl.addEventListener('input', applyArchiveFilterAndSort);
  if (sortEl) sortEl.addEventListener('change', applyArchiveFilterAndSort);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initArchivesToolbar);
} else {
  initArchivesToolbar();
}

