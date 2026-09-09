import { Injectable, signal } from '@angular/core';
import { Observable, concatMap, from, of, timer } from 'rxjs';
import { ChatChunk, ChatMessage } from './chat.models';

interface MockAnswer {
  /** Lowercased keywords; if any appears in the question this answer is used. */
  match: string[];
  text: string;
}

const MOCK_ANSWERS: MockAnswer[] = [
  {
    match: ['הזמנת תרגום', 'מוסיפים הזמנת תרגום', 'הזמנה לתרגום'],
    text: 'כדי להוסיף הזמנת תרגום לדיון: פותחים את התיק, עוברים ללשונית "דיונים", בוחרים את הדיון הרלוונטי ולוחצים על "הזמנת תרגום". בוחרים חברת תרגום, סוג הזמנה (רגיל/דחוף) ושפת תרגום, ואז מזינים את פרטי המתורגמן ואת שעות ההתחלה והסיום. בסיום לוחצים "אישור" והמערכת שולחת את ההזמנה לחברת התרגום.',
  },
  {
    match: ['מתורגמן ממאגר', 'בחירה ממאגר', 'מאגר המתורגמנים'],
    text: 'בחלון הזמנת התרגום, באזור "מתורגמן", לוחצים על "בחירה ממאגר". נפתחת רשימת המתורגמנים המאושרים לפי שפת התרגום שנבחרה. בוחרים מתורגמן והמערכת ממלאה אוטומטית את שדות הזיהוי, השם הפרטי ושם המשפחה. אפשר גם להזין ידנית ולשמור מתורגמן חדש למאגר בכפוף להרשאה.',
  },
  {
    match: ['דחוף', 'דחופה', 'רגילה לדחופה'],
    text: 'הזמנת תרגום "רגילה" מיועדת לדיונים שנקבעו מראש ומאפשרת לחברת התרגום זמן היערכות סטנדרטי. הזמנה "דחופה" מסומנת כך במפורש, מקבלת עדיפות אצל ספק התרגום ודורשת הנמקה קצרה בשדה ההערות. הזמנה דחופה מחוץ לשעות הפעילות מחייבת גם אישור של גורם מוסמך במזכירות.',
  },
  {
    match: ['לבטל', 'מבטלים', 'ביטול הזמנת תרגום'],
    text: 'לביטול הזמנת תרגום: פותחים את ההזמנה הקיימת מתוך הדיון, משנים את "מצב הזמנת תרגום" ל"מבוטלת" ולוחצים "אישור". המערכת מתעדת מי ביטל ומתי, ושולחת עדכון ביטול לחברת התרגום. לא ניתן לבטל הזמנה שכבר סומנה כ"בוצעה".',
  },
  {
    match: ['מועד דיון', 'קובעים מועד', 'דיון חדש'],
    text: 'לקביעת מועד דיון: בתוך התיק עוברים ללשונית "דיונים" ולוחצים "קביעת דיון". בוחרים סוג דיון, אולם ומותב, ומזינים תאריך ושעה. המערכת בודקת התנגשויות ביומן המותב ובאולם ומתריעה אם קיים חפיפה. לאחר שמירה נשלחות הזמנות לצדדים לפי אופן ההמצאה שהוגדר בתיק.',
  },
  {
    match: ['לאתר תיק', 'מאתרים תיק', 'חיפוש תיק', 'מספר תיק'],
    text: 'איתור תיק אפשרי משורת החיפוש העליונה: לפי מספר תיק מלא (סוג-מספר-שנה), לפי שם צד, או לפי מספר זהות. חיפוש מתקדם מאפשר סינון לפי סוג הליך, ערכאה, מותב וטווח תאריכים. תיקים חסויים יופיעו רק למשתמשים בעלי הרשאה מתאימה.',
  },
  {
    match: ['פרוטוקול', 'פרוטוקול דיון'],
    text: 'להפקת פרוטוקול: בתום הדיון, מתוך מסך הדיון לוחצים "הפקת מסמך" ובוחרים "פרוטוקול". ניתן להפיק טיוטה לעריכה או גרסה חתומה. פרוטוקול חתום נעול לשינויים ומתויק אוטומטית בתיק בית המשפט תחת "כתבי בית דין".',
  },
  {
    match: ['הרכב אחר', 'מותב אחר', 'להעביר תיק'],
    text: 'העברת תיק להרכב/מותב אחר מתבצעת דרך "פעולות תיק" → "העברת מותב", ומחייבת ציון עילה (למשל פסלות, איזון עומסים או ריכוז הליכים). ההעברה טעונה אישור נשיא/סגן נשיא, ורק לאחר האישור התיק עובר בפועל ליומן המותב החדש.',
  },
  {
    match: ['מחוץ לשעות', 'בקשה דחופה', 'שעות הפעילות'],
    text: 'בקשה דחופה מחוץ לשעות הפעילות מוגשת דרך "תורנות" בפורטל. הבקשה מנותבת לשופט התורן, ונשלחת אליו התראה. יש לצרף כתב בקשה ונימוק לדחיפות. החלטת ביניים שניתנת בתורנות מתועדת בתיק ומובאת לידיעת המותב הקבוע ביום העסקים הבא.',
  },
  {
    match: ['תיק חסוי', 'הרשאות לצפייה', 'חסוי'],
    text: 'צפייה בתיק חסוי מותנית בשיוך מפורש של המשתמש לתיק, או בהרשאת תפקיד (שופט המותב, עוזר משפטי מוסמך, מזכיר ראשי). כל כניסה לתיק חסוי נרשמת ביומן הביקורת. הרחבת הרשאה נעשית על ידי מנהל ההרשאות במחוז.',
  },
  {
    match: ['חתימה אלקטרונית', 'חתימה להחלטות'],
    text: 'הגדרת חתימה אלקטרונית: בהגדרות המשתמש → "חתימה", מעלים כרטיס חכם או מאשרים חתימה מרחוק. לאחר ההגדרה, בעת מתן החלטה נדרשת הזדהות נוספת (PIN/OTP) והמסמך נחתם ונחתם-חותמת זמן. מסמך חתום אינו ניתן לעריכה ומופץ לצדדים אוטומטית.',
  },
];

