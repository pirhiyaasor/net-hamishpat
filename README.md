# עוזר AI לפורטל שופטים · net-hamishpat

צ׳אט עזר מבוסס AI לפורטל המידע לשופטים (מערכת "שרביט" / "נט המשפט"). בעברית, RTL,
רספונסיבי מדסקטופ ועד רוחב טאבלט. נכתב ב‑**Angular 22** (standalone, zoneless, signals)
עם **Tailwind CSS**.

שתי הצגות:

- **`/`** – "סצנת דסקטופ": צילום מסך הפורטל (`assets/desktop.png`) כרקע מלא, הצ׳אט מעוגן
  בפינה הימנית‑תחתונה, והדמות המאויירת (`assets/character.png`) נשענת על חלונית הצ׳אט.
  כפתור הסגירה מקפל את הצ׳אט לבועה צפה; לחיצה עליה פותחת אותו מחדש.
- **`/chat`** – ממשק הצ׳אט המלא בפני עצמו. זהו גם היעד שנפתח ב**חלון דפדפן נפרד**
  (`window.open`) כשהווידג׳ט המוטמע רץ במצב `window`.

## הרצה

```bash
npm install
npm start          # http://localhost:4200
```

## מבנה

| נתיב | תיאור |
| --- | --- |
| `src/app/desktop-scene/desktop-scene.component.ts` | סצנת הדסקטופ: רקע `desktop.png`, צ׳אט מעוגן בפינה, דמות `character.png` נשענת עליו, קיפול לבועה. |
| `src/app/chat/chat-window.component.ts` | חלונית הצ׳אט: header עם אווטאר, empty‑state עם שאלות הכוונה, רשימת הודעות, קלט, כפתור "שאלות הכוונה". `[embedded]` קובע גובה (מעוגן מול מסך מלא). |
| `src/app/chat/chat-launcher.component.ts` | הבועה הצפה + האווטאר. `mode="window"` פותח `/chat` ב‑`window.open`; `mode="inline"` פולט `activate` כדי שהמארח יפתח פאנל מעוגן. |
| `src/app/chat/message-list.component.ts` | בועות הודעה, אינדיקציית הקלדה, גלילה אוטומטית תוך כדי סטרימינג. |
| `src/app/chat/message-input.component.ts` | textarea עם autosize; Enter = שליחה, Shift+Enter = שורה חדשה. |
| `src/app/chat/guiding-questions.component.ts` | צ׳יפים לחיצים של שאלות לדוגמה, מקובצים לפי נושא. |
| `src/app/chat/guiding-questions.data.ts` | רשימת השאלות דרך `GUIDING_QUESTIONS` (InjectionToken – ניתן לדריסה). |
| `src/app/chat/chat.service.ts` | **שירות mock**. `sendMessage(text): Observable<ChatChunk>` – מזרים תשובה מילה‑מילה ומעדכן `messages` (signal). |
| `src/app/chat/chat-assets.ts` | נתיבי התמונות (`avatar.png`, `character.png`, `desktop.png`). |
| `public/assets/` | התמונות. ראו `public/assets/README.md` להחלפה. |

## החלפת התמונות

שמרו קבצים חדשים ב‑`public/assets/` באותם שמות (`avatar.png` / `character.png` / `desktop.png`),
או עדכנו את הנתיבים ב‑`src/app/chat/chat-assets.ts`. אם משתמשים בתמונת דמות אחרת ללא
"חלונית צ׳אט" מובנית בתוכה – ייתכן שיהיה צורך לכוון את חיתוך המסגרת ואת ההיסט
ב‑`desktop-scene.component.ts` (`w-[…]`, `h-[…]`, `start-[…]`).

## החלפת ה‑mock ב‑AI אמיתי

יש לממש מחדש רק את גוף `ChatService.sendMessage` כך שיחזיר `Observable<ChatChunk>`
(`{ delta, done }`) מקריאת רשת/stream, וימשיך לעדכן את ה‑signal `messages`. שאר הרכיבים
לא משתנים.

## הטמעה בפורטל האמיתי (Web Component)

```bash
npm run build:widget      # dist/widget/
```

הפורטל מוסיף include אחד + את התג:

```html
<script type="module" src="/widget/main.js"></script>
<judges-ai-chat-launcher
  chat-url="https://ai-chat.example.gov.il/chat"
  align="start"
></judges-ai-chat-launcher>
```

- `chat-url` – כתובת מסך הצ׳אט שייפתח בחלון הנפרד (ברירת מחדל: `chat` יחסית ל‑baseHref).
- `align` – `start` (ימין ב‑RTL) או `end` (שמאל ב‑RTL).

## בדיקות

```bash
npm test        # Vitest (jsdom) – src/app/chat/chat.service.spec.ts
```
