import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CHARACTER_SRC, DESKTOP_BG_SRC } from '../chat/chat-assets';
import { ChatLauncherComponent } from '../chat/chat-launcher.component';
import { ChatWindowComponent } from '../chat/chat-window.component';
import { openAssistantWindow } from '../chat/open-assistant-window';

/**
 * The "docked" presentation: the real judges portal screenshot as a full-screen
 * background, with the AI assistant pinned to the bottom-right (inline-start in
 * RTL) and the illustrated character leaning against it.
 */
@Component({
  selector: 'app-desktop-scene',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChatWindowComponent, ChatLauncherComponent],
  host: { class: 'block font-base' },
  template: `
    <!-- Desktop portal screenshot, locked to the viewport as a backdrop -->
    <div
      class="fixed inset-0 z-0 bg-[#eef1f5] bg-cover bg-top bg-no-repeat"
      [style.background-image]="'url(' + desktopBg + ')'"
      role="img"
      aria-label="פורטל שרביט · חטיבת השופטים והרשמים"
    ></div>

    @if (open()) {
      <!--
        Character leaning on the chat window. The source image bakes a chat-panel
        mockup onto its right side; an overflow-hidden frame crops that off so
        only the figure shows. It sits *behind* the real window (z-10 vs z-20),
        so the small overlap is hidden cleanly and reads as a lean.
      -->
      <div
        class="pointer-events-none fixed bottom-0 start-[344px] z-10 hidden h-[560px] w-[236px] select-none overflow-hidden min-[560px]:block xl:h-[700px] xl:w-[292px]"
        aria-hidden="true"
      >
        <img
          [src]="characterImg"
          alt=""
          class="absolute bottom-0 left-0 h-[560px] w-auto max-w-none xl:h-[700px]"
        />
      </div>

      <!-- Docked chat window -->
      <div
        class="fixed bottom-0 start-0 z-20 h-[min(600px,100dvh)] w-[min(94vw,380px)] overflow-hidden rounded-t-xl border border-b-0 border-border bg-bg shadow-window"
      >
        <app-chat-window [embedded]="true" (closeRequested)="open.set(false)" (popOut)="popOut()" />
      </div>
    } @else {
      <app-chat-launcher mode="inline" align="start" (activate)="open.set(true)" />
    }
  `,
})
export class DesktopSceneComponent {
  protected readonly desktopBg = DESKTOP_BG_SRC;
  protected readonly characterImg = CHARACTER_SRC;
  protected readonly open = signal(true);

  /** Pop the docked assistant out into its own browser window and collapse the panel. */
  protected popOut(): void {
    const win = openAssistantWindow();
    if (win) {
      this.open.set(false);
    }
  }
}
