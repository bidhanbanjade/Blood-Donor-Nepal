import { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import api from '../services/api';
import './ChatbotPage.css';

const QUICK_PROMPTS = [
  'Is A+ blood available in Kathmandu?',
  'Find O- donors in Pokhara',
  'Show current urgent blood requests',
  'Blood banks in Chitwan',
  'B+ donors in Butwal',
  'Who can donate blood?',
  'How often can I donate?',
  'What blood types are compatible with AB+?',
];

const TypingIndicator = () => (
  <div className="chatbot-bubble assistant typing-bubble">
    <span /><span /><span />
  </div>
);

const ChatbotPage = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'init',
      role: 'assistant',
      text: "Hi! I'm your Blood Donation Assistant 🩸\n\nI can help you find donors, check blood availability, and show urgent requests across Kathmandu, Butwal, Pokhara, and Chitwan.\n\nWhat do you need?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const buildHistory = (msgs) =>
    msgs
      .filter((m) => m.id !== 'init' && m.id !== 'init-reset')
      .map((m) => ({ role: m.role, content: m.text }));

  const sendMessage = async (forcedText = '') => {
    const userText = (forcedText || input).trim();
    if (!userText || loading) return;

    setInput('');
    const userMsg = { id: crypto.randomUUID(), role: 'user', text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await api.post('/chatbot/task', {
        message: userText,
        history: buildHistory(messages),
      });

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: response.data.reply || 'I could not generate a response. Please try again.',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: 'Chat service is unavailable right now. Please try again shortly.',
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

  const clearChat = () => {
    setMessages([
      {
        id: 'init-reset',
        role: 'assistant',
        text: 'Conversation cleared. Ask me anything about blood availability or donation! 🩸',
      },
    ]);
  };

  return (
    <main className="chatbot-page">
      <Header />
      <section className="chatbot-content">
        <header className="chatbot-hero">
          <span className="chatbot-kicker">AI Assistant</span>
          <h1>Chat with the Blood Donation Assistant</h1>
          <p>
            Find donors, check blood availability across 4 cities, and get real-time urgent alerts — just ask.
          </p>
        </header>

        <section className="chatbot-layout">
          <aside className="chatbot-side-card">
            <h2>Quick Questions</h2>
            <p>Tap a question to instantly start the conversation.</p>
            <div className="quick-prompts">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </aside>

          <section className="chatbot-chat-card">
            <div className="chatbot-chat-header">
              <div className="chatbot-chat-title">
                <div className="chatbot-avatar">🩸</div>
                <div>
                  <h2>Blood Assistant</h2>
                  <p className="chatbot-model">Powered by Groq · Llama 3.3</p>
                </div>
              </div>
              <button type="button" className="clear-chat" onClick={clearChat}>
                Clear Chat
              </button>
            </div>

            <div className="chatbot-log" aria-live="polite">
              {messages.map((msg) => (
                <div key={msg.id} className={`chatbot-bubble ${msg.role}`}>
                  {msg.text.split('\n').map((line, i) => (
                    <span key={i}>{line}<br /></span>
                  ))}
                </div>
              ))}
              {loading && <TypingIndicator />}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="chatbot-form">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about blood availability, donors, alerts..."
                disabled={loading}
                autoComplete="off"
              />
              <button type="submit" disabled={loading || !input.trim()}>
                {loading ? '...' : 'Send'}
              </button>
            </form>
          </section>
        </section>
      </section>
    </main>
  );
};

export default ChatbotPage;
