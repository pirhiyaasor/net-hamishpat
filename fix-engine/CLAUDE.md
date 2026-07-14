# Fix Engine — trigger contract

This folder is a self-contained scaffold: an Alt+Click annotation capture tool for
`../index.html`, a small JSON-backed queue, a Kanban board, and this contract describing
what the assistant (Claude) does when the user asks for a fix round.

## Starting it

```
node fix-engine/server.js
```

Serves the whole site plus the API at `http://localhost:3737/`. The Kanban board is at
`http://localhost:3737/fix-engine/board.html` (also linked from the app's topbar).

Toggle on/off: edit `fix-engine/config.json` (`{"enabled": false}`), no restart needed —
the flag is read fresh on every request and only gates the `/api/*` surface.

## The trigger: when the user types "תיקון"

1. `GET http://localhost:3737/api/cards?status=entered` — if it returns an empty array,
   tell the user there's nothing in the queue and stop here.
2. For each returned card: `PATCH /api/cards/:id/status` with `{"status":"in_progress"}`.
3. For each card, use `card.context` to find the right spot — `context.resolvedSrc`
   (defaults to `index.html`), `context.resolvedArea` (a `data-area` tag name, if one was
   found), `context.ancestorChain`, `context.nearbyText`, `context.pageId`/`stepId`. Open
   the file and make the fix the note is asking for.
4. **If a card's note is ambiguous or underspecified, do not guess.** Instead:
   `PATCH /api/cards/:id/flag` with `{"flagReason": "..."}` explaining what's unclear, and
   say so explicitly to the user in your reply. Never mark an ambiguous card resolved.
5. For every card you did fix, attach a short write-up:
   `PATCH /api/cards/:id/resolution` with `{"resolution": "..."}`.
6. Once you're done with the whole batch: `POST /api/broadcast-reload` — this pushes a
   reload to any open browser tab, which preserves and restores whatever page/step was
   active before reloading.
7. Report back to the user, per card: what you changed, or why you flagged it instead.

## Hard rule

**Never call `POST /api/cards/:id/complete`.** That is the only endpoint that sets a card's
status to `"done"`, it requires a header (`X-Board-Client: true`) that only the Kanban
board sends, and moving a card to "הושלם" is exclusively the user's call, made by clicking
the button on the board. This applies even if a generic status PATCH would otherwise seem
to allow it — it explicitly rejects `{"status":"done"}` for this reason.

## Removing this feature entirely

1. `rm -rf fix-engine/`
2. Delete the `<script src="fix-engine/client.js" defer></script>` line from `index.html`.
3. Delete the `🛠 תיקונים` topbar link from `index.html`.
4. (Optional, inert either way) revert the `data-area`/`data-src` attributes sprinkled
   through `index.html`, and the two `el.dataset.area/src` lines inside `addCaseBlock()`
   and `buildRtCards()`.
