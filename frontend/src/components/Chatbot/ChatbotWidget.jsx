import React, { useState, useEffect, useRef, useCallback } from 'react';

/* ── Simple Markdown Renderer ─────────────────────────────────────────────
   Converts **bold**, `code`, and \n → proper JSX without any dependencies.
────────────────────────────────────────────────────────────────────────── */
const renderMarkdown = (text) => {
  if (!text) return null;
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
      parts.push(<strong key={key++} style={{ fontWeight: 700, color: 'inherit' }}>{match[1]}</strong>);
    } else if (match[2] !== undefined) {
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

/* ── Format timestamp ────────────────────────────────────────────────── */
const formatTime = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
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
      text: "Namaste! Kem cho! 🙏\n\n**EverAura Creations** ma aapno swagat che!\n\nPlease choose your preferred language:\n*(Tamari pasandida bhasha pasand karo:)*",
      quickReplies: ['🇬🇧 English', '🇮🇳 Gujarati (ગુજરાતી)'],
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [state, setState] = useState('LANG_SELECT');
  const [sessionData, setSessionData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState(null);
  // Track which user messages have been "delivered" (bot has replied since)
  const [deliveredIndices, setDeliveredIndices] = useState(new Set());

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

  const sendMessage = useCallback(async (textToSend) => {
    const msgText = textToSend !== undefined ? textToSend : input;
    if (!msgText.trim() && !selectedFile) return;

    const now = new Date();
    const userMsgIndex = messages.filter(m => m.sender === 'user').length;

    // Append user message
    setMessages(prev => [
      ...prev.map(m => ({ ...m, quickReplies: null })),
      {
        sender: 'user',
        text: msgText,
        timestamp: now,
        status: 'sent',
        imagePreview: selectedFilePreview
      }
    ]);
    if (textToSend === undefined) setInput('');
    setIsLoading(true);

    try {
      let updatedSessionData = { ...sessionData };

      // Upload image if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('referenceImage', selectedFile);
        try {
          const uploadRes = await fetch('/api/chat/upload', { method: 'POST', body: formData });
          const uploadData = await uploadRes.json();
          if (uploadData.success) {
            updatedSessionData.reference_image = uploadData.imageUrl;
          }
        } catch (uploadErr) {
          console.error('Image upload error:', uploadErr);
        }
        setSelectedFile(null);
        setSelectedFilePreview(null);
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msgText, state, sessionData: updatedSessionData })
      });

      const data = await res.json();
      setState(data.nextState || 'INIT');
      if (data.sessionData) setSessionData(data.sessionData);

      // Mark the just-sent user message as "delivered"
      setDeliveredIndices(prev => new Set([...prev, userMsgIndex]));

      const botTimestamp = new Date();

      if (data.customerWaUrl) {
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: data.reply, quickReplies: data.quickReplies || null, timestamp: botTimestamp },
          {
            sender: 'bot',
            text: `💬 **Tap below to message us on WhatsApp directly:**`,
            quickReplies: null,
            waButton: data.customerWaUrl,
            timestamp: new Date()
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: data.reply, quickReplies: data.quickReplies || null, timestamp: botTimestamp }
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: "⚠️ Sorry, I encountered a brief connection issue. Please try again or click **✨ Place an Order** below!",
          quickReplies: ['✨ Place an Order', '📍 Delivery Info'],
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, selectedFile, selectedFilePreview, sessionData, state, messages]);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setSelectedFilePreview(previewUrl);
    }
  };

  // Determine if a chip set should use grid layout (main menu type)
  const isMainMenuChips = (chips) => chips && chips.length >= 4;

  // Count total user messages for delivery tracking
  const getUserMsgCount = (msgs, idx) => {
    let count = 0;
    for (let i = 0; i <= idx; i++) {
      if (msgs[i].sender === 'user') count++;
    }
    return count - 1; // zero-indexed
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
        @keyframes msgFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Quick Reply Chips ── */
        .cb-chip {
          background: #fdf8f2;
          border: 1.5px solid #b8734a;
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 0.82rem;
          color: #7a4a2a;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.18s, color 0.18s, transform 0.15s, box-shadow 0.18s;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 4px;
          letter-spacing: 0.01em;
        }
        .cb-chip:hover:not(:disabled) {
          background: linear-gradient(135deg, #b8734a, #c49a72);
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(184,115,74,0.35);
        }
        .cb-chip:active:not(:disabled) { transform: scale(0.96); }
        .cb-chip:disabled { opacity: 0.45; cursor: not-allowed; }

        /* ── Grid layout for main-menu chips ── */
        .cb-chips-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;
          width: 100%;
          max-width: 310px;
        }
        .cb-chips-grid .cb-chip {
          justify-content: flex-start;
          white-space: normal;
          text-align: left;
        }
        /* Language chips — side by side, larger */
        .cb-chips-lang {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .cb-chips-lang .cb-chip {
          flex: 1;
          justify-content: center;
          padding: 10px 16px;
          font-size: 0.88rem;
          border-width: 2px;
        }
        /* Inline chips — horizontal wrap */
        .cb-chips-inline {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          max-width: 90%;
        }

        /* ── Input field ── */
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

        /* ── Send button ── */
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

        /* ── Scrollbar ── */
        .chatbot-messages::-webkit-scrollbar { width: 4px; }
        .chatbot-messages::-webkit-scrollbar-track { background: transparent; }
        .chatbot-messages::-webkit-scrollbar-thumb { background: rgba(184,115,74,0.25); border-radius: 4px; }

        /* ── Image preview in bubble ── */
        .cb-img-preview {
          max-width: 180px;
          border-radius: 10px;
          margin-bottom: 6px;
          display: block;
          border: 2px solid rgba(255,255,255,0.35);
        }

        /* ── Message tick / timestamp row ── */
        .cb-meta {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.68rem;
          color: #b8a090;
          margin-top: 3px;
        }
        .cb-meta-user {
          justify-content: flex-end;
          color: rgba(184,115,74,0.7);
        }
        .cb-tick { font-size: 0.75rem; }
        .cb-tick-delivered { color: #4ade80; }

        /* ── Header menu btn ── */
        .cb-menu-btn {
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          color: #fff;
          width: 30px; height: 30px;
          border-radius: 50%;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem;
          transition: background 0.15s;
          flex-shrink: 0;
        }
        .cb-menu-btn:hover { background: rgba(255,255,255,0.28); }

        /* ── WhatsApp button ── */
        .cb-wa-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #25D366;
          color: #fff;
          border: none;
          padding: 9px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.18s, transform 0.15s;
          margin-top: 4px;
        }
        .cb-wa-btn:hover { background: #128C7E; transform: translateY(-1px); }

        /* ── Image send button ── */
        .cb-img-send-btn {
          background: linear-gradient(135deg, #b8734a, #c49a72);
          color: #fff;
          border: none;
          padding: 9px 18px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          display: flex; align-items: center; gap: 6px;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 3px 10px rgba(184,115,74,0.35);
        }
        .cb-img-send-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 14px rgba(184,115,74,0.45); }
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
            height: 'min(620px, 90vh)',
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

              {/* Header action buttons */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {/* ☰ Menu button */}
                <button
                  className="cb-menu-btn"
                  onClick={() => sendMessage('🏠 Main Menu')}
                  title="Main Menu"
                  disabled={isLoading}
                >
                  ☰
                </button>
                {/* ✕ Close button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="cb-menu-btn"
                  title="Close"
                >✕</button>
              </div>
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
                gap: '14px',
                background: 'linear-gradient(180deg, rgba(253,248,242,0.6) 0%, rgba(255,253,250,0.4) 100%)'
              }}
            >
              {messages.map((msg, idx) => {
                const isUser = msg.sender === 'user';
                const userIdx = isUser ? getUserMsgCount(messages, idx) : -1;
                const isDelivered = isUser && deliveredIndices.has(userIdx);
                const isLastMsg = idx === messages.length - 1;

                // Decide chip layout class
                let chipClass = 'cb-chips-inline';
                if (msg.quickReplies && msg.quickReplies.length === 2 &&
                    (msg.quickReplies[0].includes('English') || msg.quickReplies[0].includes('🇬🇧'))) {
                  chipClass = 'cb-chips-lang';
                } else if (isMainMenuChips(msg.quickReplies)) {
                  chipClass = 'cb-chips-grid';
                }

                return (
                  <div key={idx} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    gap: '4px',
                    animation: 'msgFadeIn 0.22s ease-out'
                  }}>
                    {/* Image preview (user uploaded) */}
                    {isUser && msg.imagePreview && (
                      <div style={{ maxWidth: '83%', display: 'flex', justifyContent: 'flex-end' }}>
                        <img
                          src={msg.imagePreview}
                          alt="Attached"
                          className="cb-img-preview"
                          style={{ maxWidth: '160px', borderRadius: '12px', border: '2px solid rgba(184,115,74,0.3)' }}
                        />
                      </div>
                    )}

                    {/* Bubble */}
                    <div style={{
                      maxWidth: '83%',
                      padding: '11px 15px',
                      borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: isUser
                        ? 'linear-gradient(135deg, #b8734a, #c49a72)'
                        : '#fff',
                      color: isUser ? '#fff' : '#3d2b1a',
                      boxShadow: isUser
                        ? '0 4px 14px rgba(184,115,74,0.35)'
                        : '0 2px 10px rgba(0,0,0,0.06)',
                      border: !isUser ? '1px solid rgba(184,115,74,0.15)' : 'none',
                      fontSize: '0.89rem',
                      lineHeight: '1.55',
                      wordBreak: 'break-word'
                    }}>
                      {renderMarkdown(msg.text)}
                    </div>

                    {/* WhatsApp button */}
                    {msg.waButton && (
                      <a href={msg.waButton} target="_blank" rel="noopener noreferrer" className="cb-wa-btn">
                        <span>💬</span> Open WhatsApp
                      </a>
                    )}

                    {/* Timestamp + tick row */}
                    <div className={`cb-meta ${isUser ? 'cb-meta-user' : ''}`}>
                      <span>{formatTime(msg.timestamp)}</span>
                      {isUser && (
                        <span className={`cb-tick ${isDelivered ? 'cb-tick-delivered' : ''}`}>
                          {isDelivered ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>

                    {/* Quick Reply Chips — only show on last bot message */}
                    {msg.quickReplies && isLastMsg && !isLoading && (
                      <div className={chipClass}>
                        {msg.quickReplies.map((qr, qIdx) => (
                          <button
                            key={qIdx}
                            className="cb-chip"
                            onClick={() => sendMessage(qr)}
                            disabled={isLoading}
                          >
                            {qr}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isLoading && <TypingDots />}
              <div ref={messagesEndRef} />
            </div>

            {/* Image Attachment Preview Bar */}
            {selectedFile && (
              <div style={{
                background: '#fdf3eb',
                padding: '10px 14px',
                fontSize: '0.82rem',
                display: 'flex', flexDirection: 'column', gap: '8px',
                borderTop: '1px solid rgba(184,115,74,0.18)',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8b4513', fontWeight: 600 }}>📎 {selectedFile.name}</span>
                  <button
                    onClick={() => { setSelectedFile(null); setSelectedFilePreview(null); }}
                    style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}
                  >✕</button>
                </div>
                {selectedFilePreview && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={selectedFilePreview} alt="preview" style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', border: '1.5px solid rgba(184,115,74,0.3)' }} />
                    <button
                      className="cb-img-send-btn"
                      onClick={() => sendMessage(input.trim() || 'Here is my reference image 📎')}
                      disabled={isLoading}
                    >
                      📤 Send Image
                    </button>
                  </div>
                )}
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
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/*"
              />

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
                placeholder="Type in English or Gujarati..."
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
