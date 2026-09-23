import React, { useEffect, useRef, useState } from "react";
import { api } from "../api";
import { formatTime } from "../lib";
import { TypingDots } from "./Loader";

const SUGGESTIONS = ["I have R50", "How much is a kota?", "Recommend something with chicken", "Where is my order?", "What's in my cart?"];

export function Assistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(null);
  const [historyError, setHistoryError] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (!open || messages !== null) return;
    api
      .getAssistantHistory()
      .then(setMessages)
      .catch((err) => {
        setHistoryError(err.message);
        setMessages([]);
      });
  }, [open, messages]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, sending, open]);

  async function send(text) {
    const content = text.trim();
    if (!content || sending) return;
    setInput("");
    setMessages((m) => [...(m ?? []), { id: crypto.randomUUID(), role: "user", content, createdAt: new Date().toISOString() }]);
    setSending(true);
    try {
      const reply = await api.askAssistant(content);
      setMessages((m) => [...m, reply]);
    } catch (err) {
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: `Sorry, I couldn't answer that: ${err.message}`, error: true }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button className="assistant-fab" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {open ? "×" : "✦ Ask AI"}
      </button>
      {open && (
        <section className="assistant-panel" aria-label="AI assistant">
          <header>
            <div>
              <strong>Food assistant</strong>
              <small>Chat history is saved to your account</small>
            </div>
            <button aria-label="Close assistant" onClick={() => setOpen(false)}>×</button>
          </header>
          <div className="chat" ref={listRef}>
            {messages === null && <p className="chat-hint"><TypingDots /> Loading your chat history</p>}
            {historyError && <p className="chat-hint">Couldn't load earlier messages.</p>}
            {messages?.length === 0 && (
              <p className="chat-hint">Hi! Ask me what to eat, what fits your budget, or where your order is.</p>
            )}
            {messages?.map((m) => (
              <div key={m.id} className={`bubble ${m.role}${m.error ? " failed" : ""}`}>
                {m.content}
                {m.createdAt && <small>{formatTime(m.createdAt)}</small>}
              </div>
            ))}
            {sending && <div className="bubble assistant typing"><TypingDots /></div>}
          </div>
          {messages?.length === 0 && (
            <div className="chips">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about food or your order" aria-label="Message" />
            <button type="submit" disabled={!input.trim() || sending}>Send</button>
          </form>
        </section>
      )}
    </>
  );
}
