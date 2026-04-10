import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import './ChatWidget.css';

const SUGGESTIONS = [
  'Is A+ blood available in Kathmandu?',
  'Find O- donors in Pokhara',
  'Show urgent blood requests',
  'Blood banks in Chitwan',
  'B+ donors in Butwal',
];

const TypingIndicator = () => (
  <div className="chat-bubble assistant typing">
    <span /><span /><span />
  </div>
);

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'init',
      role: 'assistant',
      text: "Hi! I'm your Blood Donation Assistant 🩸\n\nI can help you find donors, check blood availability, and show urgent requests across Kathmandu, Butwal, Pokhara, and Chitwan.\n\nWhat do you need?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const logRef = useRef(null);

  // Build history for Groq (exclude the initial greeting)
  const buildHistory = (msgs) =>
    msgs
      .filter((m) => m.id !== 'init')
      .map((m) => ({ role: m.role, content: m.text }));

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    setInput('');
    const userMsg = { id: crypto.randomUUID(), role: 'user', text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const historyToSend = buildHistory([...messages, userMsg]);
      // Remove the last user message from history (it's sent as `message`)
      historyToSend.pop();

      const response = await api.post('/chatbot/task', {
        message: userText,
        history: buildHistory(messages),
      });

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: response.data.reply || 'No response received.',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: 'Sorry, I could not connect to the assistant right now. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <>
      {/* Floating button */}
      <button
        className={`chat-fab ${open ? 'open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Open blood donation assistant"
      >
        {open ? '✕' : '🩸'}
      </button>

      {/* Chat window */}
      {open && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-avatar">🩸</div>
            <div>
              <p className="chat-header-title">Blood Assistant</p>
              <p className="chat-header-sub">Powered by Groq · Llama 3.3</p>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-log" ref={logRef}>
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-bubble ${msg.role}`}>
                {msg.text.split('\n').map((line, i) => (
                  <span key={i}>{line}<br /></span>
                ))}
              </div>
            ))}
            {loading && <TypingIndicator />}
          </div>

          {/* Suggestions — show only when first message */}
          {messages.length === 1 && !loading && (
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="chat-suggestion" onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form className="chat-form" onSubmit={handleSubmit}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about blood availability..."
              disabled={loading}
              autoComplete="off"
            />
            <button type="submit" disabled={loading || !input.trim()}>
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
