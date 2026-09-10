# מדריך הטמעה · עוזר AI לפורטל השופטים

מסמך זה מיועד לצוות שמטמיע את הצ׳אט בפורטל האמיתי ("שרביט" / נט המשפט).

- **קוד:** branch `claude/judges-portal-ai-chat-33246a`, תגית `v0.1.0`.
- **הדגמה חיה (ספֵק אינטראקטיבי):** https://judges-portal-ai-chat-33246a.vercel.app
- **דרישות:** Angular ≥ 20 (פותח על 22), Tailwind CSS. RTL.

> `src/app/desktop-scene/` הוא **הדגמה בלבד** (רקע צילום‑מסך + עיגון פינה + הדמות הנשענת).
> לא להטמיע אותו. ההטמעה = `chat-launcher` + `chat-window` + `ChatService`.

---

## בחירת דרך

| | דרך A · רכיבי Angular | דרך B · Web Component |
| --- | --- | --- |
| מתי | הפורטל ב‑Angular | הפורטל לא ב‑Angular / רוצים בידוד מלא |
| מה מטמיעים | מעתיקים את `src/app/chat/` לפרויקט | תג `<script>` + אלמנט אחד |
| עיצוב | ממזגים את `theme.extend` מ‑`tailwind.config.js` | CSS מגיע בבנדל |
| חלון הצ׳אט | route פנימי `/chat`, או פאנל מעוגן | נפתח ב‑`window.open` מכתובת שאתם מארחים |

---

## דרך A — רכיבי Angular

### 1. העתקת קוד

מעתיקים את התיקייה **`src/app/chat/`** כפי שהיא. הקבצים:

| קובץ | תפקיד |
| --- | --- |
| `chat-launcher.component.ts` | הבועה הצפה + האווטאר. הטריגר לפתיחה. |
| `chat-window.component.ts` | חלונית הצ׳אט המלאה. |
| `message-list.component.ts` / `message-input.component.ts` / `guiding-questions.component.ts` | רכיבי משנה. |
| `chat.service.ts` | **שירות ה‑mock — כאן מחליפים ל‑API אמיתי (ר׳ סעיף 4).** |
| `chat.models.ts` | טיפוסים (`ChatMessage`, `ChatChunk`, `GuidingQuestion*`). |
| `guiding-questions.data.ts` | `GUIDING_QUESTIONS` (InjectionToken) + רשימת ברירת המחדל. |
| `open-assistant-window.ts` | עוזר `window.open` לחלון נפרד. |
| `chat-assets.ts` | נתיבי תמונות. |

מעתיקים גם `public/assets/avatar.png` ו‑`character.png` (הרקע `desktop.png` לא נחוץ בהטמעה).

### 2. Tailwind

הרכיבים משתמשים ב‑utility classes עם ערכי theme מותאמים (`bg-primary`, `text-text-subtle`,
`shadow-window`, `animate-dot-bounce`, `font-base`, `rounded-md` דרוס וכו׳). **חובה** למזג את
בלוק `theme.extend` מ‑`tailwind.config.js` שבריפו לקונפיג של הפורטל (colors, `fontFamily.base`,
`borderRadius`, `boxShadow`, `keyframes`, `animation`), ולוודא שה‑`content` סורק את קבצי הרכיבים.

גופנים: להוסיף ל‑`index.html` את ה‑`<link>` ל‑`Noto Sans Hebrew` + `Assistant` (ר׳ `src/index.html`).

### 3. שילוב בממשק

**בועה גלובלית** — ב‑shell/root של הפורטל:

```html
<!-- פותח את /chat בחלון דפדפן נפרד -->
<app-chat-launcher align="start" [chatUrl]="'/chat'" />
```

**ה‑route של חלון הצ׳אט:**

```ts
{ path: 'chat', loadComponent: () =>
    import('./chat/chat-window.component').then(m => m.ChatWindowComponent) }
```

**חלופה — פאנל מעוגן בתוך הדף** (כמו בהדגמה), בלי חלון נפרד:

```html
@if (assistantOpen()) {
  <div class="fixed bottom-0 start-0 z-40 h-[min(600px,100dvh)] w-[min(94vw,380px)]
              overflow-hidden rounded-t-xl border border-b-0 border-border bg-bg shadow-window">
    <app-chat-window [embedded]="true"
                     (closeRequested)="assistantOpen.set(false)"
                     (popOut)="popOutToWindow()" />
  </div>
} @else {
  <app-chat-launcher mode="inline" align="start" (activate)="assistantOpen.set(true)" />
}
```

