/** Name reused so repeat opens re-focus the same window instead of stacking. */
export const ASSISTANT_WINDOW_NAME = 'judges-ai-chat';

const POPUP_WIDTH = 420;
const POPUP_HEIGHT = 680;

/**
 * Open the standalone chat (`/chat`) in a separate browser window.
 * @param chatUrl explicit URL; defaults to `chat` relative to the current baseHref.
 */
export function openAssistantWindow(chatUrl?: string): Window | null {
  const url = new URL(chatUrl?.trim() || 'chat', document.baseURI).href;
  const left = Math.max(0, Math.round(window.screenX + window.outerWidth - POPUP_WIDTH - 40));
  const top = Math.max(0, Math.round(window.screenY + 120));
  const features = `popup=yes,width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},resizable=yes,scrollbars=yes`;
  const win = window.open(url, ASSISTANT_WINDOW_NAME, features);
  win?.focus();
  return win;
}
