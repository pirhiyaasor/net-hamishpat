// Fix Engine — capture client.
// Injected into index.html via a single <script src="fix-engine/client.js" defer></script> tag.
// Entirely inert (no-ops) when the fix-engine server isn't reachable, so this has zero effect
// on real visitors of the Vercel/GitHub Pages deployment.
(function () {
  var RESTORE_KEY = 'fixEngineRestore';
  var popupEl = null;

  function injectStyles() {
    var style = document.createElement('style');
    style.textContent =
      '#fe-popup{position:fixed;z-index:99999;background:#fff;border:1px solid #d0d5dd;' +
      'border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.18);padding:10px;width:260px;' +
      'font-family:inherit;direction:rtl}' +
      '#fe-popup textarea{width:100%;box-sizing:border-box;min-height:60px;resize:vertical;' +
      'font:inherit;border:1px solid #d0d5dd;border-radius:6px;padding:6px;margin-bottom:8px}' +
      '#fe-popup .fe-actions{display:flex;gap:6px;justify-content:flex-end}' +
      '#fe-popup button{font:inherit;border:none;border-radius:6px;padding:5px 12px;cursor:pointer}' +
      '#fe-popup .fe-save{background:#2563eb;color:#fff}' +
      '#fe-popup .fe-cancel{background:#f2f4f7;color:#344054}';
    document.head.appendChild(style);
  }

  function closePopup() {
    if (popupEl) {
      if (popupEl._cleanup) popupEl._cleanup();
      popupEl.remove();
      popupEl = null;
    }
  }

  function openNotePopup(x, y, targetEl) {
    closePopup();
    popupEl = document.createElement('div');
    popupEl.id = 'fe-popup';
    var left = Math.min(x, window.innerWidth - 280);
    var top = Math.min(y, window.innerHeight - 140);
    popupEl.style.left = Math.max(8, left) + 'px';
    popupEl.style.top = Math.max(8, top) + 'px';
    popupEl.innerHTML =
      '<textarea placeholder="הערה קצרה על האלמנט הזה..." autofocus></textarea>' +
      '<div class="fe-actions">' +
      '<button class="fe-cancel" type="button">ביטול</button>' +
      '<button class="fe-save" type="button">שמירה</button>' +
      '</div>';
    document.body.appendChild(popupEl);

    var textarea = popupEl.querySelector('textarea');
    textarea.focus();

    popupEl.querySelector('.fe-cancel').addEventListener('click', function (e) {
      e.stopPropagation();
      closePopup();
    });
    popupEl.querySelector('.fe-save').addEventListener('click', function (e) {
      e.stopPropagation();
      var note = textarea.value.trim();
      if (note) submitCard(note, targetEl);
      closePopup();
    });
    popupEl.addEventListener('click', function (e) { e.stopPropagation(); });
    popupEl.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closePopup();
    });

    function onDocClick() { closePopup(); }
    document.addEventListener('click', onDocClick);
    popupEl._cleanup = function () { document.removeEventListener('click', onDocClick); };
  }

  function describeNode(node) {
    return {
      tag: node.tagName,
      id: node.id || null,
      className: (node.className && node.className.baseVal) || node.className || null,
      dataArea: (node.dataset && node.dataset.area) || null,
      dataSrc: (node.dataset && node.dataset.src) || null
    };
  }

  function buildContextBundle(targetEl) {
    var activePage = document.querySelector('.page.active');
    var activeStep = document.querySelector('.step-panel.active');
    var selActionHint = null;
    var selectedTile = document.querySelector('.action-tile.selected');
    if (selectedTile) selActionHint = selectedTile.textContent.trim();

    var chain = [];
    var node = targetEl;
    var taggedAncestor = null;
    while (node && node.nodeType === 1) {
      chain.push(describeNode(node));
      if (!taggedAncestor && node.dataset && (node.dataset.area || node.dataset.src)) {
        taggedAncestor = node;
      }
      if (node === document.body) break;
      node = node.parentElement;
    }

    var resolvedSrc = (taggedAncestor && taggedAncestor.dataset.src) || 'index.html';
    var resolvedArea = (taggedAncestor && taggedAncestor.dataset.area) || null;
    var textSource = taggedAncestor || targetEl;
    var nearbyText = (textSource.innerText || '').slice(0, 400);
    var rect = targetEl.getBoundingClientRect();

    return {
      pageId: activePage ? activePage.id : null,
      stepId: activeStep ? activeStep.id : null,
      selActionHint: selActionHint,
      ancestorChain: chain,
      taggedAncestorFound: !!taggedAncestor,
      resolvedArea: resolvedArea,
      resolvedSrc: resolvedSrc,
      nearbyText: nearbyText,
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      url: location.href,
      timestamp: new Date().toISOString()
    };
  }

  function submitCard(note, targetEl) {
    var context = buildContextBundle(targetEl);
    fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: note, context: context })
    }).catch(function () { /* server may have gone away mid-session — nothing to do */ });
  }

  function onAltClick(e) {
    if (!e.altKey) return;
    e.preventDefault();
    e.stopPropagation();
    openNotePopup(e.clientX, e.clientY, e.target);
  }

  function initCapture() {
    injectStyles();
    document.addEventListener('click', onAltClick, true);
  }

  function initReloadListener() {
    var es = new EventSource('/api/events');
    es.addEventListener('reload', function () {
      var activePage = document.querySelector('.page.active');
      var activeStep = document.querySelector('.step-panel.active');
      var state = {
        pageId: activePage ? activePage.id.replace(/^page-/, '') : null,
        stepPanelId: activeStep ? activeStep.id : null
      };
      try { sessionStorage.setItem(RESTORE_KEY, JSON.stringify(state)); } catch (e2) {}
      location.reload();
    });
    es.onerror = function () { /* EventSource retries on its own; nothing to do */ };
  }

  function restoreStateIfAny() {
    var raw;
    try { raw = sessionStorage.getItem(RESTORE_KEY); } catch (e) { raw = null; }
    if (!raw) return;
    try { sessionStorage.removeItem(RESTORE_KEY); } catch (e) {}
    var state;
    try { state = JSON.parse(raw); } catch (e) { return; }

    function apply() {
      if (state.pageId && state.pageId !== 'submit') {
        var navButtons = document.querySelectorAll('.nav-btn');
        var btn = state.pageId === 'history' ? navButtons[1] : navButtons[0];
        if (typeof showPage === 'function' && btn) showPage(state.pageId, btn);
      }
      if ((!state.pageId || state.pageId === 'submit') && state.stepPanelId && typeof goTo === 'function') {
        var n = Number(state.stepPanelId.replace('panel', ''));
        if (n && n !== 1) goTo(n);
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', apply);
    } else {
      apply();
    }
  }

  function checkHealth() {
    fetch('/api/health')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !data.enabled) return;
        restoreStateIfAny();
        initCapture();
        initReloadListener();
      })
      .catch(function () { /* no fix-engine server reachable — stay completely inert */ });
  }

  checkHealth();
})();