### 4. חיבור ל‑AI אמיתי

מחליפים **רק את גוף** `ChatService.sendMessage`. החוזה נשאר:

```ts
sendMessage(text: string): Observable<ChatChunk>   // ChatChunk = { delta: string; done: boolean }
```

מה שהמתודה חייבת לעשות (כמו במימוש ה‑mock):
1. להוסיף ל‑signal `messages` הודעת משתמש, ואז הודעת assistant ריקה עם `streaming: true`.
2. להזרים את התשובה: לכל chunk — לצרף `delta` ל‑`text` של הודעת ה‑assistant, ולסמן
   `streaming: !done`; ב‑`done` לאחרונה לכבות `isResponding`.
3. להחזיר `Observable<ChatChunk>` שמשלים כש‑`done === true`.

`messages` ו‑`isResponding` הם signals לקריאה מה‑UI. אין צורך לגעת ברכיבים.

### 5. שאלות הכוונה

לדריסת הרשימה — מזריקים ב‑app config:

```ts
providers: [
  { provide: GUIDING_QUESTIONS, useValue: [
      { title: 'הזמנות תרגום', questions: [{ label: 'איך מוסיפים הזמנת תרגום לדיון?' }, /* ... */] },
      /* ... */
  ] },
]
```

### הערות

- הרכיבים `OnPush` + signals — עובדים גם ב‑zoneless וגם עם Zone.js.
- `chat-window` בלי `[embedded]` ממלא `100dvh` (מתאים ל‑route ייעודי); עם `[embedded]="true"`
  ממלא `100%` מגובה ההורה (מתאים לפאנל מעוגן).
- `(popOut)` נפלט מכפתור "פתיחה בחלון נפרד" (מוצג רק במצב `embedded`). לטיפול:
  `openAssistantWindow('/chat')` מ‑`open-assistant-window.ts`.

---

## דרך B — Web Component

```bash
npm run build:widget          # פלט: dist/widget/browser/  (main.js, styles.css, assets/)
```

מארחים את תוכן `dist/widget/browser/` בנתיב סטטי (למשל `/assistant-widget/`), ובנוסף
מארחים איפשהו את האפליקציה המלאה כדי שיהיה `/chat` לפתיחה (למשל ה‑deploy ב‑Vercel).

בדף הפורטל:

```html
<script type="module" src="/assistant-widget/main.js"></script>

<judges-ai-chat-launcher
  chat-url="https://<הכתובת-של-מסך-הצ׳אט>/chat"
  align="start"
></judges-ai-chat-launcher>
```

מאפיינים (attributes):

| attribute | ברירת מחדל | תיאור |
| --- | --- | --- |
| `chat-url` | `chat` יחסית ל‑baseHref | הכתובת שנפתחת ב‑`window.open` בלחיצה על הבועה |
| `align` | `end` | `start` = ימין ב‑RTL, `end` = שמאל |
| `mode` | `window` | `window` = חלון נפרד; `inline` = פולט אירוע `activate` במקום לפתוח |

> ה‑Web Component רושם את **הבועה בלבד**. חלונית הצ׳אט עצמה חיה במסך `/chat` של האפליקציה
> המלאה — צריך לפרסם אותה ולכוון אליה את `chat-url`.

---

## מה עדיין לא נכלל (למודעות הצוות)

- **`ChatService` הוא mock** — תשובות דמה לפי מילות מפתח + סטרימינג מדומה. אין קריאת רשת, אימות
  או ניהול שגיאות רשת.
- **`desktop.png` + סצנת הדסקטופ** — חומר הדגמה, לא לפרודקשן.
- **סנכרון בין הבועה לחלון ה‑`window.open`** — אין; כל חלון הוא session נפרד של `ChatService`.
  אפשר להוסיף `BroadcastChannel`/`sessionStorage` בהמשך.
- **תמיכה בטלפון (< 768px)** — best effort; הוגדר רספונסיבי עד רוחב טאבלט.
- **נגישות** — יש `aria-label`/`aria-pressed`/`role` בסיסיים; לא עבר audit מלא.
