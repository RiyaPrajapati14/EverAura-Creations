import React, { useState, useEffect, useCallback, useRef } from 'react';

/* ── Status config ─────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  'Received':                     { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', emoji: '📥' },
  'In Production':                 { color: '#d97706', bg: '#fffbeb', border: '#fde68a', emoji: '🎨' },
  'Ready for Delivery in Nadiad': { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', emoji: '📦' },
  'Completed':                    { color: '#6b21a8', bg: '#faf5ff', border: '#e9d5ff', emoji: '✅' },
  'Cancelled':                    { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', emoji: '❌' },
};

/* ── Inline styles shared ─────────────────────────────────────────────── */
const S = {
  card: { background: '#fff', border: '1px solid rgba(184,115,74,0.2)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' },
  label: { fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9e7a5f', display: 'block', marginBottom: '3px' },
  value: { fontWeight: 600, color: '#3d2b1a', fontSize: '0.95rem' },
  btn: (bg, color, border) => ({ background: bg, color, border: border || 'none', borderRadius: '10px', padding: '8px 18px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.18s', fontFamily: 'inherit' }),
};

/* ── Custom Modal ──────────────────────────────────────────────────────── */
const Modal = ({ title, children, onClose, width = '480px' }) => (
  <div
    onClick={onClose}
    style={{ position: 'fixed', inset: 0, background: 'rgba(20,10,5,0.65)', backdropFilter: 'blur(6px)', zIndex: 9999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
  >
    <div
      onClick={e => e.stopPropagation()}
      style={{ background: '#fff', width: '100%', maxWidth: width, borderRadius: '20px', border: '1.5px solid rgba(184,115,74,0.3)', boxShadow: '0 24px 64px rgba(0,0,0,0.3)', overflow: 'hidden', animation: 'adminModalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)' }}
    >
      <div style={{ background: 'linear-gradient(135deg, #8b4513, #b8734a)', padding: '16px 22px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: '1rem' }}>{title}</span>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
      </div>
      <div style={{ padding: '22px 24px' }}>{children}</div>
    </div>
  </div>
);

/* ── Confirm Dialog ─────────────────────────────────────────────────────── */
const ConfirmDialog = ({ message, onConfirm, onCancel, confirmText = 'Confirm', confirmColor = '#b8734a', extra }) => (
  <Modal title="Confirm Action" onClose={onCancel}>
    <p style={{ color: '#3d2b1a', lineHeight: 1.6, marginBottom: '8px' }}>{message}</p>
    {extra}
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
      <button onClick={onCancel} style={S.btn('#f5f0eb', '#6b4c32', '1px solid rgba(184,115,74,0.3)')}>Cancel</button>
      <button onClick={onConfirm} style={{ ...S.btn(confirmColor, '#fff'), boxShadow: `0 4px 12px ${confirmColor}55` }}>{confirmText}</button>
    </div>
  </Modal>
);

/* ── Status Badge ───────────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Received'];
  return (
    <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, padding: '4px 10px', borderRadius: '20px', fontSize: '0.76rem', fontWeight: 700 }}>
      {cfg.emoji} {status}
    </span>
  );
};

/* ── Stats Bar ─────────────────────────────────────────────────────────── */
const StatsBar = ({ orders }) => {
  const stats = [
    { label: 'Total Orders',  value: orders.length,                                          color: '#b8734a', bg: '#fdf3eb', emoji: '📋' },
    { label: 'In Production', value: orders.filter(o => o.status === 'In Production').length, color: '#d97706', bg: '#fffbeb', emoji: '🎨' },
    { label: 'Ready',         value: orders.filter(o => o.status === 'Ready for Delivery in Nadiad').length, color: '#16a34a', bg: '#f0fdf4', emoji: '📦' },
    { label: 'Completed',     value: orders.filter(o => o.status === 'Completed').length,     color: '#6b21a8', bg: '#faf5ff', emoji: '✅' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '22px' }}>
      {stats.map(s => (
        <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}33`, borderRadius: '14px', padding: '14px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{s.emoji}</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
          <div style={{ fontSize: '0.72rem', color: '#9e7a5f', marginTop: '4px', fontWeight: 600 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
};

/* ── Message Templates ─────────────────────────────────────────────────── */
const MESSAGE_TEMPLATES = [
  { label: '⚠️ Urgent Attention Required',   text: 'We urgently need to speak with you regarding your order. Please call or WhatsApp us at your earliest convenience. Thank you!' },
  { label: '📐 Design Approval Needed',       text: 'We have completed the initial design for your order and need your approval before we proceed to the final production stage. Please share your feedback!' },
  { label: '🖼️ Reference Image Needed',       text: 'To proceed with your customization, we need a reference photo or design example from you. Please send it on WhatsApp at your earliest.' },
  { label: '💳 Payment Confirmation',         text: 'This is a gentle reminder to confirm your advance payment so we can start production on your beautiful custom order. Payment details will be shared shortly.' },
  { label: '📦 Ready — Confirm Delivery Time',text: 'Wonderful news! Your EverAura creation is ready for delivery in Nadiad! 🎉 Please let us know your preferred delivery time slot today.' },
  { label: '⏳ Production Delay Update',       text: 'We sincerely apologize, but due to high demand your order production is running slightly behind schedule. Your order will be ready within an additional 2–3 days. We appreciate your patience!' },
  { label: '🎨 Color/Detail Clarification',   text: 'We have a quick question about the color theme / customization details for your order. Could you please clarify so we can create exactly what you envisioned?' },
  { label: '✅ Order Completed — Review?',     text: 'Your EverAura order has been completed and delivered! We hope you absolutely love it. 😊 Would you be kind enough to share a review or a photo? It means the world to us!' },
  { label: '✏️ Custom Message',               text: '' },
];

/* ── Contact Customer Modal ─────────────────────────────────────────────── */
const ContactModal = ({ order, onClose, showToast }) => {
  const [selectedTemplate, setSelectedTemplate] = React.useState(0);
  const [customText, setCustomText] = React.useState(MESSAGE_TEMPLATES[0].text);
  const [sending, setSending] = React.useState(false);

  const handleTemplateChange = (idx) => {
    setSelectedTemplate(idx);
    setCustomText(MESSAGE_TEMPLATES[idx].text);
  };

  const handleSend = async () => {
    if (!customText.trim()) { showToast('Please enter a message first.', 'error'); return; }
    setSending(true);
    try {
      const res = await fetch(`/api/orders/${order.order_id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: customText.trim() })
      });
      const data = await res.json();
      if (data.status === 'success') {
        window.open(data.waUrl, '_blank');
        showToast('📲 WhatsApp opened! Message ready to send.');
        onClose();
      } else {
        showToast('Failed: ' + (data.message || ''), 'error');
      }
    } catch {
      showToast('Network error.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal title={`📲 Contact Customer — ${order.customer_name}`} onClose={onClose} width="560px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Customer info strip */}
        <div style={{ background: '#fdf8f2', borderRadius: '10px', padding: '10px 14px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: '#6b4c32' }}><strong>📱</strong> +91 {order.phone}</span>
          <span style={{ fontSize: '0.85rem', color: '#6b4c32' }}><strong>🎨</strong> {order.product_required}</span>
          <span style={{ fontSize: '0.85rem', color: '#6b4c32' }}><strong>#</strong> {order.order_id}</span>
        </div>

        {/* Template picker */}
        <div>
          <label style={S.label}>Choose Message Template</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto', padding: '4px 0' }}>
            {MESSAGE_TEMPLATES.map((tmpl, idx) => (
              <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '9px 12px', borderRadius: '10px', cursor: 'pointer', background: selectedTemplate === idx ? '#fdf3eb' : '#faf6f1', border: `1.5px solid ${selectedTemplate === idx ? '#b8734a' : 'transparent'}`, transition: 'all 0.15s' }}>
                <input type="radio" name="tmpl" checked={selectedTemplate === idx} onChange={() => handleTemplateChange(idx)} style={{ marginTop: '2px', accentColor: '#b8734a' }} />
                <span style={{ fontSize: '0.85rem', color: '#3d2b1a', fontWeight: selectedTemplate === idx ? 600 : 400 }}>{tmpl.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Message editor */}
        <div>
          <label style={S.label}>Message Preview & Editor</label>
          <div style={{ fontSize: '0.78rem', color: '#9e7a5f', marginBottom: '6px', fontStyle: 'italic' }}>
            Auto-prefixed with customer name & order ID when sent.
          </div>
          <textarea
            className="admin-input"
            rows={5}
            value={customText}
            onChange={e => setCustomText(e.target.value)}
            placeholder="Type your custom urgent message here..."
            style={{ width: '100%', resize: 'vertical', lineHeight: 1.55, boxSizing: 'border-box' }}
          />
          <div style={{ fontSize: '0.75rem', color: '#9e7a5f', marginTop: '4px' }}>{customText.length} characters</div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px' }}>
          <button onClick={onClose} style={S.btn('#f5f0eb', '#6b4c32', '1px solid rgba(184,115,74,0.3)')}>Cancel</button>
          <button
            onClick={handleSend}
            disabled={sending || !customText.trim()}
            style={{ ...S.btn('#16a34a', '#fff'), display: 'flex', alignItems: 'center', gap: '7px', boxShadow: '0 4px 14px #16a34a44', opacity: sending ? 0.7 : 1 }}
          >
            {sending ? '⏳ Opening...' : '💬 Open WhatsApp & Send'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

/* ── Bulk Alert Modal ───────────────────────────────────────────────────── */
const BulkAlertModal = ({ orders, onClose, showToast }) => {
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [message, setMessage] = React.useState('');
  const [links, setLinks] = React.useState([]);
  const [step, setStep] = React.useState('compose'); // 'compose' | 'links'
  const [loading, setLoading] = React.useState(false);

  const targetCount = statusFilter === 'All' ? orders.length : orders.filter(o => o.status === statusFilter).length;

  const handleGenerate = async () => {
    if (!message.trim()) { showToast('Please enter a message.', 'error'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/orders/bulk-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim(), statusFilter })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setLinks(data.links || []);
        setStep('links');
        showToast(`✅ ${data.count} WhatsApp links generated!`);
      } else {
        showToast('Error: ' + (data.message || ''), 'error');
      }
    } catch {
      showToast('Network error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="📢 Bulk Customer Alert" onClose={onClose} width="560px">
      {step === 'compose' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '10px 14px', fontSize: '0.85rem', color: '#92400e', lineHeight: 1.5 }}>
            ⚠️ This will generate individual WhatsApp links for each selected customer. You'll send each message manually from your phone.
          </div>
          <div>
            <label style={S.label}>Filter by Order Status</label>
            <select className="admin-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: '100%' }}>
              <option value="All">All Active Orders ({orders.length})</option>
              {Object.keys(STATUS_CONFIG).map(s => (
                <option key={s} value={s}>{STATUS_CONFIG[s].emoji} {s} ({orders.filter(o => o.status === s).length})</option>
              ))}
            </select>
            <div style={{ marginTop: '6px', fontSize: '0.8rem', color: '#9e7a5f' }}>Will generate links for <strong style={{ color: '#b8734a' }}>{targetCount} customer(s)</strong></div>
          </div>
          <div>
            <label style={S.label}>Broadcast Message</label>
            <textarea
              className="admin-input"
              rows={5}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type the urgent message to send to all selected customers..."
              style={{ width: '100%', resize: 'vertical', lineHeight: 1.55, boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={S.btn('#f5f0eb', '#6b4c32', '1px solid rgba(184,115,74,0.3)')}>Cancel</button>
            <button onClick={handleGenerate} disabled={loading || targetCount === 0 || !message.trim()}
              style={{ ...S.btn('#d97706', '#fff'), boxShadow: '0 4px 14px #d9770644', opacity: loading ? 0.7 : 1 }}>
              {loading ? '⏳ Generating...' : `📲 Generate ${targetCount} WhatsApp Links`}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '10px 14px', fontSize: '0.85rem', color: '#166534' }}>
            ✅ {links.length} WhatsApp links generated! Click each to open and send.
          </div>
          <div style={{ maxHeight: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {links.map((link, i) => (
              <div key={link.order_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#fdf8f2', borderRadius: '10px', gap: '10px' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#3d2b1a', fontSize: '0.88rem' }}>{i + 1}. {link.customer_name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#9e7a5f' }}>📱 {link.phone} · #{link.order_id}</div>
                </div>
                <a href={link.waUrl} target="_blank" rel="noreferrer"
                  style={{ ...S.btn('#16a34a', '#fff'), textDecoration: 'none', fontSize: '0.8rem', padding: '6px 12px', whiteSpace: 'nowrap', boxShadow: '0 2px 8px #16a34a44' }}>
                  💬 Send
                </a>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setStep('compose')} style={S.btn('#f5f0eb', '#6b4c32', '1px solid rgba(184,115,74,0.3)')}>← Back</button>
          </div>
        </div>
      )}
    </Modal>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   MAIN ADMIN COMPONENT
══════════════════════════════════════════════════════════════════════════ */
const StudioAdmin = ({ isOpen, onClose }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [toast, setToast] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [contactOrder, setContactOrder] = useState(null);   // order obj for ContactModal
  const [showBulkAlert, setShowBulkAlert] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [noteInputs, setNoteInputs] = useState({});
  const [customerMessageInputs, setCustomerMessageInputs] = useState({});
  const pinRef = useRef(null);

  /* ── Query-related state ── */
  const [queries, setQueries] = useState([]);
  const [queriesLoading, setQueriesLoading] = useState(false);
  const [unreadQueryCount, setUnreadQueryCount] = useState(0);
  const [expandedQuery, setExpandedQuery] = useState(null);
  const [replyInputs, setReplyInputs] = useState({});       // { [queryId]: 'reply text' }
  const [sendingReply, setSendingReply] = useState({});     // { [queryId]: true/false }

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.status === 'success') {
        setOrders(data.orders || []);
      }
    } catch (err) {
      showToast('Failed to load orders. Check backend connection.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  /* ── Fetch all queries ── */
  const fetchQueries = useCallback(async () => {
    setQueriesLoading(true);
    try {
      const res = await fetch('/api/queries');
      const data = await res.json();
      if (Array.isArray(data)) setQueries(data);
    } catch {
      showToast('Failed to load queries.', 'error');
    } finally {
      setQueriesLoading(false);
    }
  }, [showToast]);

  /* ── Fetch unread count for badge ── */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/queries/unread-count');
      const data = await res.json();
      if (typeof data.count === 'number') setUnreadQueryCount(data.count);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      fetchOrders();
      fetchQueries();
      fetchUnreadCount();
    }
  }, [isAuthenticated, isOpen, fetchOrders, fetchQueries, fetchUnreadCount]);

  /* ── Poll unread query count every 30 seconds ── */
  useEffect(() => {
    if (!isAuthenticated || !isOpen) return;
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, isOpen, fetchUnreadCount]);

  // Keyboard Escape closes the panel
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (dialog) { setDialog(null); return; }
        onClose();
      }
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose, dialog]);

  useEffect(() => {
    if (isOpen && !isAuthenticated) setTimeout(() => pinRef.current?.focus(), 100);
  }, [isOpen, isAuthenticated]);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (['nadiad2026', 'everaura', 'admin'].includes(pin)) {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('❌ Incorrect PIN. Try: nadiad2026');
      setTimeout(() => setPinError(''), 3000);
    }
  };

  /* ── Status change: open confirm dialog first ── */
  const requestStatusChange = (orderId, newStatus) => {
    setDialog({ type: 'status', orderId, newStatus });
  };

  const confirmStatusChange = async () => {
    const { orderId, newStatus } = dialog;
    setDialog(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o));
        if (newStatus === 'Ready for Delivery in Nadiad' && data.waNotificationUrl) {
          setDialog({ type: 'whatsapp', orderId, waUrl: data.waNotificationUrl });
        } else {
          showToast(`✅ Status updated to "${newStatus}"`);
        }
      } else {
        showToast('Failed to update status: ' + (data.message || 'Unknown error'), 'error');
      }
    } catch {
      showToast('Network error updating status.', 'error');
    }
  };

  /* ── Delete order ── */
  const requestDelete = (orderId) => {
    setDialog({ type: 'delete', orderId });
  };

  const confirmDelete = async () => {
    const { orderId } = dialog;
    setDialog(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'success') {
        setOrders(prev => prev.filter(o => o.order_id !== orderId));
        showToast('🗑️ Order deleted successfully.');
      } else {
        showToast('Delete failed: ' + (data.message || ''), 'error');
      }
    } catch {
      showToast('Network error deleting order.', 'error');
    }
  };

  /* ── Save admin note ── */
  const saveNote = async (orderId) => {
    const note = noteInputs[orderId] || '';
    try {
      const res = await fetch(`/api/orders/${orderId}/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, admin_notes: note } : o));
        showToast('📝 Note saved!');
      }
    } catch {
      showToast('Failed to save note.', 'error');
    }
  };

  const saveCustomerMessage = async (orderId) => {
    const message = customerMessageInputs[orderId] || '';
    try {
      const res = await fetch(`/api/orders/${orderId}/customer-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, customer_message: message } : o));
        showToast('💬 Customer message saved!');
      }
    } catch {
      showToast('Failed to save customer message.', 'error');
    }
  };

  /* ── Mark query as read ── */
  const markQueryRead = async (queryId) => {
    try {
      await fetch(`/api/queries/${queryId}/read`, { method: 'PATCH' });
      setQueries(prev => prev.map(q => q.queryId === queryId ? { ...q, isReadByAdmin: true } : q));
      setUnreadQueryCount(prev => Math.max(0, prev - 1));
    } catch { /* silent */ }
  };

  /* ── Send admin reply to query ── */
  const sendQueryReply = async (queryId) => {
    const text = (replyInputs[queryId] || '').trim();
    if (!text) return showToast('Please type a reply first.', 'error');
    setSendingReply(prev => ({ ...prev, [queryId]: true }));
    try {
      const res = await fetch(`/api/queries/${queryId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (data.success) {
        setQueries(prev => prev.map(q => q.queryId === queryId ? data.query : q));
        setReplyInputs(prev => ({ ...prev, [queryId]: '' }));
        showToast('📨 Reply sent to customer!');
      } else {
        showToast(data.error || 'Failed to send reply.', 'error');
      }
    } catch {
      showToast('Network error sending reply.', 'error');
    } finally {
      setSendingReply(prev => ({ ...prev, [queryId]: false }));
    }
  };

  /* ── Filtered orders ── */
  const filteredOrders = orders.filter(o => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      (o.customer_name || '').toLowerCase().includes(q) ||
      (o.phone || '').includes(q) ||
      (o.order_id || '').includes(q) ||
      (o.product_required || '').toLowerCase().includes(q);
    const matchStatus = filterStatus === 'All' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes adminModalIn {
          from { opacity: 0; transform: scale(0.92) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes adminSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes adminToastIn {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes urgentPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(22,163,74,0.5); }
          50%       { box-shadow: 0 0 0 6px rgba(22,163,74,0); }
        }
        .admin-tab { padding: 10px 20px; border: none; cursor: pointer; font-weight: 600; font-size: 0.88rem; border-bottom: 3px solid transparent; background: none; color: #9e7a5f; transition: all 0.18s; font-family: inherit; }
        .admin-tab.active { color: #b8734a; border-bottom-color: #b8734a; }
        .admin-tab:hover:not(.active) { color: #6b4c32; }
        .admin-order-card { background: #fffcf9; border: 1px solid rgba(184,115,74,0.2); border-radius: 16px; overflow: hidden; transition: box-shadow 0.2s; }
        .admin-order-card:hover { box-shadow: 0 4px 20px rgba(184,115,74,0.12); }
        .admin-input { padding: 9px 14px; border: 1.5px solid rgba(184,115,74,0.3); border-radius: 10px; font-size: 0.88rem; outline: none; background: #fdf8f2; color: #3d2b1a; font-family: inherit; transition: border-color 0.18s; }
        .admin-input:focus { border-color: #b8734a; box-shadow: 0 0 0 3px rgba(184,115,74,0.1); }
        .admin-select { padding: 7px 12px; border: 1.5px solid rgba(184,115,74,0.3); border-radius: 10px; font-size: 0.85rem; background: #fdf8f2; color: #3d2b1a; cursor: pointer; font-family: inherit; font-weight: 600; outline: none; }
        .admin-select:focus { border-color: #b8734a; }
        .admin-icon-btn { background: none; border: 1px solid rgba(184,115,74,0.25); border-radius: 8px; padding: 6px 10px; cursor: pointer; font-size: 0.85rem; transition: all 0.15s; }
        .admin-icon-btn:hover { background: rgba(184,115,74,0.08); border-color: #b8734a; }
        .price-row { display: grid; grid-template-columns: 1fr auto auto; gap: 12px; align-items: center; padding: 10px 14px; border-radius: 10px; }
        .price-row:nth-child(odd) { background: #fdf8f2; }
        .contact-btn { animation: urgentPulse 2s ease-in-out infinite; }
      `}</style>

      {/* Contact Customer Modal */}
      {contactOrder && (
        <ContactModal order={contactOrder} onClose={() => setContactOrder(null)} showToast={showToast} />
      )}

      {/* Bulk Alert Modal */}
      {showBulkAlert && (
        <BulkAlertModal onClose={() => setShowBulkAlert(false)} showToast={showToast} />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '24px', zIndex: 9999999,
          background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: toast.type === 'error' ? '#dc2626' : '#16a34a',
          border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          padding: '12px 20px', borderRadius: '12px', fontWeight: 600, fontSize: '0.88rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', animation: 'adminToastIn 0.25s ease',
          maxWidth: '360px'
        }}>
          {toast.msg}
        </div>
      )}

      {/* Dialogs */}
      {dialog?.type === 'status' && (
        <ConfirmDialog
          message={`Update order #${dialog.orderId} status to:`}
          extra={<div style={{ marginTop: '8px' }}><StatusBadge status={dialog.newStatus} /></div>}
          onConfirm={confirmStatusChange}
          onCancel={() => setDialog(null)}
          confirmText="Update Status"
        />
      )}
      {dialog?.type === 'delete' && (
        <ConfirmDialog
          message={`Permanently delete order #${dialog.orderId}? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDialog(null)}
          confirmText="Delete Order"
          confirmColor="#dc2626"
        />
      )}
      {dialog?.type === 'whatsapp' && (
        <Modal title="📦 Notify Customer on WhatsApp" onClose={() => { setDialog(null); showToast('✅ Status updated to "Ready for Delivery"'); }}>
          <p style={{ color: '#3d2b1a', lineHeight: 1.6, marginBottom: '16px' }}>
            Order <strong>#{dialog.orderId}</strong> is marked <strong style={{ color: '#16a34a' }}>Ready for Delivery in Nadiad!</strong><br /><br />
            Click below to open WhatsApp and send the customer a delivery notification instantly.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={() => { setDialog(null); showToast('✅ Status updated.'); }} style={S.btn('#f5f0eb', '#6b4c32', '1px solid rgba(184,115,74,0.3)')}>Skip</button>
            <a href={dialog.waUrl} target="_blank" rel="noreferrer"
              onClick={() => { setDialog(null); showToast('📲 WhatsApp opened!'); }}
              style={{ ...S.btn('#16a34a', '#fff'), textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px #16a34a55' }}>
              💬 Open WhatsApp
            </a>
          </div>
        </Modal>
      )}

      {/* Main overlay */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(20,10,5,0.8)', backdropFilter: 'blur(12px)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'Jost', system-ui, sans-serif" }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{ background: '#fffcf9', width: '100%', maxWidth: '1000px', maxHeight: '92vh', borderRadius: '24px', border: '2px solid rgba(184,115,74,0.4)', boxShadow: '0 32px 80px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'adminSlideIn 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
        >
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #5c2d0e 0%, #8b4513 40%, #b8734a 100%)', padding: '18px 24px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
                🎨 EverAura Studio — Admin Dashboard
              </h2>
              <p style={{ margin: '3px 0 0', fontSize: '0.78rem', opacity: 0.85 }}>
                Nadiad Artisan Command Center · {isAuthenticated ? `${orders.length} Orders` : 'Secure Access Required'}
              </p>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >✕</button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {!isAuthenticated ? (
              /* ── PIN Screen ── */
              <div style={{ maxWidth: '380px', margin: 'auto', padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
                <h3 style={{ fontWeight: 800, color: '#3d2b1a', marginBottom: '8px', fontSize: '1.3rem' }}>Studio Admin Access</h3>
                <p style={{ color: '#9e7a5f', fontSize: '0.88rem', marginBottom: '24px', lineHeight: 1.5 }}>
                  Enter your admin PIN to manage Nadiad customer orders.
                </p>
                <form onSubmit={handlePinSubmit} style={{ display: 'flex', gap: '10px' }}>
                  <input
                    ref={pinRef}
                    type="password"
                    className="admin-input"
                    placeholder="Enter PIN..."
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    style={{ flex: 1, textAlign: 'center', fontSize: '1.1rem', letterSpacing: '0.2em' }}
                  />
                  <button type="submit" style={{ ...S.btn('linear-gradient(135deg,#8b4513,#b8734a)', '#fff'), padding: '9px 20px', boxShadow: '0 4px 14px rgba(184,115,74,0.4)', borderRadius: '10px' }}>
                    Unlock
                  </button>
                </form>
                {pinError && <p style={{ color: '#dc2626', marginTop: '12px', fontSize: '0.88rem', fontWeight: 600 }}>{pinError}</p>}
              </div>
            ) : (
              /* ── Authenticated Dashboard ── */
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '2px solid rgba(184,115,74,0.15)', padding: '0 24px', background: '#fff', flexShrink: 0 }}>
                  {[
                    { key: 'orders',    label: `📦 Orders (${orders.length})` },
                    { key: 'queries',   label: `📬 Queries`, badge: unreadQueryCount },
                    { key: 'analytics', label: '📊 Analytics' },
                    { key: 'prices',    label: '💰 Price Reference' },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      className={`admin-tab ${activeTab === tab.key ? 'active' : ''}`}
                      onClick={() => { setActiveTab(tab.key); if (tab.key === 'queries') fetchQueries(); }}
                      style={{ position: 'relative' }}
                    >
                      {tab.label}
                      {tab.badge > 0 && (
                        <span style={{
                          position: 'absolute', top: '6px', right: '2px',
                          background: '#dc2626', color: '#fff',
                          borderRadius: '50%', width: '18px', height: '18px',
                          fontSize: '0.65rem', fontWeight: 800,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          animation: 'urgentPulse 1.5s ease-in-out infinite'
                        }}>{tab.badge > 9 ? '9+' : tab.badge}</span>
                      )}
                    </button>
                  ))}
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', alignItems: 'center', padding: '6px 0' }}>
                    <button onClick={fetchOrders} disabled={loading} style={{ ...S.btn('#fdf3eb', '#b8734a', '1px solid rgba(184,115,74,0.3)'), fontSize: '0.8rem', padding: '6px 14px', borderRadius: '8px' }}>
                      {loading ? '🔄 Loading...' : '🔄 Refresh'}
                    </button>
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}>

                  {/* ═══ ORDERS TAB ═══ */}
                  {activeTab === 'orders' && (
                    <div>
                      <StatsBar orders={orders} />

                      {/* Search & Filter */}
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
                        <input
                          className="admin-input"
                          style={{ flex: 1, minWidth: '200px' }}
                          placeholder="🔍  Search by name, phone, order ID or product..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                        />
                        <select className="admin-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                          <option value="All">All Statuses</option>
                          {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      {filteredOrders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fdf8f2', borderRadius: '16px' }}>
                          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📭</div>
                          <h4 style={{ color: '#3d2b1a', margin: '0 0 8px' }}>
                            {orders.length === 0 ? 'No orders yet' : 'No matching orders'}
                          </h4>
                          <p style={{ color: '#9e7a5f', fontSize: '0.88rem' }}>
                            {orders.length === 0 ? 'Customer orders will appear here as they come in via the AI Chatbot or Web Form.' : 'Try a different search or filter.'}
                          </p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          {filteredOrders.map(order => {
                            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['Received'];
                            const isExpanded = expandedOrder === order.order_id;
                            return (
                              <div key={order.order_id} className="admin-order-card">
                                {/* Card header */}
                                <div
                                  onClick={() => setExpandedOrder(isExpanded ? null : order.order_id)}
                                  style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: '10px', flexWrap: 'wrap', borderBottom: isExpanded ? '1px solid rgba(184,115,74,0.12)' : 'none' }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                    <span style={{ background: order.source === 'AI_CHATBOT' ? '#dcfce7' : '#eff6ff', color: order.source === 'AI_CHATBOT' ? '#166534' : '#1d4ed8', padding: '3px 9px', borderRadius: '10px', fontSize: '0.73rem', fontWeight: 700 }}>
                                      {order.source === 'AI_CHATBOT' ? '🤖 Chatbot' : '🌐 Web Form'}
                                    </span>
                                    <span style={{ fontWeight: 700, color: '#3d2b1a', fontSize: '0.92rem' }}>#{order.order_id}</span>
                                    <span style={{ color: '#9e7a5f', fontSize: '0.78rem' }}>
                                      {order.timestamp ? new Date(order.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                                    </span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <StatusBadge status={order.status || 'Received'} />
                                    <span style={{ color: '#9e7a5f', fontSize: '0.85rem' }}>{isExpanded ? '▲' : '▼'}</span>
                                  </div>
                                </div>

                                {isExpanded && (
                                  <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {/* Customer grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px' }}>
                                      {[
                                        { label: 'Customer Name',     value: order.customer_name },
                                        { label: 'Mobile Number', value: '+91 ' + order.phone },
                                        { label: 'Product Requested', value: order.product_required, accent: true },
                                        { label: 'Event / Delivery Date', value: order.event_date || 'Not specified' },
                                      ].map(f => (
                                        <div key={f.label} style={{ background: '#fdf8f2', padding: '10px 14px', borderRadius: '10px' }}>
                                          <span style={S.label}>{f.label}</span>
                                          {f.link
                                            ? <a href={f.link} target="_blank" rel="noreferrer" style={{ fontWeight: 700, color: '#16a34a', textDecoration: 'none', fontSize: '0.92rem' }}>{f.linkText}</a>
                                            : <span style={{ ...S.value, color: f.accent ? '#b8734a' : '#3d2b1a' }}>{f.value}</span>
                                          }
                                        </div>
                                      ))}
                                    </div>

                                    {/* Notes */}
                                    <div style={{ background: '#fdf8f2', padding: '12px 14px', borderRadius: '10px', fontSize: '0.88rem', color: '#6b4c32', lineHeight: 1.5 }}>
                                      <span style={{ ...S.label, marginBottom: '6px' }}>📝 Customization Notes</span>
                                      {order.customization_details}
                                    </div>

                                    {/* Reference image */}
                                    {order.reference_image && (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#6b4c32' }}>📎 Reference File:</span>
                                        <a href={order.reference_image} target="_blank" rel="noreferrer"
                                          style={{ ...S.btn('#b8734a', '#fff'), boxShadow: '0 2px 8px rgba(184,115,74,0.3)', fontSize: '0.8rem', padding: '6px 14px', borderRadius: '8px', textDecoration: 'none' }}>
                                          View Image ➔
                                        </a>
                                      </div>
                                    )}

                                    {/* Status update */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '12px 14px', background: `${cfg.bg}`, borderRadius: '12px', border: `1px solid ${cfg.border}` }}>
                                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: cfg.color }}>Update Status:</span>
                                      <select
                                        className="admin-select"
                                        value={order.status || 'Received'}
                                        onChange={e => requestStatusChange(order.order_id, e.target.value)}
                                        style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
                                      >
                                        {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{STATUS_CONFIG[s].emoji} {s}</option>)}
                                      </select>
                                    </div>

                                    {/* Admin notes */}
                                    <div>
                                      <span style={S.label}>🔐 Private Admin Notes (not visible to customer)</span>
                                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                                        <input
                                          className="admin-input"
                                          style={{ flex: 1 }}
                                          placeholder="Add private note about this order..."
                                          value={noteInputs[order.order_id] !== undefined ? noteInputs[order.order_id] : (order.admin_notes || '')}
                                          onChange={e => setNoteInputs(prev => ({ ...prev, [order.order_id]: e.target.value }))}
                                          onKeyDown={e => e.key === 'Enter' && saveNote(order.order_id)}
                                        />
                                        <button onClick={() => saveNote(order.order_id)} style={{ ...S.btn('#fdf3eb', '#b8734a', '1px solid rgba(184,115,74,0.3)'), padding: '9px 16px', borderRadius: '10px' }}>Save</button>
                                      </div>
                                    </div>

                                    {/* Customer Message */}
                                    <div>
                                      <span style={S.label}>💬 Message for Customer (visible when tracking)</span>
                                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                                        <textarea
                                          className="admin-input"
                                          style={{ flex: 1, resize: 'vertical' }}
                                          rows={2}
                                          placeholder="Type a message for the customer to see when they check their order status..."
                                          value={customerMessageInputs[order.order_id] !== undefined ? customerMessageInputs[order.order_id] : (order.customer_message || '')}
                                          onChange={e => setCustomerMessageInputs(prev => ({ ...prev, [order.order_id]: e.target.value }))}
                                        />
                                        <button onClick={() => saveCustomerMessage(order.order_id)} style={{ ...S.btn('#f0fdf4', '#16a34a', '1px solid rgba(22,163,74,0.3)'), padding: '9px 16px', borderRadius: '10px' }}>Save Message</button>
                                      </div>
                                    </div>

                                    {/* Delete */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                      <button onClick={() => requestDelete(order.order_id)}
                                        style={{ ...S.btn('#fef2f2', '#dc2626', '1px solid #fecaca'), fontSize: '0.8rem', padding: '7px 14px', borderRadius: '8px' }}>
                                        🗑️ Delete Order
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ═══ QUERIES TAB ═══ */}
                  {activeTab === 'queries' && (
                    <div>
                      {/* Header bar */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                        <div>
                          <h3 style={{ margin: 0, color: '#3d2b1a', fontSize: '1.05rem', fontWeight: 800 }}>
                            📬 Customer Queries
                          </h3>
                          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#9e7a5f' }}>
                            {queries.length} total · {unreadQueryCount} unread · Customers are notified via chatbot
                          </p>
                        </div>
                        <button
                          onClick={fetchQueries}
                          disabled={queriesLoading}
                          style={{ ...S.btn('#fdf3eb', '#b8734a', '1px solid rgba(184,115,74,0.3)'), fontSize: '0.8rem', padding: '6px 14px', borderRadius: '8px' }}
                        >
                          {queriesLoading ? '🔄 Loading...' : '🔄 Refresh'}
                        </button>
                      </div>

                      {queriesLoading && queries.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9e7a5f' }}>Loading queries...</div>
                      ) : queries.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fdf8f2', borderRadius: '16px' }}>
                          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📭</div>
                          <h4 style={{ color: '#3d2b1a', margin: '0 0 8px' }}>No queries yet</h4>
                          <p style={{ color: '#9e7a5f', fontSize: '0.88rem' }}>
                            Customer queries submitted via the AI Chatbot will appear here.
                          </p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {queries.map(q => {
                            const isExpanded = expandedQuery === q.queryId;
                            const hasReplies = q.adminReplies && q.adminReplies.length > 0;
                            const statusColors = {
                              open:    { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', emoji: '🟡' },
                              replied: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', emoji: '✅' },
                              closed:  { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe', emoji: '🔒' },
                            };
                            const sc = statusColors[q.status] || statusColors.open;
                            return (
                              <div
                                key={q.queryId}
                                style={{
                                  background: q.isReadByAdmin ? '#fffcf9' : '#fff5f5',
                                  border: `1px solid ${q.isReadByAdmin ? 'rgba(184,115,74,0.2)' : '#fca5a5'}`,
                                  borderRadius: '16px',
                                  overflow: 'hidden',
                                  transition: 'box-shadow 0.2s'
                                }}
                              >
                                {/* Query Card Header */}
                                <div
                                  onClick={() => {
                                    setExpandedQuery(isExpanded ? null : q.queryId);
                                    if (!q.isReadByAdmin) markQueryRead(q.queryId);
                                  }}
                                  style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: '10px', flexWrap: 'wrap', borderBottom: isExpanded ? '1px solid rgba(184,115,74,0.12)' : 'none' }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
                                    {!q.isReadByAdmin && (
                                      <span style={{ background: '#dc2626', color: '#fff', borderRadius: '6px', padding: '2px 7px', fontSize: '0.68rem', fontWeight: 800 }}>NEW</span>
                                    )}
                                    <span style={{ fontWeight: 700, color: '#3d2b1a', fontSize: '0.88rem' }}>{q.customerName}</span>
                                    <span style={{ color: '#9e7a5f', fontSize: '0.8rem' }}>+91 {q.phone}</span>
                                    <span style={{ color: '#b8734a', fontSize: '0.78rem', fontFamily: 'monospace' }}>{q.queryId}</span>
                                    <span style={{ color: '#9e7a5f', fontSize: '0.75rem' }}>
                                      {q.createdAt ? new Date(q.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, padding: '3px 9px', borderRadius: '20px', fontSize: '0.73rem', fontWeight: 700 }}>
                                      {sc.emoji} {q.status}
                                    </span>
                                    <span style={{ color: '#9e7a5f', fontSize: '0.85rem' }}>{isExpanded ? '▲' : '▼'}</span>
                                  </div>
                                </div>

                                {/* Query Card Expanded Body */}
                                {isExpanded && (
                                  <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

                                    {/* Discussion Thread */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      {/* Original Query */}
                                      <div style={{ background: '#fdf8f2', padding: '14px', borderRadius: '12px', borderLeft: '4px solid #b8734a' }}>
                                        <span style={{ ...S.label, marginBottom: '6px' }}>💬 Initial Query</span>
                                        <p style={{ margin: 0, color: '#3d2b1a', lineHeight: 1.6, fontSize: '0.9rem' }}>{q.queryText}</p>
                                      </div>

                                      {/* Weaved Replies */}
                                      {(() => {
                                        const allReplies = [
                                          ...(q.adminReplies || []).map(r => ({ ...r, sender: 'admin' })),
                                          ...(q.customerReplies || []).map(r => ({ ...r, sender: 'customer' }))
                                        ].sort((a, b) => new Date(a.repliedAt) - new Date(b.repliedAt));

                                        if (allReplies.length === 0) return null;

                                        return allReplies.map((r, ri) => (
                                          <div key={ri} style={{ 
                                            background: r.sender === 'admin' ? '#f0fdf4' : '#fffcf9', 
                                            border: `1px solid ${r.sender === 'admin' ? '#bbf7d0' : 'rgba(184,115,74,0.2)'}`, 
                                            borderRadius: '10px', padding: '10px 14px',
                                            marginLeft: r.sender === 'admin' ? '20px' : '0',
                                            marginRight: r.sender === 'customer' ? '20px' : '0'
                                          }}>
                                            <div style={{ fontSize: '0.78rem', color: r.sender === 'admin' ? '#16a34a' : '#b8734a', fontWeight: 700, marginBottom: '4px' }}>
                                              {r.sender === 'admin' ? 'Studio Reply' : 'Customer Follow-up'} · {new Date(r.repliedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <p style={{ margin: 0, color: r.sender === 'admin' ? '#166534' : '#3d2b1a', fontSize: '0.88rem', lineHeight: 1.5 }}>{r.text}</p>
                                          </div>
                                        ));
                                      })()}
                                    </div>

                                    {/* Reply composer */}
                                    <div style={{ background: '#f8f4ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '14px' }}>
                                      <span style={{ ...S.label, color: '#7c3aed', marginBottom: '8px' }}>✏️ Send a Reply to Customer</span>
                                      <p style={{ margin: '0 0 8px', fontSize: '0.76rem', color: '#9e7a5f' }}>
                                        The customer will see your reply when they tap <strong>📬 Check My Replies</strong> in the chatbot.
                                      </p>
                                      <textarea
                                        className="admin-input"
                                        rows={3}
                                        placeholder="Type your reply here..."
                                        value={replyInputs[q.queryId] || ''}
                                        onChange={e => setReplyInputs(prev => ({ ...prev, [q.queryId]: e.target.value }))}
                                        style={{ width: '100%', resize: 'vertical', marginBottom: '10px', boxSizing: 'border-box' }}
                                      />
                                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        {!q.isReadByAdmin && (
                                          <button
                                            onClick={() => markQueryRead(q.queryId)}
                                            style={{ ...S.btn('#fdf8f2', '#9e7a5f', '1px solid rgba(184,115,74,0.3)'), fontSize: '0.8rem', padding: '7px 14px', borderRadius: '8px' }}
                                          >
                                            ✓ Mark as Read
                                          </button>
                                        )}
                                        <button
                                          onClick={() => sendQueryReply(q.queryId)}
                                          disabled={sendingReply[q.queryId]}
                                          style={{ ...S.btn('linear-gradient(135deg,#7c3aed,#a855f7)', '#fff'), fontSize: '0.85rem', padding: '8px 20px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(124,58,237,0.3)', opacity: sendingReply[q.queryId] ? 0.6 : 1 }}
                                        >
                                          {sendingReply[q.queryId] ? 'Sending...' : '📨 Send Reply'}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ═══ ANALYTICS TAB ═══ */}
                  {activeTab === 'analytics' && (

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <StatsBar orders={orders} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {/* Source breakdown */}
                        <div style={{ ...S.card }}>
                          <h4 style={{ margin: 0, color: '#3d2b1a', fontSize: '1rem', fontWeight: 700 }}>📊 Order Sources</h4>
                          {[
                            { label: '🤖 AI Chatbot', count: orders.filter(o => o.source === 'AI_CHATBOT').length, color: '#16a34a' },
                            { label: '🌐 Web Form',   count: orders.filter(o => o.source === 'WEB_FORM').length,   color: '#2563eb' },
                          ].map(row => (
                            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#fdf8f2', borderRadius: '10px' }}>
                              <span style={{ fontWeight: 600, color: '#3d2b1a' }}>{row.label}</span>
                              <span style={{ fontWeight: 800, color: row.color, fontSize: '1.1rem' }}>{row.count}</span>
                            </div>
                          ))}
                        </div>
                        {/* Status breakdown */}
                        <div style={{ ...S.card }}>
                          <h4 style={{ margin: 0, color: '#3d2b1a', fontSize: '1rem', fontWeight: 700 }}>🔄 Status Breakdown</h4>
                          {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                            const count = orders.filter(o => o.status === status).length;
                            return (
                              <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: cfg.bg, borderRadius: '10px', border: `1px solid ${cfg.border}` }}>
                                <span style={{ fontWeight: 600, color: cfg.color, fontSize: '0.85rem' }}>{cfg.emoji} {status}</span>
                                <span style={{ fontWeight: 800, color: cfg.color }}>{count}</span>
                              </div>
                            );
                          })}
                        </div>
                        {/* Recent products */}
                        <div style={{ ...S.card, gridColumn: '1 / -1' }}>
                          <h4 style={{ margin: 0, color: '#3d2b1a', fontSize: '1rem', fontWeight: 700 }}>🎨 Most Ordered Products</h4>
                          {(() => {
                            const counts = {};
                            orders.forEach(o => { const k = o.product_required || 'Unknown'; counts[k] = (counts[k] || 0) + 1; });
                            const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
                            return sorted.length ? sorted.map(([name, count]) => (
                              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#fdf8f2', borderRadius: '8px' }}>
                                <span style={{ fontSize: '0.88rem', color: '#3d2b1a', fontWeight: 500 }}>{name}</span>
                                <span style={{ fontWeight: 800, color: '#b8734a' }}>{count} orders</span>
                              </div>
                            )) : <p style={{ color: '#9e7a5f', fontSize: '0.88rem' }}>No data yet.</p>;
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ═══ PRICE REFERENCE TAB ═══ */}
                  {activeTab === 'prices' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {[
                        { title: '🎨 Handmade & Resin Art', items: [
                          { name: 'Wedding Welcome Board (Calligraphy, A2)',    range: '₹800 – ₹1,800' },
                          { name: 'Wedding Welcome Board (Resin + Floral, A2)', range: '₹1,500 – ₹2,800' },
                          { name: 'Ring Ceremony Platter (Thaal)',              range: '₹1,200 – ₹2,400' },
                          { name: 'Resin Floral Keepsake / Preserved Flowers', range: '₹600 – ₹1,400' },
                          { name: 'Resin Art Round Coaster Set (4 pcs)',        range: '₹400 – ₹700' },
                          { name: 'Resin Serving Tray (Large)',                 range: '₹900 – ₹1,800' },
                          { name: 'Personalized Name Frame (A4)',               range: '₹450 – ₹900' },
                          { name: 'Personalized Gift Box / Hamper',             range: '₹700 – ₹1,500' },
                          { name: 'Calligraphy Wall Art (A3)',                  range: '₹500 – ₹1,000' },
                          { name: 'Custom Resin Keychain / Magnet Set',         range: '₹150 – ₹350 / pc' },
                        ]},
                        { title: '🖥️ Digital & Video Creations', items: [
                          { name: 'Pre-Wedding Video Poster (Animated)',        range: '₹300 – ₹700' },
                          { name: 'Instagram Reel & Story Design (set of 5)',   range: '₹250 – ₹600' },
                          { name: 'Digital Wedding Invitation (Animated)',      range: '₹400 – ₹900' },
                          { name: 'Custom Logo & Brand Identity Design',       range: '₹500 – ₹1,200' },
                          { name: 'Birthday / Anniversary Invitation Card',    range: '₹200 – ₹500' },
                          { name: 'Social Media Post Design (set of 10)',       range: '₹400 – ₹800' },
                        ]},
                      ].map(section => (
                        <div key={section.title} style={S.card}>
                          <h4 style={{ margin: '0 0 12px', color: '#3d2b1a', fontSize: '1rem', fontWeight: 700 }}>{section.title}</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0' }}>
                            <div style={{ display: 'contents', fontWeight: 700, fontSize: '0.75rem', color: '#9e7a5f', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                              <div style={{ padding: '6px 12px' }}>Item</div>
                              <div style={{ padding: '6px 12px', textAlign: 'right' }}>Price Range (INR)</div>
                            </div>
                            {section.items.map((item, i) => (
                              <div key={item.name} style={{ display: 'contents' }}>
                                <div style={{ padding: '10px 12px', background: i % 2 ? '#fdf8f2' : '#fff', borderRadius: '0', fontSize: '0.87rem', color: '#3d2b1a', fontWeight: 500 }}>{item.name}</div>
                                <div style={{ padding: '10px 12px', background: i % 2 ? '#fdf8f2' : '#fff', textAlign: 'right', fontWeight: 700, color: '#b8734a', fontSize: '0.9rem' }}>{item.range}</div>
                              </div>
                            ))}
                          </div>
                          <p style={{ margin: '12px 0 0', fontSize: '0.78rem', color: '#9e7a5f', fontStyle: 'italic' }}>
                            * Prices vary based on size, complexity & customization. Always confirm with customer before finalizing.
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StudioAdmin;
