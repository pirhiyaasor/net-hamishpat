# סקילים ומערכת עיצוב — נט המשפט

> מסמך זה מרכז את כל הרכיבים/תבניות ה־UI ("סקילים") שנבנו ונעשה בהם שימוש בפרויקטי נט המשפט, ובסופו — את מערכת העיצוב המלאה (טוקנים, צבעים, טיפוגרפיה, רכיבים) כפי שהיא קיימת בפועל בקוד. המטרה: בסיס ל־PRD שיאפשר לסוכני AI לייצר מסכים חדשים בעקביות מלאה עם מה שכבר קיים.

**מקור אמת לעיצוב (עודכן 16.9.2026):** `styles.css` — מערכת הטוקנים שהוצגה ל"Chat-Monday" (מבוססת monday.com Vibe) — הוכרז כמקור אמת יחיד לצבע ולטיפוגרפיה **לכל נט המשפט**, כולל מה שהיה עד היום ב־`index.html`. **צבע המותג הראשי הוא מעכשיו נייבי מוסדי `#0A3B8F`** (לא `#1A56DB` הישן). כל הקבצים הרלוונטיים עודכנו בהתאם — פירוט מלא בסעיף 4.9 ובטבלת השינויים שם.

**נסרקו 3 ריפואים:**

| ריפו | נתיב | תפקיד |
|---|---|---|
| `net-hamishpat` | `~/net-hamishpat` | האפליקציה הראשית (production) — אשף הגשות, מעקב, תשלום |
| `netam-design-system` | `~/netam-design-system` | מסמך עיצוב ייחוס (`design.md`) |
| `popup screen_net` | `~/popup screen_net` | פרוטוטייפ מסך פופ־אפ בודד (הזמנת מתורגמן) |
| `fix-engine` | `~/net-hamishpat/fix-engine` | כלי פנימי (לוח קנבן לניהול תיקונים) — לא חלק מהממשק הפונה לאזרח |

✅ **עודכן (2026-09-16, בשני סבבים):** סבב 1 — `design.md` ו־`popup screen_net/index.html` יושרו לטוקני ה־production הישנים (`#1A56DB`). סבב 2 — עם הגעת `styles.css` והחלטה מפורשת שהוא מחליף את כל מה שהיה עד היום: **גם `index.html` עצמו**, וגם `design.md`/`popup screen_net`, עודכנו לצבע המותג החדש `#0A3B8F`. ראו סעיף 4.9.

---

## 1. קטלוג סקילים — net-hamishpat (האפליקציה הראשית)

כולם חיים כרגע בקובץ יחיד `index.html` (2,208 שורות: CSS inline בשורות 11–404, JS inline בשורות 1160–2206). "תדירות שימוש" = מספר המופעים בפועל בקוד הנוכחי. "קומיט אחרון" לפי `git log`.

### 1.1 שלד ניווט

| סקיל | תיאור | תדירות | קומיט אחרון |
|---|---|---|---|
| **Gov Topbar** (`.gov-topbar`, `.gov-login-btn`) | סרגל עליון עם לוגו מערכת, קישורים, כפתור התחברות | פעם אחת (גלובלי) | `dd229d7` |
| **Subnav + Side Rail** (`.subnav`, `.nav-btn`, `.side-rail`) | ניווט תת־עליון + סרגל צד קבוע (78px, קורס ל־52px במובייל) | פעם אחת (גלובלי) | `9b00120` |
| **Page switcher** (`showPage()`, `.page.active`) | מעבר בין 4 "עמודים" ראשיים באותו קובץ (`page-submit`/`page-payment`/`page-govpay`/`page-history`) | 4 עמודים | `e42aff4` |

### 1.2 אשף הגשה (Wizard)

