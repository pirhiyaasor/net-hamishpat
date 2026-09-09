import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AVATAR_SRC } from './chat-assets';
import { ChatService } from './chat.service';
import { GUIDING_QUESTIONS } from './guiding-questions.data';
import { GuidingQuestionsComponent } from './guiding-questions.component';
import { MessageInputComponent } from './message-input.component';
import { MessageListComponent } from './message-list.component';

@Component({
  selector: 'app-chat-window',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MessageListComponent, MessageInputComponent, GuidingQuestionsComponent],
  host: { '[class]': "embedded() ? 'block h-full' : 'block h-[100dvh]'" },
  template: `
    <div class="flex h-full flex-col bg-bg font-base text-text">
      <!-- Header -->
      <header class="flex items-center gap-3 border-b border-border bg-primary-soft px-4 py-3">
        <img
          [src]="avatarSrc"
          alt=""
          class="h-10 w-10 shrink-0 rounded-full border border-white/70 bg-white object-cover shadow-sm"
        />
        <div class="min-w-0 flex-1">
          <h1 class="truncate text-[15px] font-semibold text-text">העוזר החכם</h1>
          <p class="truncate text-[12px] text-text-subtle">פורטל מידע לשופטים · שרביט</p>
        </div>

        <button
          type="button"
          (click)="toggleSuggestions()"
          [attr.aria-pressed]="showSuggestions()"
          class="rounded-md border border-primary/30 bg-bg px-3 py-1.5 text-[12px] font-medium text-primary transition-colors duration-150 hover:bg-primary hover:text-white"
        >
          שאלות הכוונה
        </button>
        @if (embedded()) {
          <button
            type="button"
            (click)="popOut.emit()"
            aria-label="פתיחה בחלון נפרד"
            title="פתיחה בחלון נפרד"
            class="grid h-8 w-8 shrink-0 place-items-center rounded-sm text-text-subtle transition-colors duration-150 hover:bg-white hover:text-primary-hover"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M14 4h6v6M20 4l-9 9"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        }
        <button
          type="button"
          (click)="close()"
          aria-label="סגירת חלון העוזר"
          class="grid h-8 w-8 shrink-0 place-items-center rounded-sm text-text-subtle transition-colors duration-150 hover:bg-white hover:text-primary-hover"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M1 1l10 10M11 1L1 11"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </header>

      <!-- Body -->
      <main class="flex min-h-0 flex-1 flex-col">
        @if (messages().length === 0) {
          <div class="min-h-0 flex-1 overflow-y-auto px-4 py-6">
            <div class="mx-auto flex max-w-[680px] flex-col items-center gap-5 text-center">
              <img
                [src]="avatarSrc"
                alt="העוזר החכם"
                class="h-24 w-24 rounded-full border border-border bg-primary-soft object-cover"
              />
              <div class="flex flex-col gap-1.5">
                <h2 class="text-[16px] font-semibold text-text">איך אפשר לעזור?</h2>
                <p class="text-[13px] leading-relaxed text-text-muted">
                  אני יכול לענות על שאלות בנושא נהלים, ניהול דיונים ותיקים, הזמנות תרגום ומתורגמנים
                  והרשאות במערכת. אלה דוגמאות לשאלות שאפשר לשאול:
                </p>
              </div>
              <div class="w-full text-start">
                <app-guiding-questions [groups]="guidingQuestions" (pick)="onSend($event)" />
              </div>
            </div>
          </div>
        } @else {
          <app-message-list [messages]="messages()" />
        }

        @if (showSuggestions() && messages().length > 0) {
          <div class="border-t border-border bg-bg-muted px-4 py-3">
            <div class="mx-auto max-w-[680px]">
              <app-guiding-questions [groups]="guidingQuestions" (pick)="onPick($event)" />
            </div>
          </div>
        }
      </main>

      <app-message-input [disabled]="isResponding()" (send)="onSend($event)" />
    </div>
  `,
})
export class ChatWindowComponent {
  private readonly chat = inject(ChatService);
  private readonly destroyRef = inject(DestroyRef);

  /** `true` when rendered inside a host container (docked scene); `false` on the `/chat` route. */
  readonly embedded = input(false);
  /** Emitted when the user clicks the close button. */
  readonly closeRequested = output<void>();
  /** Emitted when the user clicks the "open in a separate window" button (embedded mode only). */
  readonly popOut = output<void>();

  protected readonly avatarSrc = AVATAR_SRC;
  protected readonly guidingQuestions = inject(GUIDING_QUESTIONS);

  protected readonly messages = this.chat.messages;
  protected readonly isResponding = this.chat.isResponding;
  protected readonly showSuggestions = signal(false);

  protected onSend(text: string): void {
    this.chat.sendMessage(text).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  protected onPick(prompt: string): void {
    this.showSuggestions.set(false);
    this.onSend(prompt);
  }

  protected toggleSuggestions(): void {
    this.showSuggestions.update((v) => !v);
  }

  protected close(): void {
    this.closeRequested.emit();
    // When opened as a standalone popup, also close the browser window.
    if (window.opener && !window.opener.closed) {
      window.close();
    }
  }
}