const FALLBACK_ANSWER =
  'זו הדגמה של עוזר ה‑AI לפורטל השופטים. במערכת האמיתית התשובה תגיע ממנוע ידע שמחובר לנהלים, למדריכי המשתמש ולבסיס הידע של הנהלת בתי המשפט. נסו אחת משאלות ההכוונה כדי לראות דוגמה לתשובה מפורטת.';

/** Delay between streamed word-chunks (ms). */
const CHUNK_INTERVAL_MS = 45;
/** Simulated "thinking" delay before the first chunk (ms). */
const THINKING_DELAY_MS = 550;

let idCounter = 0;
const nextId = () => `m${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

@Injectable({ providedIn: 'root' })
export class ChatService {
  /** Full conversation, newest last. Read by the UI as a signal. */
  readonly messages = signal<ChatMessage[]>([]);
  /** True while an assistant reply is being produced. */
  readonly isResponding = signal(false);

  /**
   * Send a user message and stream back the assistant reply.
   *
   * Side effects: appends the user message and a (growing) assistant message
   * to {@link messages}. The returned observable emits one {@link ChatChunk}
   * per word and completes when `done` is true — the same contract a real
   * streaming endpoint would expose.
   */
  sendMessage(text: string): Observable<ChatChunk> {
    const content = text.trim();
    if (!content || this.isResponding()) {
      return of<ChatChunk>({ delta: '', done: true });
    }

    this.append({ id: nextId(), role: 'user', text: content, createdAt: Date.now() });

    const assistantId = nextId();
    this.append({
      id: assistantId,
      role: 'assistant',
      text: '',
      streaming: true,
      createdAt: Date.now(),
    });
    this.isResponding.set(true);

    const chunks = this.tokenize(this.resolveAnswer(content));

    return from(chunks).pipe(
      concatMap((chunk, index) =>
        timer(index === 0 ? THINKING_DELAY_MS : CHUNK_INTERVAL_MS).pipe(
          concatMap(() => {
            const done = index === chunks.length - 1;
            this.patch(assistantId, (m) => ({
              text: m.text + chunk,
              streaming: !done,
            }));
            if (done) {
              this.isResponding.set(false);
            }
            return of<ChatChunk>({ delta: chunk, done });
          }),
        ),
      ),
    );
  }

  /** Clear the conversation. */
  reset(): void {
    this.messages.set([]);
    this.isResponding.set(false);
  }

  private resolveAnswer(question: string): string {
    const q = question.toLowerCase();
    const hit = MOCK_ANSWERS.find((a) => a.match.some((k) => q.includes(k.toLowerCase())));
    return hit?.text ?? FALLBACK_ANSWER;
  }

  /** Split into word-sized chunks that keep their trailing whitespace. */
  private tokenize(reply: string): string[] {
    return reply.match(/\S+\s*/g) ?? [reply];
  }

  private append(message: ChatMessage): void {
    this.messages.update((list) => [...list, message]);
  }

  private patch(id: string, fn: (m: ChatMessage) => Partial<ChatMessage>): void {
    this.messages.update((list) => list.map((m) => (m.id === id ? { ...m, ...fn(m) } : m)));
  }
}
