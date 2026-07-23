import React, { useState, useEffect, useRef } from 'react';

/* ── Simple Markdown Renderer ─────────────────────────────────────────────
   Converts **bold**, `code`, and \n → proper JSX without any dependencies.
────────────────────────────────────────────────────────────────────────── */
const renderMarkdown = (text) => {
  if (!text) return null;

  // Split on ** pairs (bold), backtick pairs (code), and newlines
  const parts = [];
  const regex = /\*\*(.+?)\*\*|`([^`]+)`|\n/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    }
    if (match[0] === '\n') {
      parts.push(<br key={key++} />);

    } else if (match[1] !== undefined) {
      // **bold**
      parts.push(<strong key={key++} style={{ fontWeight: 700, color: 'inherit' }}>{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      // `code`
      parts.push(
        <code key={key++} style={{
          background: 'rgba(184, 115, 74, 0.12)',
          padding: '1px 5px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '0.85em',
          color: '#8b4513'
        }}>{match[2]}</code>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }
  return parts;
};

/* ── Typing Dots ──────────────────────────────────────────────────────── */
const TypingDots = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '12px 16px',
    background: '#fff',
    borderRadius: '18px 18px 18px 4px',
    width: 'fit-content',
    border: '1px solid rgba(184,115,74,0.18)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  }}>
    <span style={{ fontSize: '0.78rem', color: '#9e7a5f', marginRight: '2px' }}>Artisan AI is typing</span>
    {[0, 0.18, 0.36].map((delay, i) => (
      <span key={i} style={{
        width: '7px', height: '7px',
        borderRadius: '50%',
        background: 'var(--rose-gold, #b8734a)',
        display: 'inline-block',
        animation: `chatbotBounce 1s ${delay}s infinite`
      }} />
    ))}
  </div>
);

/* ── ChatbotWidget ────────────────────────────────────────────────────── */
const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Namaste! Kem cho! Welcome to **EverAura Creations** — Nadiad's premier home craft studio. 🪧🎨\n\nI am your 24/7 AI Assistant. Ask me anything in English or Phonetic Gujarati (*e.g. 'Nadiad ma delivery thase?'*) or pick an option below:",
      quickReplies: ["✨ Place an Order", "💬 Check Price", "📍 Delivery Info", "📦 Track Order", "🚫 Cancel Order"]
    }
  ]);
  const [input, setInput] = useState('');
  const [state, setState] = useState('INIT');
  const [sessionData, setSessionData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async (textToSend) => {
    const msgText = textToSend !== undefined ? textToSend : input;
    if (!msgText.trim() && !selectedFile) return;

    // Append user message + clear quick replies from all previous messages
    setMessages(prev => [
      ...prev.map(m => ({ ...m, quickReplies: null })),
      { sender: 'user', text: msgText }
    ]);
    if (textToSend === undefined) setInput('');
    setIsLoading(true);

    try {
      let updatedSessionData = { ...sessionData };

      if (selectedFile) {
        const formData = new FormData();
        formData.append('referenceImage', selectedFile);
        const uploadRes = await fetch('/api/chat/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          updatedSessionData.reference_image = uploadData.imageUrl;
        }
        setSelectedFile(null);
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msgText, state, sessionData: updatedSessionData })
      });

      const data = await res.json();
      setState(data.nextState || 'INIT');
      if (data.sessionData) setSessionData(data.sessionData);

      // If backend sends a customerWaUrl (from Send Query flow), append a WhatsApp link message
      if (data.customerWaUrl) {
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: data.reply, quickReplies: data.quickReplies || null },
          {
            sender: 'bot',
            text: `💬 **Tap below to message us on WhatsApp directly:**`,
            quickReplies: null,
            waButton: data.customerWaUrl
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: data.reply, quickReplies: data.quickReplies || null }
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: "⚠️ Sorry, I encountered a brief connection issue. Please try again or click **✨ Place an Order** below!",
          quickReplies: ["✨ Place an Order", "📍 Delivery Info"]
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (state === 'UPLOAD_IMAGE') {
        sendMessage(`Attached file: ${file.name}`);
      }
    }
  };

  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @keyframes chatbotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.6; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes chatbotPulse {
          0% { box-shadow: 0 0 0 0 rgba(184,115,74,0.6), 0 8px 24px rgba(44,24,16,0.35); transform: scale(1); }
          50% { box-shadow: 0 0 0 14px rgba(184,115,74,0), 0 8px 24px rgba(44,24,16,0.35); transform: scale(1.06); }
          100% { box-shadow: 0 0 0 0 rgba(184,115,74,0), 0 8px 24px rgba(44,24,16,0.35); transform: scale(1); }
        }
        @keyframes chatbotSlideIn {
          from { opacity: 0; transform: translateY(18px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .chatbot-qr-btn {
          background: #fdf8f2;
          border: 1.5px solid #b8734a;
          padding: 6px 13px;
          border-radius: 20px;
          font-size: 0.8rem;
          color: #b8734a;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.18s, color 0.18s, transform 0.15s;
          white-space: nowrap;
        }
        .chatbot-qr-btn:hover {
          background: #b8734a;
          color: #fff;
          transform: translateY(-1px);
        }
        .chatbot-input {
          flex: 1;
          padding: 10px 14px;
          border-radius: 22px;
          border: 1.5px solid rgba(184,115,74,0.28);
          font-size: 0.9rem;
          outline: none;
          background: #fdf8f2;
          color: #3d2b1a;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        .chatbot-input:focus {
          border-color: #b8734a;
          box-shadow: 0 0 0 3px rgba(184,115,74,0.12);
        }
        .chatbot-input::placeholder { color: #b8a090; }
        .chatbot-send-btn {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #b8734a, #c49a72);
          border: none;
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          font-size: 1.1rem;
          transition: transform 0.18s, opacity 0.18s, box-shadow 0.18s;
          box-shadow: 0 4px 12px rgba(184,115,74,0.35);
          flex-shrink: 0;
        }
        .chatbot-send-btn:not(:disabled):hover {
          transform: scale(1.1);
          box-shadow: 0 6px 18px rgba(184,115,74,0.5);
        }
        .chatbot-send-btn:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }
        .chatbot-messages::-webkit-scrollbar { width: 4px; }
        .chatbot-messages::-webkit-scrollbar-track { background: transparent; }
        .chatbot-messages::-webkit-scrollbar-thumb { background: rgba(184,115,74,0.25); border-radius: 4px; }
      `}</style>

      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        fontFamily: "'Jost', system-ui, sans-serif"
      }}>

        {/* ── FAB Button ── */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            title="Chat with EverAura AI Assistant"
            style={{
              width: '62px', height: '62px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #b8734a, #c49a72)',
              border: '2px solid rgba(255,255,255,0.35)',
              boxShadow: '0 8px 24px rgba(44,24,16,0.4)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.7rem',
              color: '#fff',
              animation: 'chatbotPulse 2.8s infinite',
              transition: 'transform 0.2s'
            }}
          >
            💬
          </button>
        )}

        {/* ── Chat Window ── */}
        {isOpen && (
          <div style={{
            width: 'min(390px, 95vw)',
            height: 'min(600px, 88vh)',
            background: 'rgba(255, 253, 250, 0.97)',
            backdropFilter: 'blur(18px)',
            borderRadius: '22px',
            border: '1px solid rgba(184,115,74,0.35)',
            boxShadow: '0 20px 60px rgba(44,24,16,0.3), 0 4px 16px rgba(184,115,74,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'chatbotSlideIn 0.28s cubic-bezier(0.34,1.56,0.64,1)'
          }}>

            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #8b4513 0%, #b8734a 50%, #c49a72 100%)',
              padding: '14px 18px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              boxShadow: '0 2px 12px rgba(44,24,16,0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                <div style={{
                  width: '40px', height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  border: '1.5px solid rgba(255,255,255,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem',
                  flexShrink: 0
                }}>🕉️</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.01em' }}>
                    EverAura AI Assistant
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', opacity: 0.88, marginTop: '2px' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px rgba(74,222,128,0.7)' }} />
                    Nadiad Hub · 🔒 Private &amp; Secure
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: '#fff',
                  width: '30px', height: '30px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem',
                  transition: 'background 0.15s',
                  flexShrink: 0
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              >✕</button>
            </div>

            {/* Privacy Banner */}
            <div style={{
              background: '#fdf3eb',
              padding: '7px 14px',
              fontSize: '0.72rem',
              color: '#9e7a5f',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '6px',
              borderBottom: '1px solid rgba(184,115,74,0.12)',
              flexShrink: 0
            }}>
              <span>🔒</span>
              <span>We never share your mobile number. Nadiad local delivery guaranteed.</span>
            </div>

            {/* Messages Area */}
            <div
              className="chatbot-messages"
              style={{
                flex: 1,
                padding: '16px 14px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                background: 'linear-gradient(180deg, rgba(253,248,242,0.6) 0%, rgba(255,253,250,0.4) 100%)'
              }}
            >
              {messages.map((msg, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  gap: '6px'
                }}>
                  {/* Bubble */}
                  <div style={{
                    maxWidth: '83%',
                    padding: '11px 15px',
                    borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: msg.sender === 'user'
                      ? 'linear-gradient(135deg, #b8734a, #c49a72)'
                      : '#fff',
                    color: msg.sender === 'user' ? '#fff' : '#3d2b1a',
                    boxShadow: msg.sender === 'user'
                      ? '0 4px 14px rgba(184,115,74,0.35)'
                      : '0 2px 10px rgba(0,0,0,0.06)',
                    border: msg.sender === 'bot' ? '1px solid rgba(184,115,74,0.15)' : 'none',
                    fontSize: '0.89rem',
                    lineHeight: '1.55',
                    wordBreak: 'break-word'
                  }}>
                    {renderMarkdown(msg.text)}
                  </div>

                  {/* WhatsApp Direct Button — shown for Send Query confirmation */}
                  {msg.waButton && (
                    <a
                      href={msg.waButton}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'linear-gradient(135deg, #25d366, #128c7e)',
                        color: '#fff',
                        textDecoration: 'none',
                        padding: '10px 18px',
                        borderRadius: '22px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        boxShadow: '0 4px 14px rgba(37,211,102,0.35)',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                        maxWidth: '83%'
                      }}
                      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,211,102,0.5)'; }}
                      onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,211,102,0.35)'; }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>💬</span>
                      Message on WhatsApp
                    </a>
                  )}

                  {/* Quick Reply Chips — only show on last bot message */}
                  {msg.quickReplies && idx === messages.length - 1 && (

                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      maxWidth: '90%'
                    }}>
                      {msg.quickReplies.map((qr, qIdx) => (
                        <button
                          key={qIdx}
                          className="chatbot-qr-btn"
                          onClick={() => sendMessage(qr)}
                          disabled={isLoading}
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && <TypingDots />}
              <div ref={messagesEndRef} />
            </div>

            {/* File Attachment Preview */}
            {selectedFile && (
              <div style={{
                background: '#fdf3eb',
                padding: '7px 14px',
                fontSize: '0.8rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderTop: '1px solid rgba(184,115,74,0.18)',
                flexShrink: 0,
                gap: '8px'
              }}>
                <span style={{ color: '#8b4513', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  📎 {selectedFile.name}
                </span>
                <button
                  onClick={() => setSelectedFile(null)}
                  style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}
                >✕</button>
              </div>
            )}

            {/* Input Footer */}
            <div style={{
              padding: '11px 13px',
              background: '#fff',
              borderTop: '1px solid rgba(184,115,74,0.15)',
              display: 'flex', alignItems: 'center', gap: '8px',
              flexShrink: 0
            }}>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />

              {/* Attach Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Attach reference design image"
                style={{
                  background: '#fdf3eb',
                  border: '1.5px solid rgba(184,115,74,0.3)',
                  width: '38px', height: '38px',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: '1rem',
                  color: '#b8734a', flexShrink: 0,
                  transition: 'background 0.15s'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#f5e6d4'}
                onMouseOut={e => e.currentTarget.style.background = '#fdf3eb'}
              >📎</button>

              {/* Text Input */}
              <input
                ref={inputRef}
                className="chatbot-input"
                type="text"
                placeholder="Ask anything or type in Gujlish..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                disabled={isLoading}
              />

              {/* Send Button */}
              <button
                className="chatbot-send-btn"
                onClick={() => sendMessage()}
                disabled={isLoading || (!input.trim() && !selectedFile)}
                title="Send"
              >➤</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatbotWidget;