| סקיל | תיאור | תדירות | קומיט אחרון |
|---|---|---|---|
| **Wizard 5 שלבים** (`.wizard`, `.wizard-step`, `.step-circle`, `.wizard-line`, `goTo(n)`) | אשף רב־שלבי: סוג הגשה → הגשת מסמכים → פרטי קשר → אגרת בית משפט → תשלום וסיום | 5 שלבים, ליבת האפליקציה | `43ddaa7` (פיצול ל־5 שלבים), עודכן ב־`dd229d7` |
| **Action Tiles** (`.action-grid`, `.action-tile`, `pickAction()`) | גריד בחירה ויזואלי (3 טורים) לבחירת סוג הגשה/פעולה | 3 שימושים | `1be6b8e` |
| **Case Field Reveal** (`.case-field-wrap.show`, אנימציית `inputPop`) | חשיפה מדורגת (spring easing) של שדות תיק לאחר בחירת פעולה | שימוש חוזר בשלב 1 | `dd229d7` |
| **Fee Calculator Modal** (`toggleFeeCalc()`, `calcFeeFromModal()`, `.fee-calc-body`) | מחשבון אגרה מתקפל, כולל "פטור מאגרה"/"לא צד להליך" | שלב 4 | `43ddaa7` |

### 1.3 שדות וקלט חכם

| סקיל | תיאור | תדירות | קומיט אחרון |
|---|---|---|---|
| **Field base** (`.field`, `.field-invalid`) | שדה טופס בסיסי עם label, focus ring כחול, מצב שגיאה אדום | 10 מופעים | `dd229d7` |
| **Case Autocomplete** (`.case-combo`, `caseComboEls/renderCaseOptions/onCaseInput/pickCase`) | קומבובוקס לחיפוש תיק קיים לפי מספר/צד, ניווט מקלדת (חצים/Enter/Esc) | שלב "תיק קיים" | `cb7f006` |
| **City Autocomplete** (`.case-combo` reused, `cityComboEls/renderCityOptions/onCityInput/pickCity`) | קומבובוקס לחיפוש עיר (אותה תבנית ויזואלית כמו Case Autocomplete — שימוש חוזר במתכוון) | שדה כתובת | `3d5e6c9` (הכי חדש) |
| **Multi-Case Blocks** (`.case-block/.cb-header/.cb-num/.cb-body`, `addCaseBlock/renumberCases`) | הוספת/הסרת מספר תיקים לאותה הגשה, ממוספר אוטומטית | דינמי (0..n) | `dd229d7` |
| **Voucher Validation** (`toggleVoucherField/isVoucherValid/validateVoucher`) | שדה קוד שובר עם ולידציה מיידית | שלב תשלום | `1be6b8e` |
| **Info Tooltip** (`.info-tip`, `.info-tip-bubble`) | אייקון (i) עם בועת הסבר ב־hover/focus, נגיש למקלדת | 4 מופעים | `dd229d7` |

### 1.4 מסמכים וקבצים

| סקיל | תיאור | תדירות | קומיט אחרון |
|---|---|---|---|
| **Upload Zone** (`.upload-zone`, `addFileTo()`) | אזור גרירה/העלאה עם מצב `.invalid` לקובץ חובה חסר | 2 מופעים (רגיל + `.sm`) | `69749dc` |
| **File List** (`.file-list/.file-item/.file-badge/.file-remove`) | רשימת קבצים שהועלו, badge בר־hover שהופך לעין (תצוגה מקדימה) | דינמי | `dd229d7` |
| **PDF Preview** (`viewFilePdf()`, `openDocPreview()`) | תצוגה מקדימה של מסמך שהוגש | 2 הקשרים (הגשה + מעקב) | `dd229d7` |

### 1.5 תשלום

| סקיל | תיאור | תדירות | קומיט אחרון |
|---|---|---|---|
| **Payment Method Select** (`.pay-method-opt`, `onPayMethodChange()`) | רדיו לבחירת אמצעי תשלום (כרטיס/שובר/פטור) | שלב 5 | `1be6b8e` |
| **gov.il Mock Payment** (`#page-govpay`, `.gov-*` — פלטת צבע ו־layout נפרדים לגמרי) | חיקוי מכוון של מסך תשלום ממשלתי חיצוני (Stepper, שדות כרטיס, RTL הפוך בחלקים) — **במתכוון לא** תואם את שפת העיצוב הפנימית, כדי לדמות מעבר למערכת צד־שלישי | עמוד שלם | `3d5e6c9` (הכי חדש) |
| **Payment Return Flow** (`goToPaymentReturn/goToGovPay/payGovAndFinish`) | ניווט חזור־קדימה בין האפליקציה לדף התשלום המדומה | — | `e42aff4` |
| **Toast הצלחה** (`.toast`, `showSuccessToast()`) | הודעת אישור צפה עם מספר אסמכתא | לאחר כל שליחה מוצלחת | `dd229d7` |

