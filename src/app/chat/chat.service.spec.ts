import { TestBed } from '@angular/core/testing';
import { lastValueFrom, toArray } from 'rxjs';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatService);
  });

  it('appends a user message and a streaming assistant placeholder synchronously', () => {
    service.sendMessage('איך מוסיפים הזמנת תרגום לדיון?');

    const msgs = service.messages();
    expect(msgs.length).toBe(2);
    expect(msgs[0].role).toBe('user');
    expect(msgs[0].text).toContain('הזמנת תרגום');
    expect(msgs[1].role).toBe('assistant');
    expect(msgs[1].streaming).toBe(true);
    expect(msgs[1].text).toBe('');
    expect(service.isResponding()).toBe(true);
  });

  it('streams chunks that accumulate into the final assistant message', async () => {
    const chunks = await lastValueFrom(
      service.sendMessage('איך מוסיפים הזמנת תרגום לדיון?').pipe(toArray()),
    );

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.at(-1)?.done).toBe(true);
    expect(chunks.slice(0, -1).every((c) => !c.done)).toBe(true);

    const joined = chunks.map((c) => c.delta).join('');
    const assistant = service.messages().at(-1)!;
    expect(assistant.text).toBe(joined);
    expect(assistant.text).toContain('הזמנת תרגום');
    expect(assistant.streaming).toBe(false);
    expect(service.isResponding()).toBe(false);
  }, 15000);

  it('ignores a second send while a reply is in progress', () => {
    service.sendMessage('שאלה ראשונה');
    service.sendMessage('שאלה שנייה');

    expect(service.messages().length).toBe(2);
    expect(service.messages()[0].text).toBe('שאלה ראשונה');
  });

  it('reset() clears the conversation', () => {
    service.sendMessage('שאלה');
    service.reset();

    expect(service.messages()).toEqual([]);
    expect(service.isResponding()).toBe(false);
  });
});
