import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { useMediaQuery } from 'react-responsive';
import './App.css';

// Your published Google Sheet CSV URL
const GOOGLE_SHEET_API_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTWIWIzWFFYoBbxvBHPDfRl0tP-sNfnZ2ipIdvC6st_vSgXuLYDACGVq_0r5SAf0pUL4VJK81HuQ0tL/pub?output=csv';

// Format time in IST (e.g., "09:15 pm")
function formatTimeIST(timestamp) {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}

// Format date in IST (e.g., "25/02/2025")
function formatDateIST(timestamp) {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

// Determine if timestamp is "Today" in IST
function isToday(timestamp) {
  const messageDate = new Date(Number(timestamp) * 1000).toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
  });
  const today = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
  return messageDate === today;
}

// Return date label: "Today", "Yesterday", or a formatted date
function getDateLabel(timestamp) {
  const messageDate = new Date(Number(timestamp) * 1000);
  const options = { timeZone: 'Asia/Kolkata' };
  const today = new Date().toLocaleDateString('en-IN', options);
  const messageDay = messageDate.toLocaleDateString('en-IN', options);

  if (messageDay === today) return 'Today';

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toLocaleDateString('en-IN', options);
  if (messageDay === yesterday) return 'Yesterday';

  return messageDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

/**
 * Transform each CSV row into an object.
 * Uses the isOutbound field if available; defaults to "0".
 */
function transformMessages(rawData) {
  const transformed = [];
  rawData.forEach((row) => {
    transformed.push({
      Phone: row.Phone,
      Message: row.Message,
      Time: row.Time,
      isOutbound: row.isOutbound || '0'
    });
  });
  return transformed;
}

function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhone, setSelectedPhone] = useState(null);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Updated fetchMessages without caching logic
  const fetchMessages = async () => {
    console.log('fetchMessages: Starting to fetch messages...');
    try {
      const response = await fetch(GOOGLE_SHEET_API_URL);
      console.log('fetchMessages: Response received', response);
      const csvText = await response.text();
      console.log('fetchMessages: CSV text (first 100 chars):', csvText.slice(0, 100) + '...');
      const { data, errors } = Papa.parse(csvText, { header: true });
      if (errors.length) {
        console.error('fetchMessages: Errors parsing CSV:', errors);
      }
      console.log('fetchMessages: Parsed data (count ' + data.length + '):', data);
      const transformed = transformMessages(data);
      console.log('fetchMessages: Transformed data (count ' + transformed.length + '):', transformed);
      
      // Always update state with the fetched data
      setMessages(transformed);
      setLoading(false);
    } catch (error) {
      console.error('fetchMessages: Error fetching messages:', error);
    }
  };

  useEffect(() => {
    console.log('App mounted. Fetching initial data...');
    fetchMessages();
    const interval = setInterval(() => {
      console.log('Polling for new messages...');
      fetchMessages();
    }, 30000);
    return () => {
      clearInterval(interval);
      console.log('App unmounted. Stopped polling.');
    };
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        console.log('Escape key pressed, deselecting conversation...');
        setSelectedPhone(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleManualRefresh = () => {
    console.log('Manual refresh triggered');
    fetchMessages();
  };

  const conversationPanelStyle = { display: isMobile && selectedPhone ? 'none' : 'flex' };
  const chatPanelStyle = { display: isMobile && !selectedPhone ? 'none' : 'flex' };

  return (
    <div className="app-container">
      <div className="conversations-panel" style={conversationPanelStyle}>
        <ConversationsPanel
          messages={messages}
          loading={loading}
          selectedPhone={selectedPhone}
          onSelectPhone={setSelectedPhone}
          onManualRefresh={handleManualRefresh}
        />
      </div>
      <div className="chat-panel" style={chatPanelStyle}>
        <ChatPanel
          messages={messages}
          phone={selectedPhone}
          onClose={() => setSelectedPhone(null)}
        />
      </div>
    </div>
  );
}

function ConversationsPanel({ messages, loading, selectedPhone, onSelectPhone, onManualRefresh }) {
  console.log('ConversationsPanel: messages:', messages);
  const grouped = {};
  messages.forEach((msg) => {
    if (!grouped[msg.Phone]) grouped[msg.Phone] = [];
    grouped[msg.Phone].push(msg);
  });
  const summaries = Object.keys(grouped).map((phone) => {
    const phoneMessages = grouped[phone].sort((a, b) => Number(b.Time) - Number(a.Time));
    return { phone, lastMessage: phoneMessages[0].Message, lastTime: phoneMessages[0].Time };
  });
  summaries.sort((a, b) => Number(b.lastTime) - Number(a.lastTime));
  return (
    <div className="panel-container">
      <header className="panel-header">
        <h2>Conversations</h2>
        <button className="refresh-button" onClick={onManualRefresh}>Refresh</button>
      </header>
      <div className="panel-content">
        {loading ? (
          <p className="loading-text">Loading conversations...</p>
        ) : (
          summaries.map((conv, index) => (
            <div
              key={index}
              className={`conversation-item ${selectedPhone === conv.phone ? 'selected-conversation' : ''}`}
              onClick={() => {
                console.log('Selected phone:', conv.phone);
                onSelectPhone(conv.phone);
              }}
            >
              <img
                className="profile-pic"
                src={`https://ui-avatars.com/api/?name=${conv.phone}&background=random`}
                alt="Profile"
              />
              <div className="conversation-details">
                <div className="conversation-header">
                  <span className="phone">{conv.phone}</span>
                  <span className="time">
                    {isToday(conv.lastTime) ? formatTimeIST(conv.lastTime) : formatDateIST(conv.lastTime)}
                  </span>
                </div>
                <div className="conversation-body">{conv.lastMessage}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ChatPanel({ messages, phone, onClose }) {
  if (!phone) {
    return (
      <div className="panel-container chat-panel-container">
        <header className="panel-header chat-header">
          <h2>No Conversation Selected</h2>
        </header>
        <div className="chat-messages">
          <p className="empty-message">Select a conversation from the left.</p>
        </div>
      </div>
    );
  }
  const conversationMessages = messages
    .filter((msg) => msg.Phone === phone)
    .sort((a, b) => Number(a.Time) - Number(b.Time));
  console.log('ChatPanel: conversation messages for phone:', phone, conversationMessages);
  return (
    <div className="panel-container chat-panel-container">
      <header className="panel-header chat-header">
        <button className="back-button" onClick={onClose}>&larr;</button>
        <img
          className="profile-pic-large"
          src={`https://ui-avatars.com/api/?name=${phone}&background=random`}
          alt="Profile"
        />
        <h2>{phone}</h2>
      </header>
      <ChatConversation messages={conversationMessages} />
      <ChatBar phone={phone} />
    </div>
  );
}

function ChatConversation({ messages }) {
  const messagesEndRef = useRef(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  if (messages.length === 0) {
    return (
      <div className="chat-messages">
        <p className="empty-message">No messages found.</p>
      </div>
    );
  }
  let lastDateLabel = '';
  return (
    <div className="chat-messages">
      {messages.map((msg, index) => {
        const currentLabel = getDateLabel(msg.Time);
        const showDivider = currentLabel !== lastDateLabel;
        lastDateLabel = currentLabel;
        return (
          <React.Fragment key={index}>
            {showDivider && (
              <div className="date-divider">
                <span>{currentLabel}</span>
              </div>
            )}
            <div className={`message-bubble ${msg.isOutbound === '1' ? 'outbound-bubble' : 'inbound-bubble'}`}>
              <div className="message-time">{formatTimeIST(msg.Time)}</div>
              <div className="message-text">{msg.Message}</div>
            </div>
          </React.Fragment>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

function ChatBar({ phone }) {
  const [input, setInput] = useState('');
  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      console.log('ChatBar: No message to send.');
      return;
    }
    try {
      const res = await fetch('/api/send-message', {  // relative URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phone, message: trimmed })
      });
      const data = await res.json();
      if (data.success) {
        console.log('ChatBar: Message sent & logged to Google Sheet:', data);
        setInput('');
      } else {
        console.error('ChatBar: Failed to send message:', data.error);
      }
    } catch (err) {
      console.error('ChatBar: Error sending message:', err);
    }
  };
  

  return (
    <div className="chat-bar">
      <input
        type="text"
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