### 1.6 מעקב הגשות בזמן אמת (Tracking)

| סקיל | תיאור | תדירות | קומיט אחרון |
|---|---|---|---|
| **RT Cards** (`.rt-card`, `toggleRtCard/buildRtCards/createRtCardEl`) | כרטיסי מעקב מתקפלים לכל הגשה פעילה, עם chevron | 5 מופעי class | `8969766` (רסטייל) |
| **Stage Track** (`.stage-track/.stg-dot/.stg-line`, `buildStageTrack()`) | פס התקדמות שלבים עם מצבי done/active/error ואנימציית ripple | לכל כרטיס RT | `dd229d7` |
| **סימולציית זמן־אמת** (`initRealtime/doTick/resetRealtime/updateLastRoundHour`) | טיקר שמדמה התקדמות סטטוסים לאורך זמן (לצורכי דמו) | גלובלי | `dd229d7` |
| **Filter Bar** (`.filter-bar/.filter-chip`, `filterRTStatus/filterRT/filterRTSearch`) | סינון לפי סטטוס + תאריך (טווח מותאם) + חיפוש טקסט חופשי | 10 מופעי chip, בשני האזורים (מעקב+היסטוריה) | `3dab41c` |
| **Date Range Menu** (`.rt-date-filter`, `toggleRTDateMenu/selectRTDate/applyRTDateRange`) | תפריט בחירת טווח תאריכים מותאם אישית | חוזר גם ב־Receipts (`RC*`) | `3dab41c` |
| **Error Box** (`.rt-err-box`, `startResubmit()`) | תיבת שגיאה מפורטת עם כפתור "הגשה מחדש" שפותח מודל סיבה | מצב שגיאה בלבד | `cb7f006` |

### 1.7 היסטוריה/קבלות (Receipts)

| סקיל | תיאור | תדירות | קומיט אחרון |
|---|---|---|---|
| **Receipt Cards** (`.receipt-card/.receipt-row/.receipt-ind`), `toggleR()` | כרטיס קבלה מתקפל עם פס צבע סטטוס בצד | 3 מופעי class | `8969766` |
| **Pagination** (`.rc-pagination/.rc-page-btn/.rc-page-num`, `rcChangePage()`) | דפדוף עמודים עגול | עמוד היסטוריה | `43ddaa7` |
| **Badge (סטטוס)** (`.badge`, `.b-s/.b-e/.b-p`) | תגית סטטוס עגולה (הצליח/נכשל/בתהליך) | 3 מופעים | `43ddaa7` |

### 1.8 מודלים

| סקיל | תיאור | תדירות | קומיט אחרון |
|---|---|---|---|
| **Modal בסיסי** (`position:fixed;inset:0;background:rgba(0,0,0,.45)`) | תבנית מודל סטנדרטית: overlay שחור שקוף + כרטיס במרכז | 2 מודלים קיימים (`authority-types-modal`, `req-types-modal`) — **התבנית שהראשונה קבעה נשמרת לכל השאר** | `dd229d7` |
| **Resubmit-Reason Modal** | מודל בחירת סיבת הגשה מחדש, נפתח מתוך Error Box | 1 | `cb7f006` (הכי חדש) |

**סה"כ פונקציות JS מזוהות ב־`index.html`:** ~70 (ניווט/אשף/ולידציה/מעקב/סינון/מודלים) — [index.html](index.html).

---

## 2. פרויקט נלווה: `popup screen_net`

מסך פופ־אפ בודד ("הוספה ועדכון הזמנת תרגום לדיון") — [popup screen_net/index.html](../popup%20screen_net/index.html). נבנה עם **Tailwind CDN**. עודכן פעמיים ב־2026-09-16: תחילה יושר ל־`#1A56DB` (טוקני production הישנים), ולאחר מכן ל־`primary:#0a3b8f` (טוקני `styles.css` הסופיים) — פונט Rubik, radius `6px/10px`. ראו סעיף 4.9.

---

## 3. כלי פנימי: `fix-engine`

לוח קנבן פנימי לניהול תיקוני קוד ([fix-engine/board.html](fix-engine/board.html), `board.js`, `client.js`, `server.js`) — פונט Segoe UI, פלטת אפור/סגול נפרדת לגמרי. **לא חלק מהממשק הפונה לאזרח** ולכן לא רלוונטי לאימון סוכני UI, אך מוזכר להשלמת התמונה. נוסף ב־`8969766`, קישור הניווט אליו הוסר ב־`9b00120`.

