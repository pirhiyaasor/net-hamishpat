(function () {
  var COLUMNS = ['entered', 'in_progress', 'done'];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function formatTime(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return d.toLocaleString('he-IL');
  }

  function cardHtml(card) {
    var area = card.context && (card.context.resolvedArea || card.context.resolvedSrc);
    var html = '<div class="card" data-id="' + esc(card.id) + '">';
    if (area) html += '<span class="area-badge">' + esc(area) + '</span>';
    html += '<div class="note">' + esc(card.note) + '</div>';
    html += '<div class="meta">' + esc(formatTime(card.createdAt)) + '</div>';
    if (card.flagged) {
      html += '<div class="flag-badge">⚠ מעורפל: ' + esc(card.flagReason || '') + '</div>';
    }
    if (card.resolution) {
      html += '<div class="resolution">✓ ' + esc(card.resolution) + '</div>';
    }
    html += '<div class="actions">';
    if (card.status === 'entered') {
      html += '<button type="button" data-action="advance" data-id="' + esc(card.id) + '">→ בטיפול</button>';
    }
    if (card.status === 'in_progress') {
      html += '<button type="button" class="primary" data-action="complete" data-id="' + esc(card.id) + '">→ הושלם</button>';
    }
    html += '</div>';
    html += '</div>';
    return html;
  }

  function render(cards) {
    var byStatus = { entered: [], in_progress: [], done: [] };
    cards.forEach(function (c) {
      if (byStatus[c.status]) byStatus[c.status].push(c);
    });
    COLUMNS.forEach(function (status) {
      var container = document.getElementById('cards-' + status);
      var list = byStatus[status];
      document.getElementById('count-' + status).textContent = list.length;
      container.innerHTML = list.length
        ? list.map(cardHtml).join('')
        : '<div class="empty">אין כרטיסים</div>';
    });
  }

  function loadCards() {
    fetch('/api/cards')
      .then(function (r) { return r.json(); })
      .then(render)
      .catch(function () {
        document.querySelector('.board').innerHTML =
          '<div class="empty">לא ניתן להתחבר לשרת מנוע התיקונים. ודאי ש-node fix-engine/server.js פועל.</div>';
      });
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-action]');
    if (!btn) return;
    var id = btn.getAttribute('data-id');
    var action = btn.getAttribute('data-action');
    if (action === 'advance') {
      fetch('/api/cards/' + id + '/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress' })
      }).then(loadCards);
    } else if (action === 'complete') {
      fetch('/api/cards/' + id + '/complete', {
        method: 'POST',
        headers: { 'X-Board-Client': 'true' }
      }).then(loadCards);
    }
  });

  var es = new EventSource('/api/events');
  es.addEventListener('cards-updated', loadCards);
  es.addEventListener('reload', loadCards);
  es.onerror = function () {};

  loadCards();
})();
