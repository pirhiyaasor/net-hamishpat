import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  viewChild,
} from '@angular/core';
import { ChatMessage } from './chat.models';

@Component({
  selector: 'app-message-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block min-h-0 flex-1' },
  template: `
    <div #scroller class="h-full overflow-y-auto px-3 py-4 sm:px-4">
      <ul class="mx-auto flex max-w-[680px] flex-col gap-3">
        @for (m of messages(); track m.id) {
          <li
            class="flex animate-fade-in-up"
            [class.justify-start]="m.role === 'assistant'"
            [class.justify-end]="m.role === 'user'"
          >
            <div
              class="max-w-[85%] whitespace-pre-wrap break-words rounded-lg px-3.5 py-2.5 text-[14px] leading-[1.65]"
              [class]="
                m.role === 'user'
                  ? 'bg-bubble-user text-white rounded-bl-lg rounded-br-sm'
                  : 'bg-bubble-bot text-text rounded-br-lg rounded-bl-sm'
              "
            >
              @if (m.role === 'assistant' && m.streaming && !m.text) {
                <span class="flex items-center gap-1 py-1" aria-label="העוזר מקליד">
                  <span class="h-2 w-2 rounded-full bg-text-subtle animate-dot-bounce"></span>
                  <span
                    class="h-2 w-2 rounded-full bg-text-subtle animate-dot-bounce"
                    style="animation-delay: 0.16s"
                  ></span>
                  <span
                    class="h-2 w-2 rounded-full bg-text-subtle animate-dot-bounce"
                    style="animation-delay: 0.32s"
                  ></span>
                </span>
              } @else {
                {{ m.text }}
                @if (m.streaming) {
                  <span
                    class="ms-0.5 inline-block h-4 w-[2px] -translate-y-[1px] animate-pulse bg-current align-middle"
                  ></span>
                }
              }
            </div>
          </li>
        }
      </ul>
    </div>
  `,
})
export class MessageListComponent {
  readonly messages = input.required<ChatMessage[]>();

  private readonly scroller = viewChild.required<ElementRef<HTMLDivElement>>('scroller');

  constructor() {
    // Re-runs after every render where `messages()` (array + per-chunk patches)
    // changed, keeping the newest message in view while a reply streams in.
    afterRenderEffect(() => {
      this.messages();
      const el = this.scroller().nativeElement;
      el.scrollTop = el.scrollHeight;
    });
  }
}