---

## 4. מערכת העיצוב — טוקנים ורכיבים בפועל

### 4.1 צבעים — net-hamishpat (production, עודכן ל־`styles.css`)

```css
:root{
  /* Brand — aligned to styles.css (Chat-Monday / Vibe) navy, 2026-09-16 */
  --blue:#0A3B8F;--blue-light:#E8EFF9;--blue-mid:#CFDCF0;--blue-hover:#082E6F;
  --green:#057A55;--green-light:#DEF7EC;
  --red:#C81E1E;--red-light:#FDE8E8;
  --yellow:#8E4B10;--yellow-light:#FDF6B2;
  --gray-50:#F9FAFB;--gray-100:#F3F4F6;--gray-200:#E5E7EB;
  --gray-300:#D1D5DB;--gray-400:#9CA3AF;--gray-500:#6B7280;
  --gray-600:#4B5563;--gray-700:#374151;--gray-800:#1F2937;--gray-900:#111827;
  --radius:10px;--radius-sm:6px;
  --shadow:0 1px 2px rgba(16,24,40,0.04),0 1px 1px rgba(16,24,40,0.03);
}
body{font-family:'Rubik','Segoe UI',Roboto,sans-serif;background:#F5F8FC;font-size:15px;line-height:1.6}
```
מקור: [index.html:11–404](index.html). `--blue` (וכל מה שנגזר ממנו: hover, rgba של focus rings, ה־`.gov-topbar`/`.gov-login-btn` שהם ה־chrome הפנימי שלנו — **לא** להתבלבל עם `gov.il Mock Payment` הנפרד בכוונה בסעיף 4.6) הוחלף מ־`#1A56DB` ל־`#0A3B8F` בכל הקובץ, כולל הערכים המוטבעים שלא עברו דרך המשתנה (`rgba(26,86,219,…)`→`rgba(10,59,143,…)`, `#1645b5`/`#1646b8`→`var(--blue-hover)`, `#dbeafe`→`var(--blue-mid)`).

### 4.2 טיפוגרפיה — production

- **פונט:** `'Rubik','Segoe UI',Roboto,sans-serif` (סטאק מיושר ל־`styles.css`; עדיין נטען מ־Google Fonts — ראו פער בסעיף 4.9).
- **בסיס:** `15px`, `line-height:1.6`.
- כותרת כרטיס: `16px/600`; תיאור: `13px`; תגיות/badges: `11–12px/700`; מטא: `12px`.
- גדלי הפיקסלים הקיימים בקוד **לא** נכפו לסולם המדויק של `styles.css` (`12/14/16/18/24/30/40`) — הם קרובים אליו אך לא זהים; מיישור מלא ראו פעולת המשך בסעיף 5.

### 4.3 Spacing & Radius — production

| טוקן | ערך |
|---|---|
| `--radius` | `10px` (כרטיסים, כפתורים) |
| `--radius-sm` | `6px` (שדות, badges קטנים) |
| `--shadow` | `0 1px 2px rgba(16,24,40,.04), 0 1px 1px rgba(16,24,40,.03)` |
| רוחב container | `780px` |
| ריווח כרטיס | `1.5rem` פנימי, `1rem` בין כרטיסים |

### 4.4 רכיבי כפתור/שדה — production

```css
.btn{padding:10px 22px;border-radius:var(--radius-sm);font-weight:600}
.btn-ghost{background:#fff;color:var(--gray-600);border:1.5px solid var(--gray-200)}
.btn-primary{background:var(--blue);color:#fff}
.btn-success{background:var(--green);color:#fff}

.field input,.field select,.field textarea{
  padding:9px 13px;border:1.5px solid var(--gray-200);border-radius:var(--radius-sm);font-size:14px;
}
.field input:focus{outline:none;border-color:var(--blue);box-shadow:0 0 0 3px rgba(10,59,143,.1)}
.field input.field-invalid{border-color:var(--red)}
```

### 4.5 ✅ שפת עיצוב שנייה — תוקנה (ואז עודכנה שוב לנייבי)

