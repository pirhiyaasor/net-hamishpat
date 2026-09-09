/**
 * Embeddable-widget entry point.
 *
 * Builds a bundle that registers `<judges-ai-chat-launcher>` as a custom
 * element, so the real judges portal can drop in the floating bubble with a
 * single script include:
 *
 *   <script type="module" src="/widget/main.js"></script>
 *   <judges-ai-chat-launcher chat-url="https://ai-chat.example.gov.il/chat"></judges-ai-chat-launcher>
 *
 * The `/chat` route (served from the same build) is what opens in the separate
 * browser window when the bubble is clicked.
 */
import { createCustomElement } from '@angular/elements';
import { provideZonelessChangeDetection } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { ChatLauncherComponent } from './app/chat/chat-launcher.component';

createApplication({
  providers: [provideZonelessChangeDetection()],
})
  .then((appRef) => {
    const element = createCustomElement(ChatLauncherComponent, { injector: appRef.injector });
    if (!customElements.get('judges-ai-chat-launcher')) {
      customElements.define('judges-ai-chat-launcher', element);
    }
  })
  .catch((err) => console.error(err));
