import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-message-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <form
      class="flex items-end gap-2 border-t border-border bg-bg px-3 py-3 sm:px-4"
      (submit)="submit($event)"
    >
      <textarea
        #box
        [value]="value()"
        (input)="onInput($event)"
        (keydown)="onKeydown($event)"
        [disabled]="disabled()"
        rows="1"
        [attr.aria-label]="'הקלדת שאלה לעוזר'"
        placeholder="הקלידו שאלה… (Enter לשליחה, Shift+Enter לשורה חדשה)"
        class="max-h-[140px] min-h-[44px] flex-1 resize-none rounded-md border border-field bg-bg px-3 py-2.5 text-[14px] leading-[1.6] text-text placeholder:text-text-subtle focus:border-primary disabled:cursor-not-allowed disabled:bg-bg-muted"
      ></textarea>
      <button
        type="submit"
        [disabled]="disabled() || !value().trim()"
        aria-label="שליחה"
        class="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-primary text-white transition-colors duration-150 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-45"
      >
        <!-- paper plane, mirrored for RTL -->
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          style="transform: scaleX(-1)"
        >
          <path
            d="M4 12l16-8-6 16-3-6-7-2z"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </form>
  `,
})
export class MessageInputComponent {
  readonly disabled = input(false);
  readonly send = output<string>();

  protected readonly value = signal('');
  private readonly box = viewChild.required<ElementRef<HTMLTextAreaElement>>('box');

  protected onInput(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    this.value.set(el.value);
    this.autosize(el);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      this.emit();
    }
  }

  protected submit(event: Event): void {
    event.preventDefault();
    this.emit();
  }

  private emit(): void {
    const text = this.value().trim();
    if (!text || this.disabled()) {
      return;
    }
    this.send.emit(text);
    this.value.set('');
    const el = this.box().nativeElement;
    el.value = '';
    this.autosize(el);
    el.focus();
  }

  private autosize(el: HTMLTextAreaElement): void {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }
}