`netam-design-system/design.md` (§2/§3/§13) ו־`popup screen_net/index.html` (Tailwind config + `<style>`) היו בנויים על פלטה/פונט שונה, שמקורם בתצפית על מסך לא־קשור (`Studio OS / Mishpat / Lab` — עוזר AI). שני הקבצים עברו שני עדכונים ב־2026-09-16:

| | לפני | סבב 1 | סבב 2 (סופי) |
|---|---|---|---|
| פונט | Noto Sans Hebrew, Assistant | `Rubik` בלבד | `Rubik` בלבד (ללא שינוי) |
| כחול ראשי | `#1B5BBE` | `#1A56DB` | **`#0A3B8F`** (טוקן `styles.css`) |
| radius | `8–16px` (סולם sm/md/lg) | `6px`/`10px` | `6px`/`10px` (ללא שינוי) |

סעיפי `design.md` שמתארים קומפוננטות (5.1–5.9, Layout, מיקרוקופי) עדיין מתארים את מסך ה־AI ולא רכיבי net-hamishpat בפועל — לרכיבים האמיתיים ראו סעיף 1 במסמך זה.

### 4.6 gov.il Mock Payment — פלטה שלישית, נפרדת במתכוון

```css
.gov-header{background:#0a4595}
.gov-dot.done,.gov-dot.active{background:#1a73c7;border-color:#1a73c7}
.gov-paybtn{background:#d3d7dd;color:#7b828b} /* כפתור "מנוטרל" עד מילוי טופס */
```
מקור: [index.html:351–403](index.html). זו **פלטה שלישית ונפרדת בכוונה** — משמשת רק לחיקוי מסך תשלום ממשלתי חיצוני, ואסור לערבב אותה עם שפת העיצוב הפנימית.

### 4.7 אייקונים

