import { InjectionToken } from '@angular/core';
import { GuidingQuestionGroup } from './chat.models';

/**
 * Example prompts shown in the empty state to communicate the *kind* of
 * questions the assistant can answer. Grouped by topic. Override by providing
 * {@link GUIDING_QUESTIONS} in the host application if the portal needs a
 * different set.
 */
export const DEFAULT_GUIDING_QUESTIONS: GuidingQuestionGroup[] = [
  {
    title: 'הזמנות תרגום ומתורגמנים',
    questions: [
      { label: 'איך מוסיפים הזמנת תרגום לדיון?' },
      { label: 'איך מזמינים מתורגמן ממאגר המתורגמנים?' },
      { label: 'מה ההבדל בין הזמנת תרגום רגילה לדחופה?' },
      { label: 'איך מבטלים הזמנת תרגום קיימת?' },
    ],
  },
  {
    title: 'ניהול דיונים ותיקים',
    questions: [
      { label: 'איך קובעים מועד דיון חדש בתיק?' },
      { label: 'איך מאתרים תיק לפי מספר תיק או שם צד?' },
      { label: 'איך מפיקים פרוטוקול דיון?' },
      { label: 'איך מעבירים תיק להרכב אחר?' },
    ],
  },
  {
    title: 'נהלים והרשאות',
    questions: [
      { label: 'מהם נהלי הגשת בקשה דחופה מחוץ לשעות הפעילות?' },
      { label: 'אילו הרשאות נדרשות לצפייה בתיק חסוי?' },
      { label: 'איך מגדירים חתימה אלקטרונית להחלטות?' },
    ],
  },
];

export const GUIDING_QUESTIONS = new InjectionToken<GuidingQuestionGroup[]>('GUIDING_QUESTIONS', {
  providedIn: 'root',
  factory: () => DEFAULT_GUIDING_QUESTIONS,
});
