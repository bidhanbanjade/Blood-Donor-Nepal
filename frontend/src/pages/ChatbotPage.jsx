import { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import api from '../services/api';
import './ChatbotPage.css';

const quickPrompts = [
  'Who can donate blood?',
  'What should I do before donating?',
  'How often can I donate?',
  'Where is the nearest blood bank?',
];

const ChatbotPage = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'init',
      role: 'assistant',
      text: 'Hello! I can help with blood donation eligibility, safety guidance, and finding nearby support.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (event, forcedPrompt = '') => {
    if (event) {
      event.preventDefault();
    }

    const input = (forcedPrompt || message).trim();
    if (!input || loading) {
      return;
    }

    setMessage('');
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', text: input }]);
    setLoading(true);

    try {
      const response = await api.post('/chatbot/task', { message: input });
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: response.data.reply || 'I could not generate a response this time.',
        },
      ]);
    } catch (_) {
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

  return (
    <main className="chatbot-page">
      <Header />
      <section className="chatbot-content">
        <header className="chatbot-hero">
          <span className="chatbot-kicker">AI Assistant</span>
          <h1>Chat with the Blood Donation Assistant</h1>
          <p>
            Ask health and donation questions, get practical guidance, and receive instant support
            before urgent situations.
          </p>
        </header>

        <section className="chatbot-layout">
          <aside className="chatbot-side-card">
            <h2>Quick Questions</h2>
            <p>Tap a question to instantly start the conversation.</p>
            <div className="quick-prompts">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(null, prompt)}
                  disabled={loading}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </aside>

          <section className="chatbot-chat-card">
            <div className="chatbot-chat-header">
              <h2>Conversation</h2>
              <button
                type="button"
                className="clear-chat"
                onClick={() =>
                  setMessages([
                    {
                      id: 'init-reset',
                      role: 'assistant',
                      text: 'Conversation reset. Ask me anything about blood donation.',
                    },
                  ])
                }
              >
                Clear Chat
              </button>
            </div>

            <div className="chatbot-log" aria-live="polite">
              {messages.map((msg) => (
                <div key={msg.id} className={`chatbot-bubble ${msg.role}`}>
                  {msg.text}
                </div>
              ))}
              {loading ? <div className="chatbot-bubble assistant">Thinking...</div> : null}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={sendMessage} className="chatbot-form">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask your question here"
                aria-label="Type your question"
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send'}
              </button>
            </form>
          </section>
        </section>
      </section>
    </main>
  );
};

export default ChatbotPage;