- ספריה: [Lucide](https://lucide.dev) (`lucide@0.383.0` דרך CDN, `data-lucide="..."`), 14 שימושים ב־`index.html`.
- קווי, דק, ~16–20px.

### 4.8 מצבי UI קיימים בפועל

| מצב | איפה מיושם |
|---|---|
| Loading/סימולציה | `doTick()` — טיקר שמקדם סטטוסים לאורך זמן |
| Error | `.rt-err-box`, `.err-panel`, `.field-invalid` |
| Empty (סינון ללא תוצאות) | לוגיקת `applyRTFilters`/`applyRCFilters` (לבדוק שיש הודעת "אין תוצאות" — **לא אותרה הודעת empty-state ייעודית בקוד**, פער מול הנחיית `design.md` סעיף 9) |
| הצלחה | `.toast` + `showSuccessToast()` |

### 4.9 ✅ `styles.css` — מקור האמת הרשמי לצבע/טיפוגרפיה (הוחלט 2026-09-16)

מקור: [styles.css](styles.css), נוסף לריפו ב־16.9.2026. לפי התיעוד הפנימי שלו נבנה במקור עבור ממשק הודעות/צ'אט ("Chat-Monday") על גבי מערכת העיצוב **Vibe** של monday.com, עם התאמות מותג של הרשות השופטת — אבל הוחלט במפורש שהוא **מחליף את כל טוקני הצבע/טיפוגרפיה שהיו ידועים עד כה בכל נט המשפט**, לא רק בתכונת הצ'אט.

**מה בוצע בפועל בעקבות ההחלטה:**

| קובץ | מה השתנה |
|---|---|
| [index.html](index.html) §`:root` | `--blue` (וכל מה שנגזר ממנו) הוחלף מ־`#1A56DB` ל־`#0A3B8F`; נוסף `--blue-hover:#082E6F`; כל הערכים המוטבעים (לא-משתנים) עודכנו גם הם (ראו 4.1) |
| [netam-design-system/design.md](../netam-design-system/design.md) | כחול ראשי/בהיר/בינוני עודכנו ל־`#0A3B8F`/`#E8EFF9`/`#CFDCF0` |
| [popup screen_net/index.html](../popup%20screen_net/index.html) | Tailwind `primary`/`primary-hover`/`primary-soft` עודכנו ל־`#0a3b8f`/`#082e6f`/`#e8eff9` |
| [index.html](index.html) §`<head>` | ✅ **`styles.css` מקושר בפועל** — `<link rel="stylesheet" href="styles.css">`, ממוקם **לפני** קישור Google Fonts, כדי ש-@font-face התקין של Google (שנטען אחריו) יזכה בעדיפות על פני ה-@font-face השבור והמקומי של `styles.css` על אותם unicode-ranges. נבדק בדפדפן: הרנדור זהה לחלוטין (עברית, פריסה, צבעים) וללא בקשות רשת ל-woff2 שבורים כלל — הדפדפן פשוט לא נזקק להם. |

**מה עדיין פתוח:**

- קובצי הגופן ה-self-hosted שאליהם `styles.css` מפנה (`assets/*.woff2`) **לא קיימים בפועל** ב־`net-hamishpat/assets/` (יש שם רק `logo.png`) — כרגע זה לא-מזיק כי Google Fonts מכסה את אותו הטווח, אבל זו תלות חיצונית ש-`styles.css` עצמו נועד לבטל.
- סולם הטיפוגרפיה המלא של `styles.css` (spacing/`--h1`.../motion tokens) **לא הוזרם** לתוך כל רכיבי `index.html` פיקסל-בפיקסל — רק צבעי הליבה הוחלפו וה־stylesheet קושר, כדי לא לגרום לרגרסיה ויזואלית רחבה בקובץ של 2,200 שורות בלי בדיקת QA מלאה.

ראו המלצות מעודכנות בסעיף 5.

**צבעי מותג (Chat-Monday brand override):**

| טוקן | ערך | שימוש |
|---|---|---|
| `--brand-navy` | `#0A3B8F` | כחול-נייבי מוסדי — צבע מותג ראשי ("נט המשפט") |
| `--brand-navy-hover` | `#082E6F` | hover על נייבי |
| `--brand-navy-deep` | `#062356` | נייבי כהה (חותם/מסווג) |
| `--brand-azure` | `#2A6FDB` | לינקים/הדגשות (accent, לא הצבע הראשי) |
| `--brand-azure-hover` | `#1F5CBA` | hover על azure |
| `--brand-tint` | `#E8EFF9` | רקע עדין (surface wash) |
| `--brand-tint-strong` | `#CFDCF0` | רקע נבחר/הדגשה |
| `--brand-gold` | `#C8A24A` | חותם/הדגשה מיוחדת |
| `--vibe-primary` | `#0073EA` | כחול Vibe המקורי — **נשמר רק לתאימות רכיבים**, לא בשימוש ויזואלי בפועל (מוחלף ע"י `--brand-navy`) |

**צבעי טקסט/רקע/גבול:**

| טוקן | ערך |
|---|---|
| `--primary-text-color` | `#323338` |
| `--secondary-text-color` | `#676879` |
| `--tertiary-text-color` | `#9699A6` |
| `--primary-background-color` | `#FFFFFF` |
| `--allgrey-background-color` / `--grey-background-color` | `#F6F7FB` |
| `--ui-border-color` | `#C3C6D4` |
| `--layout-border-color` | `#D0D4E4` |
| `--backdrop-color` | `rgba(41,47,76,.7)` |

**צבעי מצב (semantic):** `--positive-color:#00854D` · `--negative-color:#D83A52` · `--warning-color:#FDAB3D`.

**פלטת תוויות/אווטארים (Vibe Working colors, 13 גוונים):** ירוק-דשא/ירוק-בוצע/ירוק-בהיר, צהוב-ביצה, כתום-עבודה/כתום-כהה, אדום-תקוע, ורוד, סגול, אינדיגו, נייבי-תווית, כחול-בהיר/כהה, טורקיז.

**צבעים ייעודיים לצ'אט:** בועת "אני" = `--brand-navy`/לבן; בועת "אחר" = `#F0F1F5`; בועת מערכת = `#FFF8E6`/`#6B5300`; אזכור (`@mention`) = `--brand-azure`; פס "מסווג" = `#062356`.

**טיפוגרפיה:**

```css
--font-family: "Rubik", "Segoe UI", Roboto, sans-serif; /* self-hosted woff2, לא Google Fonts CDN */
--font-weight-normal: 400; --font-weight-medium: 500; --font-weight-bold: 600; --font-weight-heavy: 700;
```

סולם גדלים (Vibe): `12/14/16/18/24/30/40px` עם line-heights תואמים (`16/20/22/26/32/42/52px`).

טוקני תפקיד סמנטיים מוכנים לשימוש ישיר (`font: var(--h1)` וכו'):

| טוקן | ערך |
|---|---|
| `--display` | `700 40px/52px` |
| `--h1` | `700 30px/42px` |
| `--h2` | `700 24px/32px` |
| `--h3` | `700 18px/26px` |
| `--h4` | `700 16px/22px` |
| `--h5` | `700 14px/20px` |
| `--body-lg` | `400 16px/24px` |
| `--body` | `400 14px/20px` |
| `--body-sm` | `400 12px/16px` |
| `--label` | `500 13px/18px` |
| `--button` | `500 14px/20px` |

**Spacing:** סולם `2/4/8/12/16/20/24/32/40/48/64/80px`.

**Radius:** `--border-radius-small:4px` · `--border-radius-medium:8px` · `--border-radius-big:16px` · `--border-radius-pill:999px`.

**Shadows:** `--box-shadow-xs/small/medium/large` + `--box-shadow-focus` (טבעת פוקוס `brand-tint`+`brand-azure`).

**Motion:** `--motion-productive-short:70ms` ... `--motion-expressive-long:400ms`, עם עקומות easing ייעודיות (`enter`/`exit`/`transition`/`emphasize`).

✅ **סטטוס סופי:** `#0A3B8F` (לא `#1A56DB`) הוא כעת צבע המותג הראשי היחיד בכל שלושת הקבצים שנסרקו (`index.html`, `design.md`, `popup screen_net/index.html`). ה־`#1A56DB` שמופיע עדיין בהיסטוריית הגרסאות/בקומיטים הישנים הוא ערך שעבר החלפה, לא מקור אמת מתחרה.

---

## 5. המלצות ל־PRD ואימון סוכנים

1. ✅ **מקור אמת יחיד סופי:** `styles.css` — כחול-נייבי `#0A3B8F` הוא צבע המותג בכל net-hamishpat (לא `#1A56DB` הישן). `index.html`, `design.md` ו־`popup screen_net` כולם מיושרים אליו (סעיף 4.9).
2. ✅ **`styles.css` מקושר בפועל** ל־`index.html` (לא רק ערכים מועתקים) — ראו 4.9. שני פערים נותרו פתוחים בכוונה, כ-tickets נפרדים:
   - **(א) קובצי woff2 חסרים:** לא דחוף — Google Fonts כבר מכסה את אותו התוכן ואין רגרסיה. לביטול התלות החיצונית (רלוונטי למערכת ממשלתית שרוצה למזער תלות ב-CDN חיצוני): להשיג/להפיק את שלושת קובצי ה-woff2 המדויקים (חיתוך unicode-range עברית/לטינית/סימנים) ולשים אותם תחת `net-hamishpat/assets/`, בהתאם לשמות הקבצים המדויקים שכבר מוגדרים ב-`styles.css`.
   - **(ב) סולם טיפוגרפיה/spacing מלא:** לא מומלץ מיגרציה גורפת חד-פעמית לכל 2,200 השורות בלי QA ויזואלי מלא — סיכון גבוה מול תועלת. עדיף מיגרציה הדרגתית: כל רכיב חדש נבנה ישירות עם הטוקנים של `styles.css` (`--h1`...`--body-sm`, `--space-*`), ורכיבים קיימים עוברים ליישור רק כשנוגעים בהם בכל מקרה (תיקון/פיצ'ר).
3. **הימנעו מבלבול מול פלטת gov-mock** (`#1a73c7`, `#0a4595`) — זו הפלטה היחידה שנשארת שונה בכוונה (חיקוי מסך תשלום ממשלתי חיצוני), ואסור "לתקן" אותה לשפת המותג.
4. **הטבלה בסעיף 1** יכולה לשמש כ"component library" ישיר ל־PRD — לכל סקיל יש כבר class מוכן, פונקציה, ומיקום בקוד; לפני בניית מסך חדש כדאי לבדוק כאן אם הרכיב כבר קיים לפני שממציאים CSS חדש.
5. **מלאו empty-state חסר** בעמודי מעקב/היסטוריה — לא אותרה הודעת "אין תוצאות" ייעודית בקוד הקיים (ראו 4.8).

---

*מסמך זה נוצר מסריקת קוד בפועל (לא ממסמכי כוונות) בתאריך 2026-09-16. עדכנו אותו בכל פעם שנוסף סקיל/רכיב חדש כדי שישאר מקור אמת.*
