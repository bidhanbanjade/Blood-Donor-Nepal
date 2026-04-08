import { useState } from 'react';
import api from '../services/api';
import './ChatWidget.css';

const ChatWidget = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'init',
      role: 'assistant',
      text: 'Ask about eligibility, FAQs, or emergency guidance.',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) {
      return;
    }

    const input = message.trim();
    setMessage('');
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', text: input }]);
    setLoading(true);

    try {
      const response = await api.post('/chatbot/task', { message: input });
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', text: response.data.reply || 'No response' },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', text: 'Chat service is unavailable right now.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="chat-widget">
      <h3>AI Donation Assistant</h3>
      <div className="chat-log">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-bubble ${msg.role}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="chat-form">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your question"
          aria-label="Chat input"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </section>
  );
};

export default ChatWidget;
