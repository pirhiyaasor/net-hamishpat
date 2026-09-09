import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { AVATAR_SRC } from './chat-assets';
import { openAssistantWindow } from './open-assistant-window';

@Component({
  selector: 'app-chat-launcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  template: `
    <div
      class="fixed bottom-5 z-[9999] flex flex-col items-start gap-2 font-base"
      [class.start-5]="align() === 'start'"
      [class.end-5]="align() === 'end'"
    >
      @if (hintVisible()) {
        <div
          class="animate-fade-in-up relative mb-1 max-w-[220px] rounded-lg border border-border bg-bg px-3 py-2 text-[13px] leading-snug text-text-muted shadow-window"
        >
          יש שאלה על המערכת? אני כאן לעזור.
          <button
            type="button"
            (click)="dismissHint()"
            aria-label="סגירת ההודעה"
            class="absolute -top-2 -end-2 rounded-full bg-bg-muted p-1 text-text-subtle shadow-sm hover:text-text"
          >
            <svg width="8" height="8" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M1 1l10 10M11 1L1 11"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      }

      <button
        type="button"
        (click)="open()"
        [attr.aria-label]="
          mode() === 'inline' ? 'פתיחת חלון העוזר החכם' : 'פתיחת חלון העוזר החכם בחלון נפרד'
        "
        class="group relative flex items-center gap-2.5 rounded-full bg-primary py-2 pe-4 ps-2 text-white shadow-bubble transition-transform duration-150 hover:-translate-y-0.5 hover:bg-primary-hover"
      >
        <span
          class="grid h-11 w-11 place-items-center overflow-hidden rounded-full border-2 border-white bg-primary-soft"
        >
          <img [src]="avatarSrc" alt="" class="h-11 w-11 object-cover" />
        </span>
        <span class="hidden text-[14px] font-semibold sm:inline">שאלו את העוזר</span>
        <span
          class="absolute -top-0.5 end-2 h-3 w-3 rounded-full border-2 border-primary bg-emerald-400"
          aria-hidden="true"
        ></span>
      </button>
    </div>
  `,
})
export class ChatLauncherComponent implements OnDestroy {
  /**
   * URL of the chat window route. Defaults to `<baseHref>chat` on the current
   * origin. When embedded in the real portal, point this at the deployed
   * widget's `/chat` route. Only used in `window` mode.
   */
  readonly chatUrl = input('');
  /** `end` = inline-end (left in RTL, the default); `start` = inline-start (right in RTL). */
  readonly align = input<'start' | 'end'>('end');
  /**
   * `window` (default): clicking opens the chat in a separate browser window.
   * `inline`: clicking emits {@link activate} so a host can reveal a docked panel.
   */
  readonly mode = input<'window' | 'inline'>('window');

  /** Emitted on click when `mode === 'inline'`. */
  readonly activate = output<void>();

  protected readonly avatarSrc = AVATAR_SRC;
  protected readonly hintVisible = signal(true);

  private popup: Window | null = null;
  private readonly hintTimer = setTimeout(() => this.hintVisible.set(false), 8000);

  open(): void {
    this.dismissHint();

    if (this.mode() === 'inline') {
      this.activate.emit();
      return;
    }

    if (this.popup && !this.popup.closed) {
      this.popup.focus();
      return;
    }

    this.popup = openAssistantWindow(this.chatUrl());
  }

  dismissHint(): void {
    this.hintVisible.set(false);
  }

  ngOnDestroy(): void {
    clearTimeout(this.hintTimer);
  }
}
