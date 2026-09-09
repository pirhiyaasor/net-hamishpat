export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  /** Text accumulated so far (grows while an assistant reply is streaming). */
  text: string;
  /** True while this assistant message is still receiving streamed chunks. */
  streaming?: boolean;
  createdAt: number;
}

/**
 * One streamed chunk from the assistant. Shape mirrors what a real
 * server-sent-events / fetch-stream endpoint would emit, so swapping the
 * mock {@link ChatService} for a real backend only touches the service body.
 */
export interface ChatChunk {
  /** Incremental text to append to the current assistant message. */
  delta: string;
  /** True on the final chunk of a reply. */
  done: boolean;
}

export interface GuidingQuestion {
  /** Short text shown on the chip. */
  label: string;
  /** Full prompt sent when the chip is clicked (defaults to `label`). */
  prompt?: string;
}

export interface GuidingQuestionGroup {
  title: string;
  questions: GuidingQuestion[];
}
