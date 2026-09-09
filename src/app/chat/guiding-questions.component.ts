import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { GuidingQuestion, GuidingQuestionGroup } from './chat.models';

@Component({
  selector: 'app-guiding-questions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="flex flex-col gap-4">
      @for (group of groups(); track group.title) {
        <section class="flex flex-col gap-2">
          <h3 class="text-[12px] font-semibold uppercase tracking-wide text-text-subtle">
            {{ group.title }}
          </h3>
          <div class="flex flex-wrap gap-2">
            @for (q of group.questions; track q.label) {
              <button
                type="button"
                (click)="pick.emit(promptOf(q))"
                class="rounded-md border border-border bg-bg px-3 py-2 text-start text-[13px] leading-snug text-text-muted transition-colors duration-150 hover:border-primary hover:bg-primary-soft hover:text-primary-hover"
              >
                {{ q.label }}
              </button>
            }
          </div>
        </section>
      }
    </div>
  `,
})
export class GuidingQuestionsComponent {
  readonly groups = input.required<GuidingQuestionGroup[]>();
  readonly pick = output<string>();

  protected promptOf(q: GuidingQuestion): string {
    return q.prompt ?? q.label;
  }
}
