'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { ChatFlowState, ChatMessage } from '@lawnguy/brand';
import { Icon } from '@/components/shared/Icon';
import { LinkButton } from '@/components/shared/Button';
import { postChat } from '@/lib/api';

const INTRO_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: 'Hi! Quick quote helper. Is the property in Bradford or BWG?',
};

type Handoff = { smsHref?: string; mailtoHref?: string };

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INTRO_MESSAGE]);
  const [flowState, setFlowState] = useState<ChatFlowState | undefined>();
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [handoff, setHandoff] = useState<Handoff | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    const next: ChatMessage = { role: 'user', content: text };
    const after = [...messages, next];
    setMessages(after);
    setInput('');
    setBusy(true);

    const result = await postChat({ messages: after, flowState });
    setBusy(false);
    if (!result.ok) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'The chat helper had a hiccup. Please text or email Remy directly — links are right above.',
        },
      ]);
      return;
    }
    const reply = result.data;
    setFlowState(reply.flowState);
    setHandoff(reply.handoff);
    setMessages((prev) => [...prev, { role: 'assistant', content: reply.reply }]);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close quote helper' : 'Open quote helper'}
        aria-expanded={open}
        className="fixed bottom-24 right-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-brand text-surface shadow-lg transition-transform hover:scale-105 hover:bg-brand-dark md:bottom-6"
      >
        <Icon name={open ? 'ShieldX' : 'MessageCircle'} size={22} aria-hidden />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Quote helper"
          className="fixed bottom-40 right-5 z-40 flex h-[28rem] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-xl md:bottom-24"
        >
          <header className="flex items-center justify-between border-b border-line bg-bg px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">Quote helper</p>
              <p className="text-xs text-ink-muted">Short flow. Ends in a text to Remy.</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="text-ink-muted hover:text-ink"
            >
              <Icon name="ShieldX" size={18} />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === 'user'
                    ? 'ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-brand px-3 py-2 text-surface'
                    : 'mr-auto max-w-[85%] rounded-2xl rounded-bl-sm bg-surface-alt px-3 py-2 text-ink'
                }
              >
                {m.content}
              </div>
            ))}
            {busy ? (
              <div className="mr-auto max-w-[85%] rounded-2xl rounded-bl-sm bg-surface-alt px-3 py-2 text-ink-muted">
                …
              </div>
            ) : null}
            {handoff ? (
              <div className="space-y-2 rounded-xl border border-line bg-bg p-3">
                <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">
                  Next step
                </p>
                <div className="flex flex-wrap gap-2">
                  {handoff.smsHref ? (
                    <LinkButton href={handoff.smsHref} size="sm" variant="primary">
                      <Icon name="MessageCircle" size={14} /> Text Remy
                    </LinkButton>
                  ) : null}
                  {handoff.mailtoHref ? (
                    <LinkButton href={handoff.mailtoHref} size="sm" variant="secondary">
                      Email instead
                    </LinkButton>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <form onSubmit={send} className="flex items-center gap-2 border-t border-line p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a short reply…"
              className="flex-1 rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none"
              maxLength={500}
              disabled={busy}
            />
            <button
              type="submit"
              disabled={busy || input.trim().length === 0}
              className="rounded-md bg-brand px-3 py-2 text-sm font-medium text-surface hover:bg-brand-dark disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
